const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../talos.db');
const db = new Database(dbPath);

console.log('📊 Checking existing database schema...\n');

// Get all tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

console.log('Existing tables:');
tables.forEach(table => {
    console.log(`\n📋 Table: ${table.name}`);
    const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
    columns.forEach(col => {
        console.log(`   - ${col.name} (${col.type})${col.notnull ? ' NOT NULL' : ''}${col.pk ? ' PRIMARY KEY' : ''}`);
    });
});

db.close();
