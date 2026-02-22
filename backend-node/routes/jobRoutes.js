const express = require('express');
const router = express.Router();
const { jobService, candidatePipelineService, analysisService, candidateService, sanitize } = require('../services/databaseService');
const { calculateTier, calculateStarRating, adjustScoreForVehicle } = require('../services/scoringService');
const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../services/logger');

// Initialize Anthropic client for AI summaries
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * GET /api/jobs
 * Get all jobs for the authenticated user (admin sees all jobs)
 */
router.get('/', async (req, res) => {
    try {
        const { userId, role } = req.user;

        const jobs = role === 'admin'
            ? await jobService.findAll()
            : await jobService.findByUserId(userId);

        res.set('Cache-Control', 'private, max-age=300');
        res.json({
            status: 'success',
            data: { jobs }
        });
    } catch (error) {
        logger.error('Error fetching jobs', { error: error.message, stack: error.stack });
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
        const jobId = sanitize.positiveInt(req.params.id);
        if (!jobId) {
            return res.status(400).json({ status: 'error', message: 'Invalid job ID' });
        }
        const filters = req.query;

        const job = await jobService.findById(jobId);
        if (!job) {
            return res.status(404).json({
                status: 'error',
                message: 'Job not found'
            });
        }

        // Non-admins can only access their own jobs
        if (req.user.role !== 'admin' && job.user_id !== req.user.userId) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
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
        logger.error('Error fetching job', { error: error.message, stack: error.stack });
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch job'
        });
    }
});

/**
 * POST /api/jobs
 * Create a new job posting with AI-generated description
 */
