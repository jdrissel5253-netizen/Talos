const express = require('express');
const router = express.Router();
const { jobService, candidatePipelineService, analysisService, candidateService } = require('../services/databaseService');
const Anthropic = require('@anthropic-ai/sdk');

// Initialize Anthropic client for AI summaries
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * GET /api/jobs
 * Get all jobs for the authenticated user
 */
router.get('/', async (req, res) => {
    try {
        // TODO: Add authentication middleware and get userId from req.user
        const userId = req.query.userId || 1; // Temporary: default to user 1

        const jobs = await jobService.findByUserId(userId);

        res.json({
            status: 'success',
            data: { jobs }
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch jobs'
        });
    }
});

/**
 * GET /api/jobs/:id
 * Get a specific job with its candidate pipeline
 */
router.get('/:id', async (req, res) => {
    try {
        const jobId = parseInt(req.params.id);
        const filters = req.query;

        const job = await jobService.findById(jobId);
        if (!job) {
            return res.status(404).json({
                status: 'error',
                message: 'Job not found'
            });
        }

        const candidates = await candidatePipelineService.findByJobId(jobId, filters);

        res.json({
            status: 'success',
            data: {
                job,
                candidates
            }
        });
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch job'
        });
    }
});

/**
 * POST /api/jobs
 * Create a new job posting
 */
router.post('/', async (req, res) => {
    try {
        // TODO: Add authentication middleware and get userId from req.user
        const userId = req.body.userId || 1; // Temporary: default to user 1

        const jobData = {
            title: req.body.title,
            description: req.body.description,
            location: req.body.location,
            required_years_experience: req.body.required_years_experience,
            vehicle_required: req.body.vehicle_required,
            position_type: req.body.position_type,
            salary_min: req.body.salary_min,
            salary_max: req.body.salary_max,
            flexible_on_title: req.body.flexible_on_title !== false // Default to true
        };

        const job = await jobService.create(userId, jobData);

        res.json({
            status: 'success',
            data: { job }
        });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create job'
        });
    }
});

/**
 * PUT /api/jobs/:id
 * Update a job posting
 */
router.put('/:id', async (req, res) => {
    try {
        const jobId = parseInt(req.params.id);
        const updates = req.body;

        const job = await jobService.update(jobId, updates);

        res.json({
            status: 'success',
            data: { job }
        });
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update job'
        });
    }
});

/**
 * DELETE /api/jobs/:id
 * Delete a job posting
 */
router.delete('/:id', async (req, res) => {
    try {
        const jobId = parseInt(req.params.id);
        await jobService.delete(jobId);

        res.json({
            status: 'success',
            message: 'Job deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete job'
        });
    }
});

/**
 * POST /api/jobs/:id/candidates/:candidateId
 * Add a candidate to a job's pipeline with intelligent scoring
 */
