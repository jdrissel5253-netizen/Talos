const express = require('express');
const router = express.Router();
const fs = require('fs');
const db = require('../config/database');
const { candidatePipelineService, sanitize } = require('../services/databaseService');
const gmailService = require('../services/gmailService');
const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../services/logger');
const { analyzeResume, extractResumeText, recommendBestFitPosition } = require('../services/resumeAnalyzer');
const { calculateTier, calculateStarRating, determineGiveThemAChance } = require('../services/scoringService');
const { downloadResumeToTemp, isS3Key } = require('../config/s3');

// Initialize Anthropic client for automated messaging
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

async function assertPipelineOwner(pipelineId, user) {
    if (user.role === 'admin') return;
    const ownerUserId = await candidatePipelineService.getPipelineJobUserId(pipelineId);
    if (ownerUserId === null || ownerUserId !== user.userId) {
        const err = new Error('Access denied');
        err.statusCode = 403;
        throw err;
    }
}

// Mirror databaseService's array/number helpers so analyses upserts work for both PG and SQLite
const USE_POSTGRES_DB = process.env.USE_POSTGRES === 'true' || process.env.NODE_ENV === 'production';
const toNum = (v) => { const n = Number(v); return isNaN(n) ? 0 : n; };
const toArr = (v) => {
    if (!v) return USE_POSTGRES_DB ? [] : '[]';
    if (Array.isArray(v)) return USE_POSTGRES_DB ? v.map(String) : JSON.stringify(v);
    return USE_POSTGRES_DB ? [String(v)] : JSON.stringify([v]);
};

/**
 * GET /api/pipeline/talent-pool
 * Get all candidates in the talent pool with filtering and sorting
 */
router.get('/talent-pool', async (req, res) => {
    try {
        const {
            tier,           // Filter by tier: green, yellow, red
            position,       // Filter by position
            minScore,       // Minimum overall score
            maxScore,       // Maximum overall score
            status,         // Filter by pipeline status
            sortBy,         // Sort field: score, date, name
            sortOrder,      // Sort order: asc, desc
            page,           // Page number (default 1)
            limit,          // Results per page (default 50, max 100)
            minExperience,  // Minimum years of experience
            hasCertifications, // Only candidates with certifications
            city            // Filter by job city/location
        } = req.query;

        const validTiers = ['green', 'yellow', 'red'];
        const validStatuses = ['new', 'approved', 'contacted', 'backup', 'rejected'];

        const parsedMinScore = minScore ? sanitize.nonNegativeNumber(minScore) : undefined;
        const parsedMaxScore = maxScore ? sanitize.nonNegativeNumber(maxScore) : undefined;

        const userId = req.user.role === 'admin' ? undefined : req.user.userId;

        const talentPool = await candidatePipelineService.getTalentPool({
            userId,
            tier: tier ? sanitize.enumValue(tier, validTiers) : undefined,
            position: position ? sanitize.trimString(position, 100) : undefined,
            minScore: parsedMinScore !== null ? Math.min(parsedMinScore || 0, 100) : undefined,
            maxScore: parsedMaxScore !== null ? Math.min(parsedMaxScore || 100, 100) : undefined,
            status: status ? sanitize.enumValue(status, validStatuses) : undefined,
            sortBy: sortBy || 'score',
            sortOrder: sortOrder || 'desc',
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 50,
            minExperience: minExperience ? sanitize.nonNegativeNumber(minExperience) : undefined,
            hasCertifications: hasCertifications === 'true',
            city: city ? sanitize.trimString(city, 100) : undefined,
        });

        res.json({
            status: 'success',
            data: {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 50,
                count: talentPool.length,
                candidates: talentPool
            }
        });
    } catch (error) {
        logger.error('Error fetching talent pool', { error: error.message, stack: error.stack });
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch talent pool'
        });
    }
});

/**
 * GET /api/pipeline/talent-pool/stats
 * Get talent pool statistics (tier distribution, position breakdown, etc.)
 */
router.get('/talent-pool/stats', async (req, res) => {
    try {
        const userId = req.user.role === 'admin' ? null : req.user.userId;
        const stats = await candidatePipelineService.getTalentPoolStats(userId);

        res.json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        logger.error('Error fetching talent pool stats', { error: error.message, stack: error.stack });
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch talent pool stats'
        });
    }
});

