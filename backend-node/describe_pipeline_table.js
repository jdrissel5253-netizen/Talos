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

async function describeTable() {
    try {
        const client = await pool.connect();
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'candidate_pipeline'
        `);
        console.log('COLUMNS:');
        res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
        client.release();
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

describeTable();
