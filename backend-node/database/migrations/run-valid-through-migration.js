require('dotenv').config();
const { pool, query } = require('../../config/database-pg');

async function run() {
    console.log('Running valid_through migration...');
    try {
        await query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS valid_through DATE');
        console.log('  column added (or already existed)');

        const result = await query(
            "UPDATE jobs SET valid_through = (created_at + INTERVAL '90 days')::DATE WHERE valid_through IS NULL"
        );
        console.log(`  backfilled ${result.rowCount} rows`);

        console.log('Done.');
    } catch (e) {
        console.error('Migration failed:', e.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

run();