/**
 * GET /api/pipeline/person-applications/:pipelineId
 * All jobs a person applied to, looked up by any one of their pipeline IDs
 */
router.get('/person-applications/:pipelineId', async (req, res) => {
    try {
        const pipelineId = sanitize.positiveInt(req.params.pipelineId);
        if (!pipelineId) {
            return res.status(400).json({ status: 'error', message: 'Invalid pipeline ID' });
        }
        const applications = await candidatePipelineService.getPersonApplications(pipelineId);
        res.json({ status: 'success', data: applications });
    } catch (error) {
        logger.error('Error fetching person applications', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to fetch applications' });
    }
});

/**
 * PUT /api/pipeline/:id/notes
 * Save internal notes for a candidate
 */
router.put('/:id/notes', async (req, res) => {
    try {
        const pipelineId = sanitize.positiveInt(req.params.id);
        if (!pipelineId) return res.status(400).json({ status: 'error', message: 'Invalid pipeline ID' });

        const notes = sanitize.trimString(req.body.notes ?? '', 2000);

        await db.query(
            `UPDATE candidate_pipeline SET internal_notes = $1 WHERE id = $2`,
            [notes || null, pipelineId]
        );

        res.json({ status: 'success' });
    } catch (error) {
        logger.error('Error saving candidate notes', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to save notes' });
    }
});

/**
 * PUT /api/pipeline/:id/email
 * Update the applicant email for the candidate linked to this pipeline entry
 */
router.put('/:id/email', async (req, res) => {
    try {
        const pipelineId = sanitize.positiveInt(req.params.id);
        if (!pipelineId) return res.status(400).json({ status: 'error', message: 'Invalid pipeline ID' });

        await assertPipelineOwner(pipelineId, req.user);

        const email = sanitize.email(req.body.email) || null;

        await db.query(
            `UPDATE candidates SET applicant_email = $1
             WHERE id = (SELECT candidate_id FROM candidate_pipeline WHERE id = $2)`,
            [email, pipelineId]
        );

        res.json({ status: 'success', data: { email } });
    } catch (error) {
        logger.error('Error updating candidate email', { error: error.message });
        const code = error.statusCode || 500;
        res.status(code).json({ status: 'error', message: code === 500 ? 'Failed to update email' : error.message });
    }
});

/**
 * PUT /api/pipeline/:id/status
 * Update pipeline status for a candidate
 */
router.put('/:id/status', async (req, res) => {
    try {
        const pipelineId = sanitize.positiveInt(req.params.id);
        if (!pipelineId) {
            return res.status(400).json({ status: 'error', message: 'Invalid pipeline ID' });
        }
        const validStatuses = ['new', 'approved', 'contacted', 'backup', 'rejected'];
        const status = sanitize.enumValue(req.body.status, validStatuses);
        if (!status) {
            return res.status(400).json({ status: 'error', message: 'Valid status is required (new, approved, contacted, backup, rejected)' });
        }

        await assertPipelineOwner(pipelineId, req.user);

        const updated = await candidatePipelineService.updateStatus(pipelineId, status);

        res.json({
            status: 'success',
            data: { pipeline: updated }
        });
    } catch (error) {
        logger.error('Error updating pipeline status', { error: error.message, stack: error.stack });
        const code = error.statusCode || 500;
        res.status(code).json({
            status: 'error',
            message: code === 500 ? 'Failed to update pipeline status' : error.message
        });
    }
});

/**
 * POST /api/pipeline/bulk-update
 * Bulk update pipeline status for multiple candidates
 */
router.post('/bulk-update', async (req, res) => {
    try {
        const { candidatePipelineIds, status } = req.body;

        if (!Array.isArray(candidatePipelineIds) || candidatePipelineIds.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'candidatePipelineIds must be a non-empty array'
            });
        }

        if (req.user.role !== 'admin') {
            const owned = await candidatePipelineService.verifyPipelineOwnership(candidatePipelineIds, req.user.userId);
            if (!owned) {
                return res.status(403).json({ status: 'error', message: 'Access denied' });
            }
        }

        const updated = await candidatePipelineService.bulkUpdateStatus(candidatePipelineIds, status);

        res.json({
            status: 'success',
            data: {
                updated: updated.length,
                pipelines: updated
            }
        });
    } catch (error) {
        logger.error('Error bulk updating pipeline', { error: error.message, stack: error.stack });
        const code = error.statusCode || 500;
        res.status(code).json({
            status: 'error',
            message: code === 500 ? 'Failed to bulk update pipeline' : error.message
        });
    }
});

