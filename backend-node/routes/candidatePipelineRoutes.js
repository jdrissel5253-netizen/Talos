const express = require('express');
const router = express.Router();
const { candidatePipelineService } = require('../services/databaseService');
const Anthropic = require('@anthropic-ai/sdk');

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
            sortOrder       // Sort order: asc, desc
        } = req.query;

        const talentPool = await candidatePipelineService.getTalentPool({
            tier,
            position,
            minScore: minScore ? parseInt(minScore) : undefined,
            maxScore: maxScore ? parseInt(maxScore) : undefined,
            status,
            sortBy: sortBy || 'score',
            sortOrder: sortOrder || 'desc'
        });

        res.json({
            status: 'success',
            data: {
                total: talentPool.length,
                candidates: talentPool
            }
        });
    } catch (error) {
        console.error('Error fetching talent pool:', error);
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
        console.error('Error fetching talent pool stats:', error);
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
        const pipelineId = parseInt(req.params.id);
        const { status } = req.body; // approved, contacted, backup, rejected

        const updated = await candidatePipelineService.updateStatus(pipelineId, status);

        res.json({
            status: 'success',
            data: { pipeline: updated }
        });
    } catch (error) {
        console.error('Error updating pipeline status:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update pipeline status'
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
        console.error('Error bulk updating pipeline:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to bulk update pipeline'
        });
    }
});

/**
 * POST /api/pipeline/:id/message
 * Send automated message to candidate
 */
router.post('/:id/message', async (req, res) => {
    try {
        const pipelineId = parseInt(req.params.id);
        const { messageType, jobTitle, jobLocation, schedulingLink } = req.body;
        // messageType: 'sms', 'email', 'rejection_email'

        let messageContent;

        if (messageType === 'rejection_email') {
            messageContent = await generateRejectionEmail(jobTitle);
        } else if (messageType === 'sms') {
            messageContent = await generateOutreachSMS(jobTitle, jobLocation, schedulingLink);
        } else if (messageType === 'email') {
            messageContent = await generateOutreachEmail(jobTitle, jobLocation, schedulingLink);
        } else {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid message type'
            });
        }

        // Log the communication
        const commLog = await candidatePipelineService.logCommunication(
            pipelineId,
            messageType,
            messageContent
        );

        // Update pipeline status to 'contacted' if not a rejection
        if (messageType !== 'rejection_email') {
            await candidatePipelineService.updateStatus(pipelineId, 'contacted');
        } else {
            await candidatePipelineService.updateStatus(pipelineId, 'rejected');
        }

        res.json({
            status: 'success',
            data: {
                message: messageContent,
                communicationLog: commLog
            }
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to send message'
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
        console.error('Error sending bulk messages:', error);
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
        const pipelineId = parseInt(req.params.id);
        const communications = await candidatePipelineService.getCommunicationHistory(pipelineId);

        res.json({
            status: 'success',
            data: { communications }
        });
    } catch (error) {
        console.error('Error fetching communications:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch communications'
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
        console.error('Error generating SMS:', error);
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
        console.error('Error generating email:', error);
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
        console.error('Error generating rejection email:', error);
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
