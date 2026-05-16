require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'talos-db.ckj8wi4e4l42.us-east-1.rds.amazonaws.com',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'ebdb',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: { rejectUnauthorized: false }
});

const sql = `
CREATE TABLE IF NOT EXISTS demo_requests (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    company_size VARCHAR(50),
    current_challenges TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

pool.query(sql)
    .then(() => { console.log('demo_requests table created (or already exists)'); pool.end(); })
    .catch(err => { console.error('Migration failed:', err.message); pool.end(); process.exit(1); });