/**
 * POST /api/pipeline/:id/message
 * Send template-based message to candidate
 */
router.post('/:id/message', async (req, res) => {
    try {
        const pipelineId = sanitize.positiveInt(req.params.id);
        if (!pipelineId) {
            return res.status(400).json({ status: 'error', message: 'Invalid pipeline ID' });
        }

        const communicationType = sanitize.enumValue(req.body.communicationType, ['email', 'sms']);
        const messageContent = sanitize.trimString(req.body.messageContent, 5000);
        const messageSubject = sanitize.trimString(req.body.messageSubject, 255);
        const category = sanitize.enumValue(req.body.category, ['contact', 'rejection']);
        const templateType = sanitize.enumValue(req.body.templateType, ['video', 'phone', 'in-person']);
        const templateTone = sanitize.enumValue(req.body.templateTone, ['conversational', 'friendly', 'professional']);
        const isNudge = req.body.isNudge;
        const schedulingLink = sanitize.trimString(req.body.schedulingLink, 500);
        const candidateName = sanitize.trimString(req.body.candidateName, 255);
        const jobTitle = sanitize.trimString(req.body.jobTitle, 255);
        const recipientEmail = sanitize.email(req.body.recipientEmail);

        if (!messageContent) {
            return res.status(400).json({
                status: 'error',
                message: 'Message content is required'
            });
        }

        if (!communicationType) {
            return res.status(400).json({
                status: 'error',
                message: 'Valid communication type is required (email or sms)'
            });
        }

        // Validate email recipient upfront
        if (communicationType === 'email' && !recipientEmail) {
            return res.status(400).json({
                status: 'error',
                message: 'A valid recipient email is required'
            });
        }

        await assertPipelineOwner(pipelineId, req.user);

        // Step 1: Log communication with 'pending' status BEFORE sending
        const commLog = await candidatePipelineService.logCommunication(
            pipelineId,
            communicationType,
            messageContent,
            {
                templateType,
                templateTone,
                isNudge,
                schedulingLink,
                category,
                initialStatus: 'pending'
            }
        );

        // Step 2: Send the email
        if (communicationType === 'email') {
            try {
                await gmailService.sendEmail({
                    to: recipientEmail,
                    subject: messageSubject || `Regarding your application for ${jobTitle}`,
                    body: messageContent
                });
                // Step 3a: Update log status to 'sent' on success
                await candidatePipelineService.updateCommunicationStatus(commLog.id, 'sent');
            } catch (emailError) {
                logger.error('Failed to send email', { pipelineId, error: emailError.message, stack: emailError.stack });
                // Step 3b: Update log status to 'failed' on error
                await candidatePipelineService.updateCommunicationStatus(commLog.id, 'failed');
                return res.status(500).json({
                    status: 'error',
                    message: 'Failed to send email. Please try again.'
                });
            }
        } else {
            // For non-email (SMS), mark as sent immediately
            await candidatePipelineService.updateCommunicationStatus(commLog.id, 'sent');
        }

        res.json({
            status: 'success',
            data: {
                message: messageContent,
                subject: messageSubject,
                communicationLog: commLog
            }
        });
    } catch (error) {
        logger.error('Error sending message', { error: error.message, stack: error.stack });
        res.status(500).json({
            status: 'error',
            message: 'Failed to send message'
        });
    }
});

/**
 * POST /api/pipeline/:id/reject
 * Reject candidate without sending a message (silent rejection)
 */
