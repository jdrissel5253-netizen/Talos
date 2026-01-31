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
 * Create a new job posting with AI-generated description
 */
router.post('/', async (req, res) => {
    try {
        // TODO: Add authentication middleware and get userId from req.user
        const userId = req.body.userId || 1; // Temporary: default to user 1

        const jobData = {
            title: req.body.title,
            company_name: req.body.company_name,
            description: req.body.description,
            location: req.body.location,
            job_location_type: req.body.job_location_type,
            city: req.body.city,
            zip_code: req.body.zip_code,
            job_type: req.body.job_type,
            required_years_experience: req.body.required_years_experience,
            vehicle_required: req.body.vehicle_required,
            position_type: req.body.position_type,
            salary_min: req.body.salary_min,
            salary_max: req.body.salary_max,
            pay_range_min: req.body.pay_range_min,
            pay_range_max: req.body.pay_range_max,
            pay_type: req.body.pay_type,
            expected_hours: req.body.expected_hours,
            work_schedule: req.body.work_schedule,
            benefits: JSON.stringify(req.body.benefits || []),
            key_responsibilities: JSON.stringify(req.body.key_responsibilities || []),
            qualifications_years: req.body.qualifications_years,
            qualifications_certifications: JSON.stringify(req.body.qualifications_certifications || []),
            qualifications_other: req.body.qualifications_other,
            education_requirements: req.body.education_requirements,
            other_relevant_titles: JSON.stringify(req.body.other_relevant_titles || []),
            advancement_opportunities: req.body.advancement_opportunities,
            advancement_timeline: req.body.advancement_timeline,
            company_culture: req.body.company_culture,
            flexible_on_title: req.body.flexible_on_title !== false // Default to true
        };

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

/**
 * Helper function: Generate SEO-optimized job description using Claude
 */
async function generateJobDescription(jobData) {
    try {
        const responsibilities = JSON.parse(jobData.key_responsibilities || '[]');
        const benefits = JSON.parse(jobData.benefits || '[]');
        const otherTitles = JSON.parse(jobData.other_relevant_titles || '[]');
        const certifications = JSON.parse(jobData.qualifications_certifications || '[]');

        const prompt = `You are an expert job description writer specializing in creating compelling, SEO-optimized HVAC job postings.

Create a professional, engaging job description for the following position:

BASIC INFORMATION:
- Job Title: ${jobData.title}
- Company: ${jobData.company_name || 'Our company'}
- Location: ${jobData.city ? jobData.city + ', ' : ''}${jobData.zip_code || ''} (${jobData.job_location_type || 'On-site'})
- Job Type: ${jobData.job_type}
- Pay Range: ${jobData.pay_range_min ? '$' + jobData.pay_range_min + ' - $' + jobData.pay_range_max + ' per ' + jobData.pay_type.replace('ly', '') : 'Competitive'}
- Expected Hours: ${jobData.expected_hours || 'Full-time'}
- Work Schedule: ${jobData.work_schedule || 'To be discussed'}

KEY RESPONSIBILITIES (provided by employer):
${responsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n')}

QUALIFICATIONS:
- Experience Required: ${jobData.qualifications_years || jobData.required_years_experience || 0} years
- Education: ${jobData.education_requirements || 'Not specified'}
- Certifications: ${certifications.length > 0 ? certifications.join(', ') : 'Not required'}
${jobData.qualifications_other ? '- Additional: ' + jobData.qualifications_other : ''}

BENEFITS:
${benefits.length > 0 ? benefits.map(b => '- ' + b).join('\n') : '- Competitive benefits package'}

${jobData.advancement_opportunities ? 'CAREER ADVANCEMENT:\n- Advancement opportunities available' + (jobData.advancement_timeline ? ' (Timeline: ' + jobData.advancement_timeline + ')' : '') : ''}

${jobData.company_culture ? 'COMPANY CULTURE:\n' + jobData.company_culture : ''}

${otherTitles.length > 0 ? 'RELATED POSITIONS CONSIDERED:\n' + otherTitles.join(', ') : ''}

Generate a compelling, professional job description following this EXACT FORMAT with clear visual separation:

═══════════════════════════════════════════════════════════════════
💰 COMPENSATION
═══════════════════════════════════════════════════════════════════
Pay: $[min] - $[max] per [hour/year]
Schedule: [work schedule]
Job Type: [Full-time/Part-time/etc.]

═══════════════════════════════════════════════════════════════════
📋 POSITION OVERVIEW
═══════════════════════════════════════════════════════════════════
[Write 3-4 concise, compelling sentences that sell the role and opportunity. Make it engaging and aspirational. Highlight what makes this position special and what the candidate will achieve. Use strong action words and emphasize impact, leadership, or expertise depending on the seniority level. Keep it punchy and easy to scan.]

═══════════════════════════════════════════════════════════════════
🔧 WHAT YOU'LL DO
═══════════════════════════════════════════════════════════════════
[Expand the 3 key responsibilities provided into 6-8 detailed bullet points. Each bullet should start with a strong action verb and be specific about tasks, systems, or outcomes. Include:
• Technical tasks and responsibilities
• Customer interaction requirements
• Safety protocols and compliance
• Equipment and systems you'll work with
• Documentation and reporting duties
Keep each bullet to 1-2 lines maximum for easy scanning.]

═══════════════════════════════════════════════════════════════════
✅ BASIC QUALIFICATIONS
═══════════════════════════════════════════════════════════════════
[List 4-6 essential requirements as clear, scannable bullet points:
• Minimum years of experience with specific HVAC work
• Required certifications (EPA Universal, state licenses, etc.)
• Core technical competencies
• Education requirements
• Valid driver's license (if applicable)
• Physical requirements (lifting, climbing, etc.)
Keep each bullet concise and direct.]

═══════════════════════════════════════════════════════════════════
⭐ PREFERRED QUALIFICATIONS
═══════════════════════════════════════════════════════════════════
[List 3-5 nice-to-have qualifications that would make candidates stand out:
• Advanced certifications or specialized training
• Experience with specific systems (BAS, VRF, chillers, etc.)
• Leadership or project management experience
• Additional technical expertise
• Strong communication or customer service skills
For entry-level roles, keep this brief or focus on attitude/willingness to learn.]

═══════════════════════════════════════════════════════════════════
💼 WHY YOU'LL LOVE WORKING HERE
═══════════════════════════════════════════════════════════════════
[Write 2-3 sentences about company culture, values, growth opportunities, or what makes the company a great place to work. Make it genuine and specific.]

Our benefits include:
[List each benefit as a concise bullet point using the exact benefits provided. If generic "competitive benefits package", expand to typical HVAC benefits like health insurance, PTO, 401k, tool allowance, ongoing training, etc.]

═══════════════════════════════════════════════════════════════════
📍 WORK LOCATION
═══════════════════════════════════════════════════════════════════
Location: [City, Zip] - In person
${jobData.vehicle_required ? 'Company vehicle provided OR Valid driver\'s license and reliable transportation required' : ''}

═══════════════════════════════════════════════════════════════════

CRITICAL FORMATTING RULES:
1. Use the exact section headers with visual separators (═══) as shown above
2. Keep ALL bullet points concise - maximum 1-2 lines each
3. Use emoji icons (💰 🔧 ✅ ⭐ 💼 📍) EXACTLY as shown for each section
4. Add blank lines between sections for breathing room
5. Make content scannable - candidates should be able to skim in 30 seconds
6. Match tone to seniority level (entry/mid/senior/lead)
7. Use HVAC-specific terminology naturally
8. NO generic filler - every sentence should be specific and meaningful
9. Keep total description under 500 words for maximum engagement`;

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
        console.error('Error generating job description:', error);
        // Return a basic fallback description
        const responsibilities = JSON.parse(jobData.key_responsibilities || '[]');
        return `${jobData.title}\n\nWe are seeking a qualified ${jobData.title} to join our team.\n\nKey Responsibilities:\n${responsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\nQualifications:\n- ${jobData.qualifications_years || 0} years of experience\n- ${jobData.education_requirements || 'Relevant education'}\n\nApply today to join our team!`;
    }
}

module.exports = router;