router.post('/', async (req, res) => {
    try {
        const userId = req.user.userId;

        const title = sanitize.trimString(req.body.title, 255);
        if (!title) {
            return res.status(400).json({
                status: 'error',
                message: 'Job title is required'
            });
        }

        const jobData = {
            title,
            company_name: sanitize.trimString(req.body.company_name, 255),
            description: sanitize.trimString(req.body.description, 10000),
            location: sanitize.trimString(req.body.location, 255),
            job_location_type: sanitize.trimString(req.body.job_location_type, 50),
            city: sanitize.trimString(req.body.city, 255),
            zip_code: sanitize.trimString(req.body.zip_code, 20),
            job_type: sanitize.trimString(req.body.job_type, 50),
            required_years_experience: sanitize.nonNegativeNumber(req.body.required_years_experience),
            vehicle_required: req.body.vehicle_required,
            position_type: sanitize.trimString(req.body.position_type, 100),
            salary_min: sanitize.nonNegativeNumber(req.body.salary_min),
            salary_max: sanitize.nonNegativeNumber(req.body.salary_max),
            pay_range_min: sanitize.nonNegativeNumber(req.body.pay_range_min),
            pay_range_max: sanitize.nonNegativeNumber(req.body.pay_range_max),
            pay_type: sanitize.trimString(req.body.pay_type, 50),
            expected_hours: sanitize.trimString(req.body.expected_hours, 100),
            work_schedule: sanitize.trimString(req.body.work_schedule, 100),
            benefits: JSON.stringify(req.body.benefits || []),
            key_responsibilities: JSON.stringify(req.body.key_responsibilities || []),
            qualifications_years: sanitize.nonNegativeNumber(req.body.qualifications_years),
            qualifications_certifications: JSON.stringify(req.body.qualifications_certifications || []),
            qualifications_other: sanitize.trimString(req.body.qualifications_other, 2000),
            education_requirements: sanitize.trimString(req.body.education_requirements, 500),
            other_relevant_titles: JSON.stringify(req.body.other_relevant_titles || []),
            advancement_opportunities: sanitize.trimString(req.body.advancement_opportunities, 2000),
            advancement_timeline: sanitize.trimString(req.body.advancement_timeline, 255),
            company_culture: sanitize.trimString(req.body.company_culture, 2000),
            flexible_on_title: req.body.flexible_on_title !== false // Default to true
        };

        // Validate salary/pay range ordering
        if (jobData.salary_min != null && jobData.salary_max != null && jobData.salary_max < jobData.salary_min) {
            return res.status(400).json({
                status: 'error',
                message: 'salary_max must be greater than or equal to salary_min'
            });
        }
        if (jobData.pay_range_min != null && jobData.pay_range_max != null && jobData.pay_range_max < jobData.pay_range_min) {
            return res.status(400).json({
                status: 'error',
                message: 'pay_range_max must be greater than or equal to pay_range_min'
            });
        }

        // Generate AI job description
        if (req.body.key_responsibilities && req.body.key_responsibilities.length >= 3) {
            const aiDescription = await generateJobDescription(jobData);
            jobData.ai_generated_description = aiDescription;
            jobData.description = aiDescription; // Use AI description as main description
        }

        const job = await jobService.create(userId, jobData);

        res.json({
            status: 'success',
            data: { job }
        });
    } catch (error) {
        logger.error('Error creating job', { error: error.message, stack: error.stack });
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
        const jobId = sanitize.positiveInt(req.params.id);
        if (!jobId) {
            return res.status(400).json({ status: 'error', message: 'Invalid job ID' });
        }
        const updates = req.body;

        // Validate salary/pay range ordering on update
        const salaryMin = updates.salary_min != null ? Number(updates.salary_min) : null;
        const salaryMax = updates.salary_max != null ? Number(updates.salary_max) : null;
        if (salaryMin != null && salaryMax != null && salaryMax < salaryMin) {
            return res.status(400).json({
                status: 'error',
                message: 'salary_max must be greater than or equal to salary_min'
            });
        }
        const payMin = updates.pay_range_min != null ? Number(updates.pay_range_min) : null;
        const payMax = updates.pay_range_max != null ? Number(updates.pay_range_max) : null;
        if (payMin != null && payMax != null && payMax < payMin) {
            return res.status(400).json({
                status: 'error',
                message: 'pay_range_max must be greater than or equal to pay_range_min'
            });
        }

        const userId = req.user.userId;
        const role = req.user.role;

        // Non-admins can only update their own jobs
        if (role !== 'admin') {
            const existing = await jobService.findById(jobId);
            if (!existing) {
                return res.status(404).json({ status: 'error', message: 'Job not found' });
            }
            if (existing.user_id !== userId) {
                return res.status(403).json({ status: 'error', message: 'Access denied' });
            }
        }

        const job = await jobService.update(jobId, updates, userId);

        res.json({
            status: 'success',
            data: { job }
        });
    } catch (error) {
        logger.error('Error updating job', { error: error.message, stack: error.stack });
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
        const jobId = sanitize.positiveInt(req.params.id);
        if (!jobId) {
            return res.status(400).json({ status: 'error', message: 'Invalid job ID' });
        }
        const userId = req.user.userId;
        const role = req.user.role;

        // Non-admins can only delete their own jobs
        if (role !== 'admin') {
            const existing = await jobService.findById(jobId);
            if (!existing) {
                return res.status(404).json({ status: 'error', message: 'Job not found' });
            }
            if (existing.user_id !== userId) {
                return res.status(403).json({ status: 'error', message: 'Access denied' });
            }
        }

        await jobService.delete(jobId, userId);

        res.json({
            status: 'success',
            message: 'Job deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting job', { error: error.message, stack: error.stack });
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
        const jobId = sanitize.positiveInt(req.params.id);
        const candidateId = sanitize.positiveInt(req.params.candidateId);
        if (!jobId || !candidateId) {
            return res.status(400).json({ status: 'error', message: 'Invalid job or candidate ID' });
        }

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

        // Calculate tier and star rating using shared scoring service
        const score = analysis.overall_score;
        const vehicle_status = req.body.vehicle_status || 'unknown';
        const tier = calculateTier(score);
        const star_rating = calculateStarRating(score);
        const adjusted_score = adjustScoreForVehicle(score, vehicle_status, job.vehicle_required);

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
        logger.error('Error adding candidate to job', { error: error.message, stack: error.stack });
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
        logger.error('Error generating AI summary', { error: error.message });
        // Return a fallback summary
        return `Candidate scored ${analysis.overall_score}/100 (${tier} tier) for ${job.title}. Has ${analysis.years_of_experience} years of experience. ${analysis.hiring_recommendation.replace(/_/g, ' ')}.`;
    }
}

/**
 * Helper function: Generate SEO-optimized job description using Claude
 */
async function generateJobDescription(jobData) {
    try {
        const responsibilities = JSON.parse(jobData.key_responsibilities || '[]');
        const benefits = JSON.parse(jobData.benefits || '[]');
        const otherTitles = JSON.parse(jobData.other_relevant_titles || '[]');
        const certifications = JSON.parse(jobData.qualifications_certifications || '[]');

        const prompt = `You are an expert job description writer. Write a clean, professional job description for an HVAC position.

INPUT DATA:
- Job Title: ${jobData.title}
- Company: ${jobData.company_name || 'Our company'}
- Location: ${jobData.city ? jobData.city + ', ' : ''}${jobData.zip_code || ''} (${jobData.job_location_type || 'On-site'})
- Job Type: ${jobData.job_type}
- Pay Range: ${jobData.pay_range_min ? '$' + jobData.pay_range_min + ' - $' + jobData.pay_range_max + ' per ' + jobData.pay_type.replace('ly', '') : 'Competitive'}
- Schedule: ${jobData.work_schedule || 'Full-time'}
- Experience Required: ${jobData.qualifications_years || jobData.required_years_experience || 0} years
- Education: ${jobData.education_requirements || 'Not specified'}
- Certifications: ${certifications.length > 0 ? certifications.join(', ') : 'None required'}
- Key Responsibilities: ${responsibilities.join('; ')}
- Benefits: ${benefits.length > 0 ? benefits.join(', ') : 'Competitive benefits package'}
${jobData.advancement_opportunities ? '- Advancement: Available' + (jobData.advancement_timeline ? ' (' + jobData.advancement_timeline + ')' : '') : ''}
${jobData.company_culture ? '- Culture: ' + jobData.company_culture : ''}

Write the job description using this EXACT format. No emojis. No decorative lines. Clean and professional like a well-written business document.

---

[JOB TITLE]

[COMPANY NAME] | [LOCATION] | [JOB TYPE]
[PAY RANGE] | [SCHEDULE]

About This Role

[Write 2-3 sentences describing the position and opportunity. Be direct and genuine. Use straightforward, blue-collar language that speaks to skilled tradespeople. Focus on what the role offers and what kind of person will succeed.]

Responsibilities

[List 5-6 bullet points using simple dashes (-). Start each with a strong action verb. Be specific about the actual work. Keep each bullet to one line when possible.]

Qualifications

[List 4-5 required qualifications as bullet points. Include experience, certifications, and essential skills. Be clear about what's mandatory.]

Preferred

[List 2-3 nice-to-have qualifications. Keep it brief.]

What We Offer

[List benefits as bullet points. Use the exact benefits provided.]

${jobData.advancement_opportunities ? '[Include one sentence about growth opportunities.]' : ''}

---

CRITICAL RULES:
1. NO emojis anywhere
2. NO decorative lines or borders
3. NO excessive spacing or blank lines
4. Use simple dashes (-) for all bullet points
5. Keep language professional but approachable - write for skilled tradespeople, not corporate executives
6. Be concise - every word should earn its place
7. Total length: 250-350 words maximum
8. Tone: Respectful, direct, and genuine - like talking to a colleague`;

        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",  // Using Claude Sonnet 4.5
            max_tokens: 2000,
            temperature: 0.7,
            messages: [{
                role: "user",
                content: prompt
            }]
        });

        return message.content[0].text;
    } catch (error) {
        logger.error('Error generating job description', { error: error.message });
        // Return a basic fallback description
        const responsibilities = JSON.parse(jobData.key_responsibilities || '[]');
        return `${jobData.title}\n\nWe are seeking a qualified ${jobData.title} to join our team.\n\nKey Responsibilities:\n${responsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\nQualifications:\n- ${jobData.qualifications_years || 0} years of experience\n- ${jobData.education_requirements || 'Relevant education'}\n\nApply today to join our team!`;
    }
}

module.exports = router;
