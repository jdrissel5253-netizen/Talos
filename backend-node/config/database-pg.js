const { Pool } = require('pg');
const logger = require('../services/logger');

// Use environment variables for database connection
const pool = new Pool({
    host: process.env.DB_HOST || process.env.RDS_HOSTNAME || 'localhost',
    port: process.env.DB_PORT || process.env.RDS_PORT || 5432,
    database: process.env.DB_NAME || process.env.RDS_DB_NAME || 'ebdb',
    user: process.env.DB_USER || process.env.RDS_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || process.env.RDS_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

// Test connection
pool.on('connect', () => {
    logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    logger.error('Unexpected database error (non-fatal)', { error: err.message });
    // Don't crash the app on DB errors
});

// Query helper function
const isProduction = process.env.NODE_ENV === 'production';
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        if (isProduction) {
            if (duration > 1000) {
                logger.warn('Slow query', { text: text.substring(0, 80), duration, rows: res.rowCount });
            }
        } else {
            logger.debug('Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
        }
        return res;
    } catch (error) {
        logger.error('Database query error', { error: error.message, query: text.substring(0, 80) });
        throw error;
    }
};

// Get client for transactions
const getClient = () => {
    return pool.connect();
};

module.exports = {
    query,
    getClient,
    pool
};
