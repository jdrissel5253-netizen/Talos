const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

// Path to store tokens
const TOKEN_PATH = path.join(__dirname, '..', 'credentials', 'token.json');
// Ensure credentials directory exists
const CREDENTIALS_DIR = path.join(__dirname, '..', 'credentials');

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000'
);

/**
 * Ensure the credentials directory exists
 */
async function ensureCredentialsDir() {
    try {
        await fs.access(CREDENTIALS_DIR);
    } catch {
        await fs.mkdir(CREDENTIALS_DIR, { recursive: true });
    }
}

/**
 * Save credentials to disk
 */
async function saveCredentials(payload) {
    await ensureCredentialsDir();
    const content = JSON.stringify(payload);
    await fs.writeFile(TOKEN_PATH, content);
}

/**
 * Load credentials from disk
 */
async function loadCredentials() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

/**
 * Initialize the client with stored credentials if available
 */
async function authorize() {
    const client = await loadCredentials();
    if (client) {
        oauth2Client.setCredentials(client.credentials);
        return oauth2Client;
    }
    return null;
}

/**
 * Exchange authorization code for tokens
 */
async function exchangeCodeForToken(code) {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    await saveCredentials({
        type: 'authorized_user',
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: tokens.refresh_token,
        credentials: tokens // store full tokens
    });
    return tokens;
}

/**
 * Send an email via Gmail API
 */
async function sendEmail({ to, subject, body, html }) {
    // Ensure we are authorized
    await authorize();

    // If logic to refresh token is needed, googleapis handles it automatically if refresh_token is present

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

    // The body needs to be base64url encoded.
    const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: encodedMessage,
        },
    });

    return res.data;
}

/**
 * Check if the service is currently authenticated
 */
async function isAuthenticated() {
    const client = await loadCredentials();
    return !!client;
}

/**
 * Get the Authorization URL
 */
function getAuthUrl() {
    const scopes = [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.compose'
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        include_granted_scopes: true
    });
}

module.exports = {
    exchangeCodeForToken,
    sendEmail,
    getAuthUrl,
    isAuthenticated
};