router.post('/:id/candidates/:candidateId', async (req, res) => {
    try {
        const jobId = parseInt(req.params.id);
        const candidateId = parseInt(req.params.candidateId);

        // Get job details and candidate analysis
        const job = await jobService.findById(jobId);
        const analysis = await analysisService.findByCandidateId(candidateId);
        const candidate = await candidateService.findById(candidateId);

        if (!job || !analysis) {
            return res.status(404).json({
                status: 'error',
                message: 'Job or candidate not found'
            });
        }

        // Calculate tier based on score
        const score = analysis.overall_score;
        let tier, star_rating;

        if (score >= 80) {
            tier = 'green';
            star_rating = 4.0 + (score - 80) / 20; // 4.0 to 5.0
        } else if (score >= 50) {
            tier = 'yellow';
            star_rating = 2.0 + (score - 50) / 30 * 1.9; // 2.0 to 3.9
        } else {
            tier = 'red';
            star_rating = score / 50 * 1.5; // 0 to 1.5
        }

        // Determine vehicle status (if provided in request body)
        const vehicle_status = req.body.vehicle_status || 'unknown';

        // Adjust score if vehicle is required
        let adjusted_score = score;
        if (job.vehicle_required) {
            if (vehicle_status === 'has_vehicle') {
                adjusted_score = Math.min(100, score + 5);
            } else if (vehicle_status === 'no_vehicle') {
                adjusted_score = Math.max(0, score - 10);
            }
        }

        // Determine "Give Them a Chance" flag
        const give_them_a_chance = await determineGiveThemAChance(analysis, job, score);

        // Generate AI summary
        const ai_summary = await generateCandidateSummary(analysis, job, tier, candidate.filename);

        const pipelineData = {
            tier,
            tier_score: Math.round(adjusted_score),
            star_rating: Math.round(star_rating * 10) / 10,
            give_them_a_chance,
            vehicle_status,
            ai_summary,
            internal_notes: req.body.internal_notes || '',
            tags: req.body.tags || []
        };

        const pipelineEntry = await candidatePipelineService.addToJob(candidateId, jobId, pipelineData);

        res.json({
            status: 'success',
            data: { pipelineEntry }
        });
    } catch (error) {
        console.error('Error adding candidate to job:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to add candidate to job'
        });
    }
});

/**
 * Helper function: Determine if candidate gets "Give Them a Chance" flag
 */
async function determineGiveThemAChance(analysis, job, score) {
    // Only apply to Green or Yellow tier candidates
    if (score < 50) return false;

    const yearsExp = analysis.years_of_experience;
    const requiredYears = job.required_years_experience;

    // High upside despite limited experience
    if (yearsExp < requiredYears && yearsExp >= requiredYears * 0.5) {
        // Check if they have strong certifications or skills
        if (analysis.certifications_score >= 80 || analysis.technical_skills_score >= 80) {
            return true;
        }
    }

    // Overqualified but likely to perform well
    if (yearsExp > requiredYears * 2 && score >= 75) {
        return true;
    }

    // Strong transferable background (check keywords)
    const summary = analysis.summary.toLowerCase();
    const transferableKeywords = ['maintenance', 'customer service', 'promoted', 'manager', 'supervisor'];
    const hasTransferableBackground = transferableKeywords.some(keyword => summary.includes(keyword));

    if (hasTransferableBackground && analysis.presentation_score >= 70) {
        return true;
    }

    return false;
}

/**
 * Helper function: Generate AI candidate summary using Claude Haiku
 */
async function generateCandidateSummary(analysis, job, tier, filename) {
    try {
        const prompt = `You are an HVAC hiring expert. Generate a concise 3-sentence summary explaining why this candidate received their score and tier for the ${job.title} position.

Candidate Analysis:
- Overall Score: ${analysis.overall_score}/100
- Tier: ${tier.toUpperCase()}
- Years of Experience: ${analysis.years_of_experience}
- Certifications: ${analysis.certifications_found ? analysis.certifications_found.join(', ') : 'None listed'}
- Summary: ${analysis.summary}
- Hiring Recommendation: ${analysis.hiring_recommendation}

Job Requirements:
- Position: ${job.title}
- Required Experience: ${job.required_years_experience} years
- Vehicle Required: ${job.vehicle_required ? 'Yes' : 'No'}
- Location: ${job.location}

Generate a 3-sentence summary following this format:
1. Key relevant experience and qualifications
2. Reason for tier/score (mention keywords, experience match, vehicle if relevant)
3. Recommended next step (interview, backup, reject, etc.)

Keep it professional, concise, and actionable.`;

        const message = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 300,
            temperature: 0.3,
            messages: [{
                role: "user",
                content: prompt
            }]
        });

        return message.content[0].text;
    } catch (error) {
        console.error('Error generating AI summary:', error);
        // Return a fallback summary
        return `Candidate scored ${analysis.overall_score}/100 (${tier} tier) for ${job.title}. Has ${analysis.years_of_experience} years of experience. ${analysis.hiring_recommendation.replace(/_/g, ' ')}.`;
    }
}

module.exports = router;