router.post('/:id/reject', async (req, res) => {
    try {
        const pipelineId = sanitize.positiveInt(req.params.id);
        if (!pipelineId) {
            return res.status(400).json({ status: 'error', message: 'Invalid pipeline ID' });
        }

        await assertPipelineOwner(pipelineId, req.user);

        // Update pipeline_status to 'rejected'
        await candidatePipelineService.updateStatus(pipelineId, 'rejected');

        res.json({
            status: 'success',
            message: 'Candidate rejected successfully'
        });
    } catch (error) {
        logger.error('Error rejecting candidate', { error: error.message, stack: error.stack });
        const code = error.statusCode || 500;
        res.status(code).json({
            status: 'error',
            message: code === 500 ? 'Failed to reject candidate' : error.message
        });
    }
});

/**
 * POST /api/pipeline/bulk-message
 * Send bulk messages to multiple candidates
 */
router.post('/bulk-message', async (req, res) => {
    try {
        const { candidatePipelineIds, messageType, jobTitle, jobLocation, schedulingLink } = req.body;

        if (!Array.isArray(candidatePipelineIds) || candidatePipelineIds.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'candidatePipelineIds must be a non-empty array'
            });
        }

        const results = [];

        for (const pipelineId of candidatePipelineIds) {
            try {
                let messageContent;

                if (messageType === 'rejection_email') {
                    messageContent = await generateRejectionEmail(jobTitle);
                } else if (messageType === 'sms') {
                    messageContent = await generateOutreachSMS(jobTitle, jobLocation, schedulingLink);
                } else if (messageType === 'email') {
                    messageContent = await generateOutreachEmail(jobTitle, jobLocation, schedulingLink);
                }

                const commLog = await candidatePipelineService.logCommunication(
                    pipelineId,
                    messageType,
                    messageContent
                );

                if (messageType !== 'rejection_email') {
                    await candidatePipelineService.updateStatus(pipelineId, 'contacted');
                } else {
                    await candidatePipelineService.updateStatus(pipelineId, 'rejected');
                }

                results.push({
                    pipelineId,
                    success: true,
                    message: messageContent
                });
            } catch (error) {
                results.push({
                    pipelineId,
                    success: false,
                    error: error.message
                });
            }
        }

        res.json({
            status: 'success',
            data: {
                totalProcessed: results.length,
                successful: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length,
                results
            }
        });
    } catch (error) {
        logger.error('Error sending bulk messages', { error: error.message, stack: error.stack });
        res.status(500).json({
            status: 'error',
            message: 'Failed to send bulk messages'
        });
    }
});

/**
 * GET /api/pipeline/:id/communications
 * Get communication history for a candidate
 */
router.get('/:id/communications', async (req, res) => {
    try {
        const pipelineId = sanitize.positiveInt(req.params.id);
        if (!pipelineId) {
            return res.status(400).json({ status: 'error', message: 'Invalid pipeline ID' });
        }
        const communications = await candidatePipelineService.getCommunicationHistory(pipelineId);

        res.json({
            status: 'success',
            data: { communications }
        });
    } catch (error) {
        logger.error('Error fetching communications', { error: error.message, stack: error.stack });
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch communications'
        });
    }
});

/**
 * PUT /api/pipeline/:id/contact-status
 * Update the contacted/uncontacted status for a candidate
 */
router.put('/:id/contact-status', async (req, res) => {
    try {
        const pipelineId = sanitize.positiveInt(req.params.id);
        if (!pipelineId) {
            return res.status(400).json({ status: 'error', message: 'Invalid pipeline ID' });
        }
        const { isContacted, contactedVia } = req.body;

        await assertPipelineOwner(pipelineId, req.user);

        const updated = await candidatePipelineService.updateContactStatus(
            pipelineId,
            isContacted,
            contactedVia
        );

        res.json({
            status: 'success',
            data: { pipeline: updated }
        });
    } catch (error) {
        logger.error('Error updating contact status', { error: error.message, stack: error.stack });
        res.status(500).json({
            status: 'error',
            message: 'Failed to update contact status'
        });
    }
});

/**
 * POST /api/pipeline/:id/find-best-fit
 * Re-analyze a General Talent Pool candidate's resume to identify which
 * position they're the strongest fit for, then re-score them against that
 * position's evaluation framework.
 */
