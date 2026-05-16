const db = require('../config/database');
const gmailService = require('./gmailService');
const logger = require('./logger');

const TIER_EMOJI = { green: '🟢', yellow: '🟡', red: '🔴' };

async function sendDailyDigests() {
    logger.info('Daily digest: starting');

    try {
        // Fetch all applications from the last 24 hours, grouped by job owner
        const result = await db.query(`
            SELECT
                u.id       AS owner_id,
                u.email    AS owner_email,
                j.title    AS job_title,
                cp.tier,
                cp.tier_score,
                c.applicant_email AS candidate_email,
                cp.created_at
            FROM candidate_pipeline cp
            JOIN jobs j ON cp.job_id = j.id
            JOIN users u ON j.user_id = u.id
            JOIN candidates c ON cp.candidate_id = c.id
            WHERE cp.created_at >= NOW() - INTERVAL '24 hours'
            ORDER BY u.id, cp.tier_score DESC
        `);

        if (!result.rows.length) {
            logger.info('Daily digest: no applications in past 24 hours, skipping');
            return;
        }

        // Group by owner
        const byOwner = result.rows.reduce((acc, row) => {
            if (!acc[row.owner_id]) acc[row.owner_id] = { email: row.owner_email, apps: [] };
            acc[row.owner_id].apps.push(row);
            return acc;
        }, {});

        const frontendUrl = process.env.FRONTEND_URL || 'https://gotalos.io';

        for (const { email, apps } of Object.values(byOwner)) {
            if (!email) continue;

            const green  = apps.filter(a => a.tier === 'green');
            const yellow = apps.filter(a => a.tier === 'yellow');
            const red    = apps.filter(a => a.tier === 'red');

            const renderRows = (list) => list.map(a =>
                `<tr>
                  <td style="padding:6px 12px;">${TIER_EMOJI[a.tier]} ${a.tier_score}/100</td>
                  <td style="padding:6px 12px;">${a.candidate_email || '—'}</td>
                  <td style="padding:6px 12px;">${a.job_title}</td>
                </tr>`
            ).join('');

            const html = `
<h2 style="font-family:sans-serif;">Your daily Talos summary</h2>
<p style="font-family:sans-serif;">Here's a recap of the <strong>${apps.length} application${apps.length !== 1 ? 's' : ''}</strong> received in the last 24 hours.</p>

<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;width:100%;">
  <thead>
    <tr style="background:#f3f4f6;">
      <th style="padding:8px 12px;text-align:left;">Score</th>
      <th style="padding:8px 12px;text-align:left;">Applicant</th>
      <th style="padding:8px 12px;text-align:left;">Position</th>
    </tr>
  </thead>
  <tbody>
    ${renderRows([...green, ...yellow, ...red])}
  </tbody>
</table>

<br>
<p style="font-family:sans-serif;">
  <a href="${frontendUrl}/jobs-management">View full pipeline →</a>
</p>`;

            try {
                await gmailService.sendEmail({
                    to: email,
                    subject: `Talos daily recap — ${apps.length} new applicant${apps.length !== 1 ? 's' : ''} (${green.length} 🟢 ${yellow.length} 🟡 ${red.length} 🔴)`,
                    html,
                });
                logger.info('Daily digest sent', { ownerEmail: email, count: apps.length });
            } catch (err) {
                logger.warn('Daily digest email failed', { ownerEmail: email, error: err.message });
            }
        }

        logger.info('Daily digest: complete');
    } catch (err) {
        logger.error('Daily digest: error', { error: err.message });
    }
}

module.exports = { sendDailyDigests };
