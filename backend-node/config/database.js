// Detect environment and use appropriate database
const USE_POSTGRES = process.env.USE_POSTGRES === 'true' || process.env.NODE_ENV === 'production';

if (USE_POSTGRES) {
    // Use PostgreSQL (for AWS RDS)
    console.log('🐘 Using PostgreSQL database');
    module.exports = require('./database-pg');
} else {
    // Use SQLite (for local development)
    console.log('📦 Using SQLite database');
    const Database = require('better-sqlite3');
    const path = require('path');

    // Create SQLite database file in the backend-node directory
    const dbPath = path.join(__dirname, '..', 'talos.db');
    const db = new Database(dbPath);

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    console.log(`✅ Connected to SQLite database at ${dbPath}`);

    // Query helper function to match PostgreSQL interface
    const query = (text, params = []) => {
        try {
            // Handle SELECT queries
            if (text.trim().toUpperCase().startsWith('SELECT')) {
                const stmt = db.prepare(text);
                const rows = stmt.all(...params);
                return { rows };
            }

            // Handle INSERT/UPDATE/DELETE with RETURNING clause (PostgreSQL style)
            if (text.includes('RETURNING')) {
                // Convert PostgreSQL RETURNING to SQLite approach
                const mainQuery = text.split('RETURNING')[0].trim();
                const stmt = db.prepare(mainQuery);
                const info = stmt.run(...params);

                // For INSERT, return the inserted row
                if (text.trim().toUpperCase().startsWith('INSERT')) {
                    const selectStmt = db.prepare('SELECT * FROM ' + extractTableName(text) + ' WHERE id = ?');
                    const rows = [selectStmt.get(info.lastInsertRowid)];
                    return { rows };
                }

                return { rows: [{ id: info.lastInsertRowid }] };
            }

            // Handle regular INSERT/UPDATE/DELETE
            const stmt = db.prepare(text);
            const info = stmt.run(...params);
            return { rows: [], rowCount: info.changes };
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    };

    // Helper function to extract table name from INSERT query
    const extractTableName = (sql) => {
        const match = sql.match(/INSERT INTO (\w+)/i);
        return match ? match[1] : null;
    };

    // Get client (no-op for SQLite, but keeps interface compatible)
    const getClient = () => ({
        query: query,
        release: () => {}
    });

    module.exports = {
        query,
        getClient,
        db
    };
}
