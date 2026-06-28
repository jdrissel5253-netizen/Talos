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

/**
 * Verify the X-Indeed-Signature header using HMAC-SHA256.
 * No-ops until INDEED_CLIENT_SECRET is set.
 * TODO: switch to raw-body middleware once credentials arrive for exact byte-level matching.
 */
function verifyIndeedSignature(rawBody, signatureHeader) {
    if (!INDEED_CLIENT_SECRET) return true;
    if (!signatureHeader) return false;
    const expected = crypto
        .createHmac('sha256', INDEED_CLIENT_SECRET)
        .update(rawBody)
        .digest('base64');
    return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
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
    // Respond immediately — Indeed requires a fast acknowledgement
    res.status(200).json({ status: 'received' });

    try {
        const payload = req.body;

        // Signature check (no-op until INDEED_CLIENT_SECRET is set)
        const rawBody = JSON.stringify(payload);
        if (!verifyIndeedSignature(rawBody, req.headers['x-indeed-signature'])) {
            logger.warn('Indeed webhook: invalid signature — request rejected');
            return;
        }

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
            const response = await fetch(payload.resumefileURL);
            if (!response.ok) {
                logger.error('Indeed webhook: failed to download resume', { url: payload.resumefileURL });
                return;
            }
            fileBuffer = Buffer.from(await response.arrayBuffer());
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
