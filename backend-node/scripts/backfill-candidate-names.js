/**
 * Backfill full_name for existing candidates.
 *
 * Existing candidates were stored with only a filename (e.g.
 * "resumejustinmcclung.pdf"), which displays poorly in the Talent Pool
 * and Jobs Management UIs. This script downloads each candidate's resume,
 * extracts their name with a cheap dedicated AI call (does NOT re-run the
 * full analysis or change scores), and stores it in candidates.full_name.
 *
 * Usage (run from backend-node/):
 *   node scripts/backfill-candidate-names.js
 *   node scripts/backfill-candidate-names.js --dry-run
 *   node scripts/backfill-candidate-names.js --limit 20
 *
 * Requires the same .env as the server (ANTHROPIC_API_KEY, AWS_*, etc.).
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const { extractResumeText, extractCandidateNameOnly } = require('../services/resumeAnalyzer');
const { downloadResumeToTemp, isS3Key } = require('../config/s3');
const { candidateService } = require('../services/databaseService');
const db = require('../config/database');

const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT_ARG = process.argv.indexOf('--limit');
const LIMIT = LIMIT_ARG !== -1 ? parseInt(process.argv[LIMIT_ARG + 1]) || 50 : null;
// Delay between API calls to avoid rate limiting (ms)
const DELAY_MS = 1000;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function backfillCandidateNames() {
    console.log(`\n=== Backfill Candidate Full Names ===`);
    if (DRY_RUN) console.log('DRY RUN — no changes will be written.\n');
    if (LIMIT) console.log(`Limit: ${LIMIT} candidates.\n`);

    const { rows: candidates } = await db.query(`
        SELECT id, filename, file_path
        FROM candidates
        WHERE full_name IS NULL
          AND file_path IS NOT NULL
        ORDER BY id ASC
        ${LIMIT ? `LIMIT ${LIMIT}` : ''}
    `);

    if (candidates.length === 0) {
        console.log('No candidates need backfilling. Nothing to do.');
        return;
    }

    console.log(`Found ${candidates.length} candidates to process.\n`);

    let succeeded = 0;
    let notFound = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < candidates.length; i++) {
        const row = candidates[i];
        const label = `[${i + 1}/${candidates.length}] candidate ${row.id} (${row.filename})`;

        const ext = path.extname(row.file_path || row.filename || '').toLowerCase();
        if (ext && ext !== '.pdf' && ext !== '.docx' && ext !== '.doc') {
            console.log(`${label} — SKIPPED (unsupported file type ${ext})`);
            skipped++;
            continue;
        }

        let tempPath = null;
        try {
            const filePath = isS3Key(row.file_path)
                ? (tempPath = await downloadResumeToTemp(row.file_path))
                : row.file_path;

            if (!fs.existsSync(filePath)) {
                console.log(`${label} — SKIPPED (file not found: ${filePath})`);
                skipped++;
                continue;
            }

            const resumeText = await extractResumeText(filePath);
            const candidateName = await extractCandidateNameOnly(resumeText);

            if (!candidateName) {
                console.log(`${label} — no name found`);
                notFound++;
                continue;
            }

            console.log(`${label} — "${candidateName}"`);

            if (!DRY_RUN) {
                await candidateService.updateFullName(row.id, candidateName);
            }

            succeeded++;
        } catch (err) {
            console.log(`${label} — FAILED: ${err.message}`);
            failed++;
        } finally {
            if (tempPath) {
                try { fs.unlinkSync(tempPath); } catch (_) {}
            }
        }

        if (i < candidates.length - 1) {
            await sleep(DELAY_MS);
        }
    }

    console.log(`\n=== Done ===`);
    console.log(`  Succeeded : ${succeeded}`);
    console.log(`  No name   : ${notFound}`);
    console.log(`  Skipped   : ${skipped}`);
    console.log(`  Failed    : ${failed}`);
    if (DRY_RUN) console.log('\n(Dry run — no data was changed.)');
}

backfillCandidateNames()
    .catch(err => {
        console.error('Fatal error:', err.message);
        process.exit(1);
    })
    .finally(() => {
        db.pool?.end?.();
    });
