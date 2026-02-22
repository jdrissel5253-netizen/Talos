require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
});

async function checkTables() {
    try {
        const client = await pool.connect();
        console.log('Connected to DB.');

        const tables = ['candidate_pipeline', 'communication_log', 'job_requirements'];

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
