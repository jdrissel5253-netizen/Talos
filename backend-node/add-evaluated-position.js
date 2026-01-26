const { Pool } = require('pg');

const pool = new Pool({
    host: 'awseb-e-wsmmcq2zc3-stack-awsebrdsdatabase-ehqy2gn0naaf.ckj8wi4e4l42.us-east-1.rds.amazonaws.com',
    port: 5432,
    database: 'ebdb',
    user: 'talosuser',
    password: 'TalosDB2026!',
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        console.log('Connecting to database...');

        // Add the evaluated_position column
        await pool.query(`
            ALTER TABLE candidate_pipeline
            ADD COLUMN IF NOT EXISTS evaluated_position VARCHAR(255)
        `);
        console.log('Added evaluated_position column');

        // Verify the column exists
        const result = await pool.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'candidate_pipeline'
        `);
        console.log('Current columns:', result.rows.map(r => r.column_name));

        console.log('Migration complete!');
    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await pool.end();
    }
}

migrate();
