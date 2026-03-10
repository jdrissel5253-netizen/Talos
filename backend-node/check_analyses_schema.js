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

async function check() {
    try {
        const client = await pool.connect();
        const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'analyses' AND column_name = 'technical_skills_found'");
        console.log(res.rows.length > 0 ? 'Existent' : 'Missing');
        client.release();
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
