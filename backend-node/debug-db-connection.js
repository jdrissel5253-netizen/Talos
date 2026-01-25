const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    host: 'awseb-e-wsmmcq2zc3-stack-awsebrdsdatabase-ehqy2gn0naaf.ckj8wi4e4l42.us-east-1.rds.amazonaws.com',
    port: 5432,
    database: 'ebdb',
    user: 'talosuser',
    password: 'TalosAdmin2024!New',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
});

async function testConnection() {
    const logFile = 'connection_debug.log';
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };

    fs.writeFileSync(logFile, `Starting connection test at ${new Date().toISOString()}\n`);

    try {
        log('Attempting to connect to RDS...');
        const client = await pool.connect();
        log('✅ Successfully connected to client!');

        const res = await client.query('SELECT NOW()');
        log(`✅ Query result: ${res.rows[0].now}`);

        client.release();
    } catch (err) {
        log('❌ Connection failed!');
        log(`Error name: ${err.name}`);
        log(`Error message: ${err.message}`);
        log(`Error code: ${err.code}`);
        log(`Error stack: ${err.stack}`);
    } finally {
        await pool.end();
        log('Pool ended.');
    }
}

testConnection();
