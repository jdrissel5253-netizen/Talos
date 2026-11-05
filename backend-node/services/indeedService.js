const logger = require('./logger');

const INDEED_CLIENT_ID     = process.env.INDEED_API_TOKEN || '';
const INDEED_CLIENT_SECRET = process.env.INDEED_CLIENT_SECRET || '';
const INDEED_GRAPHQL_URL   = process.env.INDEED_API_URL || 'https://apis.indeed.com/graphql';
const INDEED_TOKEN_URL     = process.env.INDEED_TOKEN_URL || 'https://secure.indeed.com/oauth/v2/tokens';
const ATS_NAME = 'Talos';

// In-memory OAuth token cache
let cachedToken = null;
let tokenExpiry  = 0;

async function getAccessToken() {
    if (cachedToken && Date.now() < tokenExpiry - 60_000) return cachedToken;

    const response = await fetch(INDEED_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type:    'client_credentials',
            client_id:     INDEED_CLIENT_ID,
            client_secret: INDEED_CLIENT_SECRET,
            scope:         'employer_access'
        })
    });

    if (!response.ok) {
        throw new Error(`Indeed OAuth failed: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    cachedToken  = data.access_token;
    tokenExpiry  = Date.now() + data.expires_in * 1000;
    return cachedToken;
}

// Talos pipeline status → Indeed disposition status
const DISPOSITION_MAP = {
    new:       'NEW',
    approved:  'LIKED',
    contacted: 'CONTACTED',
    backup:    'REVIEW',
    rejected:  'NOT_SELECTED',
};

/**
 * Send a disposition update to Indeed for a candidate who applied via Indeed Apply.
 * No-ops silently when credentials are not yet configured.
 */
async function sendDisposition(indeedApplyId, talosStatus) {
    if (!INDEED_CLIENT_ID || !INDEED_CLIENT_SECRET) return;
    if (!indeedApplyId) return;

    const indeedStatus = DISPOSITION_MAP[talosStatus] || 'UNABLE_TO_MAP';

    try {
        const token = await getAccessToken();

        const mutation = `
            mutation SendDisposition($input: PartnerDispositionInput!) {
                partnerDisposition {
                    send(input: $input) {
                        success
                    }
                }
            }
        `;

        const variables = {
            input: {
                dispositions: [{
                    identifiedBy:         { indeedApplyId },
                    dispositionStatus:    indeedStatus,
                    rawDispositionStatus: talosStatus,
                    atsName:              ATS_NAME,
                    statusChangeDateTime: new Date().toISOString()
                }]
            }
        };

        const response = await fetch(INDEED_GRAPHQL_URL, {
            method: 'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ query: mutation, variables })
        });

        if (!response.ok) {
            logger.error('Indeed disposition sync failed', { status: response.status, indeedApplyId, indeedStatus });
            return;
        }

        logger.info('Indeed disposition sent', { indeedApplyId, indeedStatus, talosStatus });
    } catch (err) {
        logger.error('Indeed disposition sync error', { error: err.message, indeedApplyId });
    }
}

module.exports = { sendDisposition, DISPOSITION_MAP };
