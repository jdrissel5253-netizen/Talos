/**
 * Logs into Talos as admin and triggers the zero-score re-analysis.
 * Run: node scripts/trigger-reanalyze.js
 */
const readline = require('readline');

const API = 'https://gotalos.io';
const EMAIL = 'jdrissel5253@gmail.com';

async function run() {
    // Prompt for password without echoing it
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const password = await new Promise(resolve => {
        process.stdout.write(`Talos password for ${EMAIL}: `);
        // Hide input on supported terminals
        if (process.stdin.isTTY) process.stdin.setRawMode(true);
        let pwd = '';
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', function handler(ch) {
            ch = ch.toString();
            if (ch === '\n' || ch === '\r' || ch === '') {
                if (process.stdin.isTTY) process.stdin.setRawMode(false);
                process.stdin.removeListener('data', handler);
                process.stdout.write('\n');
                rl.close();
                resolve(pwd);
            } else if (ch === '') {
                process.exit();
            } else if (ch === '') {
                pwd = pwd.slice(0, -1);
            } else {
                pwd += ch;
            }
        });
    });

    console.log('\nLogging in...');
    const loginRes = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.token) {
        console.error('Login failed:', loginData.message || loginRes.status);
        process.exit(1);
    }

    console.log('Logged in. Starting re-analysis (this may take several minutes)...\n');

    const reanalyzeRes = await fetch(`${API}/api/admin/reanalyze-zero-scores`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    const data = await reanalyzeRes.json();

    if (!reanalyzeRes.ok) {
        console.error('Re-analysis failed:', data.message || reanalyzeRes.status);
        process.exit(1);
    }

    console.log('=== Done ===');
    console.log(`Total:     ${data.summary.total}`);
    console.log(`Succeeded: ${data.summary.succeeded}`);
    console.log(`Skipped:   ${data.summary.skipped} (non-PDF resumes)`);
    console.log(`Failed:    ${data.summary.failed}`);

    if (data.results) {
        console.log('\nResults:');
        for (const r of data.results) {
            if (r.status === 'success') {
                console.log(`  ✓ Candidate ${r.candidateId} → ${r.score}/100 (${r.tier})`);
            } else if (r.status === 'failed') {
                console.log(`  ✗ Candidate ${r.candidateId} → ${r.error}`);
            } else {
                console.log(`  - Candidate ${r.candidateId} → skipped (${r.reason})`);
            }
        }
    }
}

run().catch(err => { console.error('Error:', err.message); process.exit(1); });