router.post('/:id/find-best-fit', async (req, res) => {
    let tempPath = null;
    try {
        const pipelineId = sanitize.positiveInt(req.params.id);
        if (!pipelineId) {
            return res.status(400).json({ status: 'error', message: 'Invalid pipeline ID' });
        }

        await assertPipelineOwner(pipelineId, req.user);

        const { rows } = await db.query(`
            SELECT cp.id as pipeline_id, cp.candidate_id, cp.job_id,
                   c.file_path, c.filename,
                   j.required_years_experience, j.flexible_on_title, j.city, j.zip_code
            FROM candidate_pipeline cp
            JOIN candidates c ON cp.candidate_id = c.id
            JOIN jobs j ON cp.job_id = j.id
            WHERE cp.id = $1
        `, [pipelineId]);

        const row = rows[0];
        if (!row) {
            return res.status(404).json({ status: 'error', message: 'Candidate not found' });
        }
        if (!row.file_path) {
            return res.status(400).json({ status: 'error', message: 'No resume on file for this candidate' });
        }

        // Download resume from S3 if needed
        const filePath = isS3Key(row.file_path)
            ? (tempPath = await downloadResumeToTemp(row.file_path))
            : row.file_path;

        if (!fs.existsSync(filePath)) {
            return res.status(400).json({ status: 'error', message: 'Resume file not found' });
        }

        // Stage 1: identify the best-fit position from resume content
        const resumeText = await extractResumeText(filePath);
        const { bestFitPosition, reasoning, runnerUpPosition } = await recommendBestFitPosition(resumeText);

        // Stage 2: score the resume against that position's evaluation framework
        const requiredYears = row.required_years_experience || 2;
        const flexibleOnTitle = row.flexible_on_title !== false;
        const jobLocation = [row.city, row.zip_code].filter(Boolean).join(', ') || null;
        const analysis = await analyzeResume(filePath, bestFitPosition, requiredYears, flexibleOnTitle, jobLocation);
        tempPath = null; // analyzeResume deletes the file itself

        const score = toNum(analysis.overallScore);
        const tier = calculateTier(score);
        const starRating = calculateStarRating(score);
        const giveThemAChance = determineGiveThemAChance({
            score,
            yearsOfExperience: analysis.experience?.yearsOfExperience,
            requiredYears,
            certificationsScore: analysis.certifications?.score,
            technicalSkillsScore: analysis.technicalSkills?.score,
            presentationScore: analysis.presentationQuality?.score,
            summary: analysis.summary
        });
        const aiSummary = `Best Fit: ${bestFitPosition}. Score: ${score}/100. ${analysis.hiringRecommendation || ''}. ${analysis.summary || ''}`.trim();

        // Upsert the analyses record
        await db.query(`
            INSERT INTO analyses (
                candidate_id, overall_score, score_out_of_10, summary,
                technical_skills_score, technical_skills_found, technical_skills_missing, technical_skills_feedback,
                certifications_score, certifications_found, certifications_recommended, certifications_feedback,
                experience_score, years_of_experience, relevant_experience, experience_feedback,
                presentation_score, presentation_strengths, presentation_improvements, presentation_feedback,
                strengths, weaknesses, recommendations, hiring_recommendation
            ) VALUES (
                $1, $2, $3, $4,
                $5, $6, $7, $8,
                $9, $10, $11, $12,
                $13, $14, $15, $16,
                $17, $18, $19, $20,
                $21, $22, $23, $24
            )
            ON CONFLICT (candidate_id) DO UPDATE SET
                overall_score              = excluded.overall_score,
                score_out_of_10            = excluded.score_out_of_10,
                summary                    = excluded.summary,
                technical_skills_score     = excluded.technical_skills_score,
                technical_skills_found     = excluded.technical_skills_found,
                technical_skills_missing   = excluded.technical_skills_missing,
                technical_skills_feedback  = excluded.technical_skills_feedback,
                certifications_score       = excluded.certifications_score,
                certifications_found       = excluded.certifications_found,
                certifications_recommended = excluded.certifications_recommended,
                certifications_feedback    = excluded.certifications_feedback,
                experience_score           = excluded.experience_score,
                years_of_experience        = excluded.years_of_experience,
                relevant_experience        = excluded.relevant_experience,
                experience_feedback        = excluded.experience_feedback,
                presentation_score         = excluded.presentation_score,
                presentation_strengths     = excluded.presentation_strengths,
                presentation_improvements  = excluded.presentation_improvements,
                presentation_feedback      = excluded.presentation_feedback,
                strengths                  = excluded.strengths,
                weaknesses                 = excluded.weaknesses,
                recommendations            = excluded.recommendations,
                hiring_recommendation      = excluded.hiring_recommendation,
                updated_at                 = CURRENT_TIMESTAMP
        `, [
            row.candidate_id,
            toNum(analysis.overallScore), Math.round(score / 10), analysis.summary || '',
            toNum(analysis.technicalSkills?.score), toArr(analysis.technicalSkills?.found), toArr(analysis.technicalSkills?.missing), analysis.technicalSkills?.feedback || '',
            toNum(analysis.certifications?.score), toArr(analysis.certifications?.found), toArr(analysis.certifications?.recommended), analysis.certifications?.feedback || '',
            toNum(analysis.experience?.score), analysis.experience?.yearsOfExperience || 0, toArr(analysis.experience?.relevantExperience), analysis.experience?.feedback || '',
            toNum(analysis.presentationQuality?.score), toArr(analysis.presentationQuality?.strengths), toArr(analysis.presentationQuality?.improvements), analysis.presentationQuality?.feedback || '',
            toArr(analysis.strengths), toArr(analysis.weaknesses), toArr(analysis.recommendations), analysis.hiringRecommendation || 'MAYBE'
        ]);

        // Update the pipeline entry with the new best-fit position and score
        const { rows: updatedRows } = await db.query(`
            UPDATE candidate_pipeline
            SET tier = $1, tier_score = $2, star_rating = $3, give_them_a_chance = $4,
                ai_summary = $5, evaluated_position = $6
            WHERE id = $7
            RETURNING tier, tier_score, star_rating, give_them_a_chance, ai_summary, evaluated_position
        `, [tier, Math.round(score), starRating, giveThemAChance, aiSummary, bestFitPosition, pipelineId]);

        res.json({
            status: 'success',
            data: {
                ...updatedRows[0],
                years_of_experience: analysis.experience?.yearsOfExperience || 0,
                certifications_found: analysis.certifications?.found || [],
                hiring_recommendation: analysis.hiringRecommendation,
                strengths: analysis.strengths || [],
                weaknesses: analysis.weaknesses || [],
                summary: analysis.summary,
                reasoning,
                runnerUpPosition
            }
        });
    } catch (error) {
        if (error.code === 'EMPTY_RESUME') {
            return res.status(422).json({ status: 'error', message: error.message });
        }
        logger.error('Error finding best fit', { error: error.message, stack: error.stack });
        const code = error.statusCode || 500;
        res.status(code).json({ status: 'error', message: code === 500 ? 'Failed to find best fit' : error.message });
    } finally {
        if (tempPath) {
            try { fs.unlinkSync(tempPath); } catch (_) {}
        }
    }
});

