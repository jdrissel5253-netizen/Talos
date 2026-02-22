const express = require('express');
const router = express.Router();
const gmailService = require('../services/gmailService');
const logger = require('../services/logger');

/**
 * POST /api/auth/google/callback
 * Exchange authorization code for tokens
 */
router.post('/callback', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({
                status: 'error',
                message: 'Authorization code is required'
            });
        }

        await gmailService.exchangeCodeForToken(code);

        res.json({
            status: 'success',
            message: 'Successfully connected to Gmail'
        });
    } catch (error) {
        logger.error('Error exchanging token', { error: error.message, stack: error.stack });
        res.status(500).json({
            status: 'error',
            message: 'Failed to connect to Gmail'
        });
    }
});

/**
 * GET /api/auth/google/url
 * Get the authorization URL
 */
router.get('/url', (req, res) => {
    try {
        const url = gmailService.getAuthUrl();
        res.json({
            status: 'success',
            data: { url }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to generate auth URL'
        });
    }
});

/**
 * GET /api/auth/google/status
 * Check if connected
 */
router.get('/status', async (req, res) => {
    try {
        const isConnected = await gmailService.isAuthenticated();
        res.json({
            status: 'success',
            data: { isConnected }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to check status'
        });
    }
});

module.exports = router;
