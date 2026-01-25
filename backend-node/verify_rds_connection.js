const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkConnection() {
    // Try with .env first
    console.log('--- Testing Connection with .env credentials ---');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`User: ${process.env.DB_USER}`);

    // We try to connect to the 'postgres' default database first to test auth
    // because 'talos' might not exist yet if it's a fresh instance
    const client1 = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        database: 'postgres',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });

    try {
        await client1.connect();
        console.log('✅ Success! Connected to RDS (postgres DB) using .env credentials.');

        // Now check if our specific DB exists
        const res = await client1.query("SELECT 1 FROM pg_database WHERE datname = 'talos'");
        if (res.rows.length > 0) {
            console.log('✅ Database "talos" exists.');
        } else {
            console.log('⚠️ Database "talos" does NOT exist. It may need to be created.');
        }
        await client1.end();
    } catch (err) {
        console.error('❌ Failed to connect with .env credentials:', err.message);

        // If .env fails, try the hardcoded endpoints from the status file
        console.log('\n--- Testing Connection with Hardcoded "talos_admin" credentials ---');
        const rdsEndpoint = 'talos-db.cktooy4kca01.us-east-1.rds.amazonaws.com';
        console.log(`Host: ${rdsEndpoint}`);

        const client2 = new Client({
            host: rdsEndpoint,
            port: 5432,
            database: 'postgres',
            user: 'talos_admin',
            password: process.env.DB_PASSWORD, // Assuming password is correct even if user differs
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000
        });

        try {
            await client2.connect();
            console.log('✅ Success! Connected to RDS using talos_admin.');
            await client2.end();
            return;
        } catch (err2) {
            console.error('❌ Failed to connect with talos_admin:', err2.message);
        }

    }
}

checkConnection();
