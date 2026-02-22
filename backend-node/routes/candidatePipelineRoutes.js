const express = require('express');
const router = express.Router();
const { candidatePipelineService, sanitize } = require('../services/databaseService');
const gmailService = require('../services/gmailService');
const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../services/logger');

// Initialize Anthropic client for automated messaging
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

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
            limit           // Results per page (default 50, max 100)
        } = req.query;

        const validTiers = ['green', 'yellow', 'red'];
        const validStatuses = ['new', 'approved', 'contacted', 'backup', 'rejected'];

        const parsedMinScore = minScore ? sanitize.nonNegativeNumber(minScore) : undefined;
        const parsedMaxScore = maxScore ? sanitize.nonNegativeNumber(maxScore) : undefined;

        const talentPool = await candidatePipelineService.getTalentPool({
            tier: tier ? sanitize.enumValue(tier, validTiers) : undefined,
            position: position ? sanitize.trimString(position, 100) : undefined,
            minScore: parsedMinScore !== null ? Math.min(parsedMinScore || 0, 100) : undefined,
            maxScore: parsedMaxScore !== null ? Math.min(parsedMaxScore || 100, 100) : undefined,
            status: status ? sanitize.enumValue(status, validStatuses) : undefined,
            sortBy: sortBy || 'score',
            sortOrder: sortOrder || 'desc',
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 50
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
        const stats = await candidatePipelineService.getTalentPoolStats();

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
            model: "claude-3-haiku-20240307",
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
            model: "claude-3-haiku-20240307",
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
            model: "claude-3-haiku-20240307",
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

module.exports = router;
