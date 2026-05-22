const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const logger = require('../services/logger');
const { analyzeResume } = require('../services/resumeAnalyzer');
const { calculateTier, calculateStarRating } = require('../services/scoringService');
const { downloadResumeToTemp, isS3Key } = require('../config/s3');

const USE_POSTGRES = process.env.USE_POSTGRES === 'true' || process.env.NODE_ENV === 'production';
const toNum = (v) => { const n = Number(v); return isNaN(n) ? 0 : n; };
const toArr = (v) => {
    if (!v) return USE_POSTGRES ? [] : '[]';
    if (typeof v === 'string' && v.startsWith('[')) { try { v = JSON.parse(v); } catch (_) {} }
    if (USE_POSTGRES) return Array.isArray(v) ? v.map(String) : [String(v)];
    return JSON.stringify(Array.isArray(v) ? v : [v]);
};

/**
 * GET /api/admin/overview
 * Aggregate stats across all companies
 */
router.get('/overview', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                (SELECT COUNT(*) FROM users) AS total_companies,
                (SELECT COUNT(*) FROM jobs WHERE deleted_at IS NULL) AS total_jobs,
                (SELECT COUNT(*) FROM candidates) AS total_candidates,
                (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days') AS new_signups_7d,
                (SELECT COUNT(*) FROM candidates WHERE upload_date > NOW() - INTERVAL '7 days') AS new_candidates_7d
        `);
        res.json({ status: 'success', data: result.rows[0] });
    } catch (error) {
        logger.error('Admin overview error', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to load overview' });
    }
});

/**
 * GET /api/admin/users
 * All non-admin users with job and candidate counts
 */
router.get('/users', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                u.id,
                u.email,
                u.company_name,
                u.role,
                u.created_at,
                COUNT(DISTINCT j.id) FILTER (WHERE j.deleted_at IS NULL) AS job_count,
                COUNT(DISTINCT cp.candidate_id) AS candidate_count,
                MAX(j.created_at) AS last_job_posted_at
            FROM users u
            LEFT JOIN jobs j ON j.user_id = u.id
            LEFT JOIN candidate_pipeline cp ON cp.job_id = j.id
            GROUP BY u.id, u.email, u.company_name, u.role, u.created_at
            ORDER BY u.created_at DESC
        `);
        res.json({ status: 'success', data: result.rows });
    } catch (error) {
        logger.error('Admin users list error', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to load users' });
    }
});

/**
 * GET /api/admin/users/:id/jobs
 * Jobs for a specific company (for drill-down)
 */
router.get('/users/:id/jobs', async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    if (!userId || userId < 1) {
        return res.status(400).json({ status: 'error', message: 'Invalid user ID' });
    }
    try {
        const result = await db.query(`
            SELECT
                j.id,
                j.title,
                j.city,
                j.status,
                j.created_at,
                COUNT(cp.id) AS candidate_count
            FROM jobs j
            LEFT JOIN candidate_pipeline cp ON cp.job_id = j.id
            WHERE j.user_id = $1 AND j.deleted_at IS NULL
            GROUP BY j.id, j.title, j.city, j.status, j.created_at
            ORDER BY j.created_at DESC
        `, [userId]);
        res.json({ status: 'success', data: result.rows });
    } catch (error) {
        logger.error('Admin user jobs error', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to load user jobs' });
    }
});

/**
 * PUT /api/admin/users/:id/role
 * Toggle a user's role between 'user' and 'admin'
 */
router.put('/users/:id/role', async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    if (!userId || userId < 1) {
        return res.status(400).json({ status: 'error', message: 'Invalid user ID' });
    }
    const { role } = req.body;
    if (role !== 'user' && role !== 'admin') {
        return res.status(400).json({ status: 'error', message: 'Role must be user or admin' });
    }
    try {
        await db.query(`UPDATE users SET role = $1 WHERE id = $2`, [role, userId]);
        res.json({ status: 'success' });
    } catch (error) {
        logger.error('Admin role update error', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to update role' });
    }
});

/**
 * POST /api/admin/reanalyze-zero-scores
 * Re-analyze all pipeline candidates with tier_score = 0.
 * Runs in the background and streams progress; returns a summary when done.
 */
