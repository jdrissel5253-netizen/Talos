/**
 * Re-analyze organic candidates stuck at score = 0.
 *
 * These candidates have a candidate_pipeline row with tier_score = 0, meaning
 * their resume analysis failed (typically due to a retired model or unsupported
 * file type). This script re-runs the analysis and updates both the analyses
 * table and the candidate_pipeline row.
 *
 * Usage (run from backend-node/):
 *   node scripts/reanalyze-zero-score-candidates.js
 *   node scripts/reanalyze-zero-score-candidates.js --dry-run
 *   node scripts/reanalyze-zero-score-candidates.js --limit 20
 *
 * Requires the same .env as the server (ANTHROPIC_API_KEY, AWS_*, etc.).
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const { analyzeResume } = require('../services/resumeAnalyzer');
const { calculateTier, calculateStarRating } = require('../services/scoringService');
const { downloadResumeToTemp, isS3Key } = require('../config/s3');
const db = require('../config/database');
const logger = require('../services/logger');

// Mirror the same helpers as databaseService so array params work for both PG and SQLite
const USE_POSTGRES = process.env.USE_POSTGRES === 'true' || process.env.NODE_ENV === 'production';
const toNum = (v) => { const n = Number(v); return isNaN(n) ? 0 : n; };
const toArr = (v) => {
    if (!v) return USE_POSTGRES ? [] : '[]';
    if (typeof v === 'string' && v.startsWith('[')) {
        try { v = JSON.parse(v); } catch (_) {}
    }
    if (USE_POSTGRES) return Array.isArray(v) ? v.map(String) : [String(v)];
    return JSON.stringify(Array.isArray(v) ? v : [v]);
};

const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT_ARG = process.argv.indexOf('--limit');
const LIMIT = LIMIT_ARG !== -1 ? parseInt(process.argv[LIMIT_ARG + 1]) || 50 : null;
// Delay between API calls to avoid rate limiting (ms)
const DELAY_MS = 1500;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function reanalyzeZeroScoreCandidates() {
    console.log(`\n=== Re-analyze Zero-Score Candidates ===`);
    if (DRY_RUN) console.log('DRY RUN — no changes will be written.\n');
    if (LIMIT) console.log(`Limit: ${LIMIT} candidates.\n`);

    // Find all pipeline entries with tier_score = 0 that have a resume on file.
    // Filter to tags containing 'public-application' to target organic applicants,
    // but also catch any with empty tags just in case.
    const { rows: candidates } = await db.query(`
        SELECT
            cp.id            AS pipeline_id,
            cp.candidate_id,
            cp.job_id,
            cp.evaluated_position,
            cp.pipeline_status,
            cp.tags,
            c.file_path,
            c.filename,
            c.applicant_email,
            j.position_type,
            j.required_years_experience,
            j.flexible_on_title,
            j.city,
            j.zip_code,
            j.title          AS job_title
        FROM candidate_pipeline cp
        JOIN candidates c ON cp.candidate_id = c.id
        JOIN jobs j ON cp.job_id = j.id
        WHERE cp.tier_score = 0
          AND c.file_path IS NOT NULL
          AND j.deleted_at IS NULL
        ORDER BY cp.id ASC
        ${LIMIT ? `LIMIT ${LIMIT}` : ''}
    `);

    if (candidates.length === 0) {
        console.log('No zero-score candidates found. Nothing to do.');
        return;
    }

    console.log(`Found ${candidates.length} zero-score pipeline entries to process.\n`);

    let succeeded = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < candidates.length; i++) {
        const row = candidates[i];
        const label = `[${i + 1}/${candidates.length}] candidate ${row.candidate_id} (pipeline ${row.pipeline_id})`;

        // Determine position type: prefer evaluated_position, fall back to job's position_type
        const positionType = row.evaluated_position || row.position_type || 'HVAC Service Technician';
        const requiredYears = row.required_years_experience || 2;
        const flexibleOnTitle = row.flexible_on_title !== false;
        const jobLocation = [row.city, row.zip_code].filter(Boolean).join(', ') || null;

        // Skip non-PDF resumes (DOCX etc.) — they still can't be analyzed
        const ext = path.extname(row.file_path || row.filename || '').toLowerCase();
        if (ext && ext !== '.pdf') {
            console.log(`${label} — SKIPPED (${ext} file, PDF only)`);
            skipped++;
            continue;
        }

        console.log(`${label} — ${row.filename || row.file_path} | pos: ${positionType}`);

        let tempPath = null;
        try {
            // Download from S3 if needed
            const filePath = isS3Key(row.file_path)
                ? (tempPath = await downloadResumeToTemp(row.file_path))
                : row.file_path;

            if (!fs.existsSync(filePath)) {
                console.log(`  → SKIPPED (file not found locally: ${filePath})`);
                skipped++;
                continue;
            }

            // Run analysis
            const analysis = await analyzeResume(filePath, positionType, requiredYears, flexibleOnTitle, jobLocation);

            const score = Number(analysis.overallScore) || 0;
            const tier = calculateTier(score);
            const starRating = calculateStarRating(score);

            console.log(`  → score: ${score} | tier: ${tier} | rec: ${analysis.hiringRecommendation}`);

            if (!DRY_RUN) {
                // Upsert analysis record
                await db.query(`
                    INSERT INTO analyses (
                        candidate_id, overall_score, score_out_of_10, summary,
                        technical_skills_score, technical_skills_found, technical_skills_missing, technical_skills_feedback,
                        certifications_score, certifications_found, certifications_recommended, certifications_feedback,
                        experience_score, years_of_experience, relevant_experience, experience_feedback,
                        presentation_score, presentation_strengths, presentation_improvements, presentation_feedback,
                        strengths, weaknesses, recommendations, hiring_recommendation
                    ) VALUES (
                        $1, $2, $3, $4,
                        $5, $6, $7, $8,
                        $9, $10, $11, $12,
                        $13, $14, $15, $16,
                        $17, $18, $19, $20,
                        $21, $22, $23, $24
                    )
                    ON CONFLICT (candidate_id) DO UPDATE SET
                        overall_score              = excluded.overall_score,
                        score_out_of_10            = excluded.score_out_of_10,
                        summary                    = excluded.summary,
                        technical_skills_score     = excluded.technical_skills_score,
                        technical_skills_found     = excluded.technical_skills_found,
                        technical_skills_missing   = excluded.technical_skills_missing,
                        technical_skills_feedback  = excluded.technical_skills_feedback,
                        certifications_score       = excluded.certifications_score,
                        certifications_found       = excluded.certifications_found,
                        certifications_recommended = excluded.certifications_recommended,
                        certifications_feedback    = excluded.certifications_feedback,
                        experience_score           = excluded.experience_score,
                        years_of_experience        = excluded.years_of_experience,
                        relevant_experience        = excluded.relevant_experience,
                        experience_feedback        = excluded.experience_feedback,
                        presentation_score         = excluded.presentation_score,
                        presentation_strengths     = excluded.presentation_strengths,
                        presentation_improvements  = excluded.presentation_improvements,
                        presentation_feedback      = excluded.presentation_feedback,
                        strengths                  = excluded.strengths,
                        weaknesses                 = excluded.weaknesses,
                        recommendations            = excluded.recommendations,
                        hiring_recommendation      = excluded.hiring_recommendation,
                        updated_at                 = CURRENT_TIMESTAMP
                `, [
                    row.candidate_id,
                    toNum(score),
                    Math.round(score / 10),
                    analysis.summary || '',
                    toNum(analysis.technicalSkills?.score),
                    toArr(analysis.technicalSkills?.found),
                    toArr(analysis.technicalSkills?.missing),
                    analysis.technicalSkills?.feedback || '',
                    toNum(analysis.certifications?.score),
                    toArr(analysis.certifications?.found),
                    toArr(analysis.certifications?.recommended),
                    analysis.certifications?.feedback || '',
                    toNum(analysis.experience?.score),
                    analysis.experience?.yearsOfExperience || 0,
                    toArr(analysis.experience?.relevantExperience),
                    analysis.experience?.feedback || '',
                    toNum(analysis.presentationQuality?.score),
                    toArr(analysis.presentationQuality?.strengths),
                    toArr(analysis.presentationQuality?.improvements),
                    analysis.presentationQuality?.feedback || '',
                    toArr(analysis.strengths),
                    toArr(analysis.weaknesses),
                    toArr(analysis.recommendations),
                    analysis.hiringRecommendation || 'MAYBE'
                ]);

                // Update the pipeline entry
                await db.query(`
                    UPDATE candidate_pipeline
                    SET tier              = $1,
                        tier_score        = $2,
                        star_rating       = $3,
                        give_them_a_chance = $4,
                        ai_summary        = $5
                    WHERE id = $6
                `, [
                    tier,
                    Math.round(score),
                    Math.round(starRating * 10) / 10,
                    score >= 40 && score < 50 ? 1 : 0,
                    `Re-analyzed. Score: ${score}/100. ${analysis.hiringRecommendation || ''}.`,
                    row.pipeline_id
                ]);

                // Mark candidate as completed
                await db.query(
                    `UPDATE candidates SET status = 'completed' WHERE id = $1`,
                    [row.candidate_id]
                );
            }

            succeeded++;
        } catch (err) {
            console.log(`  → FAILED: ${err.message}`);
            failed++;
        } finally {
            // Clean up temp file if it wasn't already deleted by analyzeResume
            if (tempPath) {
                try { fs.unlinkSync(tempPath); } catch (_) {}
            }
        }

        // Pause between calls to avoid hitting API rate limits
        if (i < candidates.length - 1) {
            await sleep(DELAY_MS);
        }
    }

    console.log(`\n=== Done ===`);
    console.log(`  Succeeded : ${succeeded}`);
    console.log(`  Skipped   : ${skipped}`);
    console.log(`  Failed    : ${failed}`);
    if (DRY_RUN) console.log('\n(Dry run — no data was changed.)');
}

reanalyzeZeroScoreCandidates().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
