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

async function verifyData() {
    try {
        console.log('Connecting to RDS...');
        const client = await pool.connect();
        console.log('Connected.');

        const results = {};
        results.users = (await client.query('SELECT count(*) as count FROM "users"')).rows[0].count;
        results.candidates = (await client.query('SELECT count(*) as count FROM "candidates"')).rows[0].count;
        results.jobs = (await client.query('SELECT count(*) as count FROM "jobs"')).rows[0].count;

        console.log('RESULTSJSON:' + JSON.stringify(results));

        client.release();
    } catch (err) {
        console.error('Connection error:', err.message);
    } finally {
        await pool.end();
    }
}

verifyData();
