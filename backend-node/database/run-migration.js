const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'talos.db');
const migrationPath = path.join(__dirname, 'migrations', 'add-flexible-on-title.sql');

console.log('Connected to the talos.db database.');

const db = new Database(dbPath);

const migration = fs.readFileSync(migrationPath, 'utf8');

try {
    db.exec(migration);
    console.log('✅ Migration completed successfully: flexible_on_title column added to jobs table');
} catch (err) {
    console.error('Error running migration:', err.message);
    process.exit(1);
} finally {
    db.close();
    console.log('Database connection closed.');
}
