/**
 * Versioned migrations: numbered .sql files in ./versioned, each applied once
 * inside a transaction and recorded in schema_migrations.
 *
 * Runs from run-all-migrations.js (the EB deploy hook) and again at server
 * startup. An advisory lock makes concurrent runs safe; already-applied files
 * are skipped, so running it twice is harmless.
 */
const fs = require('fs');
const path = require('path');

const LOCK_ID = 73_410_001; // arbitrary, unique to this runner
const DIR = path.join(__dirname, 'versioned');

function listMigrations() {
    return fs.readdirSync(DIR)
        .filter(f => /^\d{3}_[\w-]+\.sql$/.test(f))
        .sort();
}

async function runVersionedMigrations(pool, log = console) {
    const client = await pool.connect();
    try {
        await client.query('SELECT pg_advisory_lock($1)', [LOCK_ID]);
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id          VARCHAR(255) PRIMARY KEY,
                applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);
        const { rows } = await client.query('SELECT id FROM schema_migrations');
        const applied = new Set(rows.map(r => r.id));
        const pending = listMigrations().filter(f => !applied.has(f));

        for (const file of pending) {
            const sql = fs.readFileSync(path.join(DIR, file), 'utf8');
            try {
                await client.query('BEGIN');
                await client.query(sql);
                await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [file]);
                await client.query('COMMIT');
                log.info(`Applied migration ${file}`);
            } catch (err) {
                await client.query('ROLLBACK');
                throw new Error(`Migration ${file} failed: ${err.message}`);
            }
        }
        return pending;
    } finally {
        try { await client.query('SELECT pg_advisory_unlock($1)', [LOCK_ID]); } catch { /* connection gone */ }
        client.release();
    }
}

module.exports = { runVersionedMigrations, listMigrations };
