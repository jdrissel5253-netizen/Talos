/**
 * One-off script: regenerate job descriptions for all active jobs.
 * Usage: node scripts/regenerate-all-descriptions.js
 * Requires EMAIL and PASSWORD env vars (or edit below), and API_BASE (default http://localhost:8080).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const API_BASE = process.env.API_BASE || 'http://localhost:8080';
const EMAIL    = process.env.SCRIPT_EMAIL    || process.env.ADMIN_EMAIL;
const PASSWORD = process.env.SCRIPT_PASSWORD || process.env.ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) {
    console.error('Set SCRIPT_EMAIL and SCRIPT_PASSWORD env vars (or ADMIN_EMAIL / ADMIN_PASSWORD).');
    process.exit(1);
}

async function run() {
    // 1. Authenticate
    console.log(`Authenticating as ${EMAIL}...`);
    const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        process.exit(1);
    }
    const { token } = await loginRes.json();
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 2. Fetch all jobs
    console.log('Fetching jobs...');
    const jobsRes = await fetch(`${API_BASE}/api/jobs`, { headers });
    if (!jobsRes.ok) {
        console.error('Failed to fetch jobs:', await jobsRes.text());
        process.exit(1);
    }
    const jobs = await jobsRes.json();
    const active = jobs.filter(j => j.is_active !== false);
    console.log(`Found ${active.length} active job(s). Regenerating descriptions...\n`);

    // 3. Regenerate each, one at a time to avoid rate limits
    let ok = 0, fail = 0;
    for (const job of active) {
        process.stdout.write(`  [${job.id}] ${job.title} ... `);
        try {
            const res = await fetch(`${API_BASE}/api/jobs/${job.id}/regenerate-description`, {
                method: 'POST',
                headers
            });
            if (res.ok) {
                console.log('OK');
                ok++;
            } else {
                const body = await res.text();
                console.log(`FAILED (${res.status}): ${body}`);
                fail++;
            }
        } catch (err) {
            console.log(`ERROR: ${err.message}`);
            fail++;
        }
        // Small delay to avoid hammering the AI API
        await new Promise(r => setTimeout(r, 1500));
    }

    console.log(`\nDone. ${ok} succeeded, ${fail} failed.`);
}

run().catch(err => { console.error(err); process.exit(1); });
