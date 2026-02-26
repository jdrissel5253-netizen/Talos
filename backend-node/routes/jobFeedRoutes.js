const express = require('express');
const router = express.Router();
const { jobService } = require('../services/databaseService');
const logger = require('../services/logger');

// Public base URL for job links
const BASE_URL = process.env.BASE_URL || 'https://gotalos.io';

/**
 * Escape XML special characters
 */
function escapeXml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Format date as YYYY-MM-DD for XML feed
 */
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

/**
 * Format salary for display
 */
function formatSalary(job) {
    const min = job.pay_range_min || job.salary_min;
    const max = job.pay_range_max || job.salary_max;
    const payType = job.pay_type || 'hourly';

    if (!min && !max) return '';

    const suffix = payType === 'salary' ? '/year' : '/hour';
    if (min && max) {
        return `$${min}-${max}${suffix}`;
    }
    return min ? `$${min}+${suffix}` : `Up to $${max}${suffix}`;
}

/**
 * Map job_type to standardized format for feeds
 */
function mapJobType(jobType) {
    const mapping = {
        'full-time': 'full-time',
        'full_time': 'full-time',
        'fulltime': 'full-time',
        'part-time': 'part-time',
        'part_time': 'part-time',
        'parttime': 'part-time',
        'contract': 'contract',
        'temporary': 'temporary',
        'internship': 'internship'
    };
    return mapping[(jobType || '').toLowerCase()] || 'full-time';
}

/**
 * GET /feed.xml - XML feed of all active jobs for job board aggregators
 * Compatible with Indeed, Jooble, Adzuna, Talent.com, etc.
 */
router.get('/feed.xml', async (req, res) => {
    try {
        const jobs = await jobService.findActiveForFeed();

        const now = new Date().toISOString();

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<source>
  <publisher>Talos ATS</publisher>
  <publisherurl>${escapeXml(BASE_URL)}</publisherurl>
  <lastBuildDate>${now}</lastBuildDate>
`;

        for (const job of jobs) {
            const jobUrl = `${BASE_URL}/jobs/${job.id}`;
            const salary = formatSalary(job);
            const jobType = mapJobType(job.job_type);

            xml += `  <job>
    <title>${escapeXml(job.title)}</title>
    <date>${formatDate(job.created_at)}</date>
    <referencenumber>${job.id}</referencenumber>
    <url>${escapeXml(jobUrl)}</url>
    <company>${escapeXml(job.company_name || 'Company')}</company>
    <city>${escapeXml(job.city || job.location || '')}</city>
    <postalcode>${escapeXml(job.zip_code || '')}</postalcode>
    <description><![CDATA[${job.description || job.ai_generated_description || ''}]]></description>
    <salary>${escapeXml(salary)}</salary>
    <jobtype>${escapeXml(jobType)}</jobtype>
  </job>
`;
        }

        xml += `</source>`;

        res.set('Content-Type', 'application/xml');
        res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        res.send(xml);

        logger.info('Job feed generated', { jobCount: jobs.length });
    } catch (error) {
        logger.error('Error generating job feed', { error: error.message });
        res.status(500).set('Content-Type', 'application/xml').send(
            `<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate feed</error>`
        );
    }
});

/**
 * GET /public/:id - Public job detail endpoint (no auth required)
 * Used by the public job detail page
 */
router.get('/public/:id', async (req, res) => {
    try {
        const jobId = parseInt(req.params.id, 10);
        if (isNaN(jobId)) {
            return res.status(400).json({ status: 'error', message: 'Invalid job ID' });
        }

        const job = await jobService.findActiveById(jobId);

        if (!job) {
            return res.status(404).json({ status: 'error', message: 'Job not found or no longer active' });
        }

        // Return job data suitable for public display
        res.json({
            status: 'success',
            job: {
                id: job.id,
                title: job.title,
                company_name: job.company_name,
                description: job.description || job.ai_generated_description,
                location: job.location,
                city: job.city,
                zip_code: job.zip_code,
                job_location_type: job.job_location_type,
                job_type: job.job_type,
                position_type: job.position_type,
                pay_range_min: job.pay_range_min || job.salary_min,
                pay_range_max: job.pay_range_max || job.salary_max,
                pay_type: job.pay_type,
                benefits: job.benefits,
                key_responsibilities: job.key_responsibilities,
                qualifications_certifications: job.qualifications_certifications,
                education_requirements: job.education_requirements,
                required_years_experience: job.required_years_experience,
                created_at: job.created_at
            }
        });
    } catch (error) {
        logger.error('Error fetching public job', { error: error.message, jobId: req.params.id });
        res.status(500).json({ status: 'error', message: 'Failed to fetch job details' });
    }
});

module.exports = router;
