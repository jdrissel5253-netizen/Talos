const express = require('express');
const router = express.Router();
const gmailService = require('../services/gmailService');
const logger = require('../services/logger');

/**
 * GET /api/auth/google/callback
 * Google redirects here with ?code=...&state=...
 * Exchange code for token then redirect back to the app.
 */
router.get('/callback', async (req, res) => {
    try {
        const { code, state } = req.query;
        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL || 'https://gotalos.io'}?gmail_error=missing_code`);
        }

        await gmailService.exchangeCodeForToken(code);

        const returnPath = state || '/talent-pool';
        const frontendUrl = process.env.FRONTEND_URL || 'https://gotalos.io';
        res.redirect(`${frontendUrl}${returnPath}?gmail_connected=1`);
    } catch (error) {
        logger.error('Error exchanging Google token', { error: error.message });
        const frontendUrl = process.env.FRONTEND_URL || 'https://gotalos.io';
        res.redirect(`${frontendUrl}/talent-pool?gmail_error=1`);
    }
});

/**
 * GET /api/auth/google/url
 * Redirects directly to Google OAuth. Accepts ?return= to set the post-auth destination.
 */
router.get('/url', (req, res) => {
    try {
        const returnPath = req.query.return || '/talent-pool';
        const url = gmailService.getAuthUrl(returnPath);
        res.redirect(url);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to generate auth URL' });
    }
});

/**
 * GET /api/auth/google/status
 */
router.get('/status', async (req, res) => {
    try {
        const isConnected = await gmailService.isAuthenticated();
        res.json({ status: 'success', data: { isConnected } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to check status' });
    }
});

module.exports = router;