/**
 * GET /api/pipeline/candidate/:candidateId/job-matches
 * Re-evaluate a candidate against all jobs and return ranked matches
 */
router.get('/candidate/:candidateId/job-matches', async (req, res) => {
    try {
        const candidateId = sanitize.positiveInt(req.params.candidateId);
        if (!candidateId) {
            return res.status(400).json({ status: 'error', message: 'Invalid candidate ID' });
        }
        const jobMatches = await candidatePipelineService.evaluateCandidateAcrossAllJobs(candidateId);

        res.json({
            status: 'success',
            data: { matches: jobMatches }
        });
    } catch (error) {
        logger.error('Error evaluating candidate job matches', { error: error.message, stack: error.stack });
        res.status(500).json({
            status: 'error',
            message: 'Failed to evaluate job matches'
        });
    }
});

/**
 * DELETE /api/pipeline/:id
 * Remove a candidate from the pipeline/talent pool
 */
router.delete('/:id', async (req, res) => {
    try {
        const pipelineId = sanitize.positiveInt(req.params.id);
        if (!pipelineId) {
            return res.status(400).json({ status: 'error', message: 'Invalid pipeline ID' });
        }

        await assertPipelineOwner(pipelineId, req.user);

        const removed = await candidatePipelineService.removeFromPipeline(pipelineId);
        if (!removed) {
            return res.status(404).json({ status: 'error', message: 'Candidate not found in pipeline' });
        }
        res.json({ status: 'success', message: 'Candidate removed from pipeline' });
    } catch (error) {
        logger.error('Error removing candidate from pipeline', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to remove candidate' });
    }
});

/**
 * Helper: Generate automated SMS outreach using Claude Haiku
 */
async function generateOutreachSMS(jobTitle, jobLocation, schedulingLink) {
    try {
        const prompt = `Generate a professional, concise SMS text message for HVAC job outreach.

Job Details:
- Position: ${jobTitle}
- Location: ${jobLocation}
- Scheduling Link: ${schedulingLink || '[Scheduling link]'}

Requirements:
- Keep it under 160 characters if possible (max 200)
- Friendly and professional tone
- Reference the job title and location
- Include the scheduling link
- Brief and to-the-point

Generate the SMS text:`;

        const message = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 150,
            temperature: 0.5,
            messages: [{
                role: "user",
                content: prompt
            }]
        });

        return message.content[0].text.trim();
    } catch (error) {
        logger.error('Error generating SMS', { error: error.message });
        return `Hi! We found your resume for our ${jobTitle} position in ${jobLocation}. Interested? Schedule an interview: ${schedulingLink || '[link]'}`;
    }
}

