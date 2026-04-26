const { google } = require('googleapis');
const db = require('../config/database');
const logger = require('./logger');

const SETTINGS_KEY = 'google_oauth_token';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

async function saveCredentials(tokens) {
    const value = JSON.stringify(tokens);
    await db.query(
        `INSERT INTO system_settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [SETTINGS_KEY, value]
    );
}

async function loadCredentials() {
    try {
        const result = await db.query(
            'SELECT value FROM system_settings WHERE key = $1',
            [SETTINGS_KEY]
        );
        if (!result.rows.length || !result.rows[0].value) return null;
        return JSON.parse(result.rows[0].value);
    } catch (err) {
        logger.error('Failed to load Gmail credentials from DB', { error: err.message });
        return null;
    }
}

async function authorize() {
    const tokens = await loadCredentials();
    if (tokens) {
        oauth2Client.setCredentials(tokens);
        return oauth2Client;
    }
    return null;
}

async function exchangeCodeForToken(code) {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    await saveCredentials(tokens);
    return tokens;
}

async function sendEmail({ to, subject, body, html }) {
    await authorize();

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
        `To: ${to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        html || body
    ];
    const message = messageParts.join('\n');

    const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage }
    });

    return res.data;
}

async function isAuthenticated() {
    const tokens = await loadCredentials();
    return !!tokens;
}

function getAuthUrl(returnPath = '/talent-pool') {
    const scopes = [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.compose'
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        include_granted_scopes: true,
        prompt: 'consent',
        state: returnPath
    });
}

module.exports = {
    exchangeCodeForToken,
    sendEmail,
    getAuthUrl,
    isAuthenticated
};
