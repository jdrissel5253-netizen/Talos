const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const db = require('../config/database');
const { candidateService } = require('../services/databaseService');
const { uploadResume } = require('../config/s3');
const { processResumeInBackground } = require('./applyRoutes');
const logger = require('../services/logger');

const INDEED_API_TOKEN     = process.env.INDEED_API_TOKEN || '';
const INDEED_CLIENT_SECRET = process.env.INDEED_CLIENT_SECRET || '';

const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const RESUME_FETCH_TIMEOUT_MS = 15000;

/**
 * Verify the X-Indeed-Signature header: base64 HMAC-SHA256 of the exact raw
 * request bytes (captured by bodyParser's `verify` hook in server.js).
 * Fails closed — callers must reject the request before this is reached if
 * INDEED_CLIENT_SECRET is unset.
 */
function verifyIndeedSignature(rawBody, signatureHeader) {
    if (!INDEED_CLIENT_SECRET || !rawBody || typeof signatureHeader !== 'string') return false;
    const expected = Buffer.from(
        crypto.createHmac('sha256', INDEED_CLIENT_SECRET).update(rawBody).digest('base64')
    );
    const received = Buffer.from(signatureHeader.trim());
    // timingSafeEqual throws on length mismatch, so check length first
    return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

/**
 * Only download resumes from Indeed-owned hosts over HTTPS. Prevents the
 * webhook from being used to make the server fetch arbitrary/internal URLs
 * (e.g. the EC2 instance metadata endpoint).
 */
function isAllowedResumeUrl(rawUrl) {
    let url;
    try { url = new URL(rawUrl); } catch { return false; }
    if (url.protocol !== 'https:') return false;
    if (url.username || url.password || url.port) return false;
    const host = url.hostname.toLowerCase();
    return host === 'indeed.com' || host.endsWith('.indeed.com');
}

async function downloadResume(rawUrl) {
    const response = await fetch(rawUrl, {
        redirect: 'error', // a redirect could bounce us off the allowlisted host
        signal: AbortSignal.timeout(RESUME_FETCH_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const declared = Number(response.headers.get('content-length') || 0);
    if (declared > MAX_RESUME_BYTES) throw new Error('resume exceeds size limit');
    const buf = Buffer.from(await response.arrayBuffer());
    if (buf.length > MAX_RESUME_BYTES) throw new Error('resume exceeds size limit');
    return buf;
}

/**
 * GET /api/indeed/health — Step 7
 * Integration health check for Indeed and internal monitoring.
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        integration: {
            apiTokenConfigured:     !!INDEED_API_TOKEN,
            clientSecretConfigured: !!INDEED_CLIENT_SECRET,
            feedUrl:                `${process.env.BASE_URL || 'https://gotalos.io'}/api/jobs/feed.xml`,
            webhookUrl:             `${process.env.BASE_URL || 'https://gotalos.io'}/api/indeed/apply`,
        }
    });
});

/**
 * POST /api/indeed/apply — Step 5
 * Indeed Apply webhook — called by Indeed when a candidate applies via Indeed Apply.
 * Payload fields: applicantName, applicantEmail, applicantPhone, jobId, jobTitle,
 *                 indeedApplyId (or applicationId), resumeBase64, resumefileURL,
 *                 resumeFileName, coverletter
 */
router.post('/apply', async (req, res) => {
    // Authenticate before acknowledging. Until Indeed credentials are
    // configured the endpoint is disabled rather than open.
    if (!INDEED_CLIENT_SECRET) {
        logger.warn('Indeed webhook: rejected — INDEED_CLIENT_SECRET not configured');
        return res.status(503).json({ status: 'error', message: 'Integration not configured' });
    }
    if (!verifyIndeedSignature(req.rawBody, req.headers['x-indeed-signature'])) {
        logger.warn('Indeed webhook: invalid signature — request rejected', { ip: req.ip });
        return res.status(401).json({ status: 'error', message: 'Invalid signature' });
    }

    // Respond immediately — Indeed requires a fast acknowledgement
    res.status(200).json({ status: 'received' });

    try {
        const payload = req.body;

        const name = payload.applicantName
            || [payload.firstName, payload.lastName].filter(Boolean).join(' ')
            || '';
        const email       = (payload.applicantEmail || '').trim().toLowerCase();
        const phone       = payload.applicantPhone || '';
        const jobId       = payload.jobId ? parseInt(payload.jobId, 10) : null;
        const jobTitle    = payload.jobTitle || '';
        const indeedApplyId = payload.indeedApplyId || payload.applicationId || payload.applyId || null;

        if (!email) {
            logger.warn('Indeed webhook: payload missing applicant email', { jobId });
            return;
        }

        // Deduplicate: same email + same job within 24 hours
        if (jobId) {
            const isDuplicate = await candidateService.hasRecentApplication(email, jobId);
            if (isDuplicate) {
                logger.info('Indeed webhook: duplicate application skipped', { email, jobId });
                return;
            }
        }

        // Resolve resume to a buffer
        let fileBuffer, fileName;
        if (payload.resumeBase64) {
            fileBuffer = Buffer.from(payload.resumeBase64, 'base64');
            fileName   = payload.resumeFileName || `indeed_${Date.now()}.pdf`;
        } else if (payload.resumefileURL) {
            if (!isAllowedResumeUrl(payload.resumefileURL)) {
                logger.warn('Indeed webhook: resume URL not on allowlist — skipped', { url: String(payload.resumefileURL).slice(0, 200) });
                return;
            }
            try {
                fileBuffer = await downloadResume(payload.resumefileURL);
            } catch (err) {
                logger.error('Indeed webhook: failed to download resume', { url: payload.resumefileURL, error: err.message });
                return;
            }
            fileName   = payload.resumeFileName || `indeed_${Date.now()}.pdf`;
        } else {
            logger.warn('Indeed webhook: no resume in payload', { email, jobId });
            return;
        }

        // Upload to S3 and create candidate record
        const s3Key   = await uploadResume(fileBuffer, fileName);
        const candidate = await candidateService.create(null, fileName, s3Key, email);

        // Store the Indeed Apply ID so we can send dispositions back later (Step 9)
        if (indeedApplyId) {
            await db.query(
                'UPDATE candidates SET indeed_apply_id = $1 WHERE id = $2',
                [indeedApplyId, candidate.id]
            );
        }

        logger.info('Indeed application received', { candidateId: candidate.id, jobId, jobTitle, email, indeedApplyId });

        // Reuse the same background analysis + pipeline flow as direct applications
        processResumeInBackground(candidate, s3Key, name, email, phone, jobId, jobTitle);

    } catch (err) {
        logger.error('Indeed webhook: unhandled error', { error: err.message, stack: err.stack });
    }
});

module.exports = router;