/**
 * Helper: Generate automated email outreach using Claude Haiku
 */
async function generateOutreachEmail(jobTitle, jobLocation, schedulingLink) {
    try {
        const prompt = `Generate a professional email for HVAC job outreach.

Job Details:
- Position: ${jobTitle}
- Location: ${jobLocation}
- Scheduling Link: ${schedulingLink || '[Scheduling link]'}

Requirements:
- Professional subject line
- Warm, friendly opening
- Brief description of the opportunity
- Include scheduling link
- Professional closing
- Keep it concise (3-4 paragraphs max)

Generate the complete email:`;

        const message = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 500,
            temperature: 0.5,
            messages: [{
                role: "user",
                content: prompt
            }]
        });

        return message.content[0].text.trim();
    } catch (error) {
        logger.error('Error generating email', { error: error.message });
        return `Subject: Opportunity: ${jobTitle} - ${jobLocation}

Dear Candidate,

We came across your resume and believe you could be a great fit for our ${jobTitle} position in ${jobLocation}.

We'd love to discuss this opportunity with you. Please use the following link to schedule an interview at your convenience: ${schedulingLink || '[Scheduling link]'}

Looking forward to speaking with you soon!

Best regards,
The Hiring Team`;
    }
}

/**
 * Helper: Generate rejection email using Claude Haiku
 */
async function generateRejectionEmail(jobTitle) {
    try {
        const prompt = `Generate a professional, respectful rejection email for an HVAC job application.

Job: ${jobTitle}

Requirements:
- Polite and respectful tone
- Thank them for their application
- Brief and professional
- Encourage them to apply for future positions
- No false hope
- Keep it concise (2-3 paragraphs)

Generate the email:`;

        const message = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 400,
            temperature: 0.5,
            messages: [{
                role: "user",
                content: prompt
            }]
        });

        return message.content[0].text.trim();
    } catch (error) {
        logger.error('Error generating rejection email', { error: error.message });
        return `Subject: Update on Your Application for ${jobTitle}

Dear Candidate,

Thank you for your interest in the ${jobTitle} position and for taking the time to submit your application.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs. We appreciate your interest in joining our team and encourage you to apply for future opportunities that align with your skills and experience.

We wish you the best in your job search.

Best regards,
The Hiring Team`;
    }
}

/**
 * GET /api/pipeline/:id/profile
 * Get full profile for a single candidate pipeline entry
 */
router.get('/:id/profile', async (req, res) => {
    try {
        const pipelineId = sanitize.positiveInt(req.params.id);
        if (!pipelineId) {
            return res.status(400).json({ status: 'error', message: 'Invalid pipeline ID' });
        }
        const profile = await candidatePipelineService.getCandidateProfile(pipelineId);
        if (!profile) {
            return res.status(404).json({ status: 'error', message: 'Candidate not found' });
        }
        res.json({ status: 'success', data: profile });
    } catch (error) {
        logger.error('Error fetching candidate profile', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to fetch candidate profile' });
    }
});

module.exports = router;