router.post('/reanalyze-zero-scores', async (req, res) => {
    const { rows: candidates } = await db.query(`
        SELECT cp.id AS pipeline_id, cp.candidate_id, cp.evaluated_position,
               c.file_path, c.filename,
               j.position_type, j.required_years_experience, j.flexible_on_title,
               j.city, j.zip_code
        FROM candidate_pipeline cp
        JOIN candidates c ON cp.candidate_id = c.id
        JOIN jobs j ON cp.job_id = j.id
        WHERE cp.tier_score = 0 AND c.file_path IS NOT NULL AND j.deleted_at IS NULL
        ORDER BY cp.id ASC
    `);

    if (candidates.length === 0) {
        return res.json({ status: 'success', message: 'No zero-score candidates found.', results: [] });
    }

    logger.info('Admin reanalyze-zero-scores started', { count: candidates.length });

    const results = [];

    for (const row of candidates) {
        const ext = path.extname(row.file_path || row.filename || '').toLowerCase();
        const supported = ['.pdf', '.docx', '.doc'];
        if (ext && !supported.includes(ext)) {
            results.push({ candidateId: row.candidate_id, status: 'skipped', reason: `${ext} not supported` });
            continue;
        }

        const positionType = row.evaluated_position || row.position_type || 'HVAC Service Technician';
        const requiredYears = row.required_years_experience || 2;
        const flexibleOnTitle = row.flexible_on_title !== false;
        const jobLocation = [row.city, row.zip_code].filter(Boolean).join(', ') || null;

        let tempPath = null;
        try {
            const filePath = isS3Key(row.file_path)
                ? (tempPath = await downloadResumeToTemp(row.file_path))
                : row.file_path;

            const analysis = await analyzeResume(filePath, positionType, requiredYears, flexibleOnTitle, jobLocation);
            const score = Number(analysis.overallScore) || 0;
            const tier = calculateTier(score);
            const starRating = calculateStarRating(score);

            await db.query(`
                INSERT INTO analyses (
                    candidate_id, overall_score, score_out_of_10, summary,
                    technical_skills_score, technical_skills_found, technical_skills_missing, technical_skills_feedback,
                    certifications_score, certifications_found, certifications_recommended, certifications_feedback,
                    experience_score, years_of_experience, relevant_experience, experience_feedback,
                    presentation_score, presentation_strengths, presentation_improvements, presentation_feedback,
                    strengths, weaknesses, recommendations, hiring_recommendation
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
                ON CONFLICT (candidate_id) DO UPDATE SET
                    overall_score=excluded.overall_score, score_out_of_10=excluded.score_out_of_10,
                    summary=excluded.summary, technical_skills_score=excluded.technical_skills_score,
                    technical_skills_found=excluded.technical_skills_found, technical_skills_missing=excluded.technical_skills_missing,
                    technical_skills_feedback=excluded.technical_skills_feedback, certifications_score=excluded.certifications_score,
                    certifications_found=excluded.certifications_found, certifications_recommended=excluded.certifications_recommended,
                    certifications_feedback=excluded.certifications_feedback, experience_score=excluded.experience_score,
                    years_of_experience=excluded.years_of_experience, relevant_experience=excluded.relevant_experience,
                    experience_feedback=excluded.experience_feedback, presentation_score=excluded.presentation_score,
                    presentation_strengths=excluded.presentation_strengths, presentation_improvements=excluded.presentation_improvements,
                    presentation_feedback=excluded.presentation_feedback, strengths=excluded.strengths,
                    weaknesses=excluded.weaknesses, recommendations=excluded.recommendations,
                    hiring_recommendation=excluded.hiring_recommendation, updated_at=CURRENT_TIMESTAMP
            `, [
                row.candidate_id, toNum(score), Math.round(score / 10), analysis.summary || '',
                toNum(analysis.technicalSkills?.score), toArr(analysis.technicalSkills?.found),
                toArr(analysis.technicalSkills?.missing), analysis.technicalSkills?.feedback || '',
                toNum(analysis.certifications?.score), toArr(analysis.certifications?.found),
                toArr(analysis.certifications?.recommended), analysis.certifications?.feedback || '',
                toNum(analysis.experience?.score), analysis.experience?.yearsOfExperience || 0,
                toArr(analysis.experience?.relevantExperience), analysis.experience?.feedback || '',
                toNum(analysis.presentationQuality?.score), toArr(analysis.presentationQuality?.strengths),
                toArr(analysis.presentationQuality?.improvements), analysis.presentationQuality?.feedback || '',
                toArr(analysis.strengths), toArr(analysis.weaknesses),
                toArr(analysis.recommendations), analysis.hiringRecommendation || 'MAYBE'
            ]);

            await db.query(`
                UPDATE candidate_pipeline SET tier=$1, tier_score=$2, star_rating=$3,
                    give_them_a_chance=$4, ai_summary=$5 WHERE id=$6
            `, [
                tier, Math.round(score), Math.round(starRating * 10) / 10,
                score >= 40 && score < 50 ? 1 : 0,
                `Re-analyzed. Score: ${score}/100. ${analysis.hiringRecommendation || ''}.`,
                row.pipeline_id
            ]);

            await db.query(`UPDATE candidates SET status='completed' WHERE id=$1`, [row.candidate_id]);

            results.push({ candidateId: row.candidate_id, status: 'success', score, tier });
            logger.info('Reanalyzed candidate', { candidateId: row.candidate_id, score, tier });
        } catch (err) {
            results.push({ candidateId: row.candidate_id, status: 'failed', error: err.message });
            logger.error('Reanalyze failed', { candidateId: row.candidate_id, error: err.message });
        } finally {
            if (tempPath) { try { fs.unlinkSync(tempPath); } catch (_) {} }
        }

        // Brief pause between API calls
        await new Promise(r => setTimeout(r, 1200));
    }

    const succeeded = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;

    logger.info('Admin reanalyze-zero-scores complete', { succeeded, failed, skipped });
    res.json({ status: 'success', summary: { total: candidates.length, succeeded, failed, skipped }, results });
});

module.exports = router;
