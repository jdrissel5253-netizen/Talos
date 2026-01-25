const { Pool } = require('pg');

const pool = new Pool({
    host: 'awseb-e-wsmmcq2zc3-stack-awsebrdsdatabase-ehqy2gn0naaf.ckj8wi4e4l42.us-east-1.rds.amazonaws.com',
    port: 5432,
    database: 'ebdb',
    user: 'talosuser',
    password: 'TalosAdmin2024!New',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
});

async function checkTables() {
    try {
        const client = await pool.connect();
        console.log('Connected to DB.');

        const tables = ['candidate_pipeline', 'communication_log'];

        for (const table of tables) {
            try {
                const res = await client.query(`SELECT to_regclass('public.${table}') as exists`);
                console.log(`Table '${table}': ${res.rows[0].exists ? 'EXISTS' : 'MISSING'}`);
            } catch (e) {
                console.log(`Error checking ${table}: ${e.message}`);
            }
        }

        client.release();
    } catch (err) {
        console.error('Connection error:', err.message);
    } finally {
        await pool.end();
    }
}

checkTables();
