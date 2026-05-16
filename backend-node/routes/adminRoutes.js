const express = require('express');
const router = express.Router();
const db = require('../config/database');
const logger = require('../services/logger');

/**
 * GET /api/admin/overview
 * Aggregate stats across all companies
 */
router.get('/overview', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                (SELECT COUNT(*) FROM users WHERE role != 'admin') AS total_companies,
                (SELECT COUNT(*) FROM jobs WHERE deleted_at IS NULL) AS total_jobs,
                (SELECT COUNT(*) FROM candidates) AS total_candidates,
                (SELECT COUNT(*) FROM users WHERE role != 'admin' AND created_at > NOW() - INTERVAL '7 days') AS new_signups_7d,
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
                u.created_at,
                COUNT(DISTINCT j.id) FILTER (WHERE j.deleted_at IS NULL) AS job_count,
                COUNT(DISTINCT cp.candidate_id) AS candidate_count,
                MAX(j.created_at) AS last_job_posted_at
            FROM users u
            LEFT JOIN jobs j ON j.user_id = u.id
            LEFT JOIN candidate_pipeline cp ON cp.job_id = j.id
            WHERE u.role != 'admin'
            GROUP BY u.id, u.email, u.company_name, u.created_at
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

module.exports = router;
