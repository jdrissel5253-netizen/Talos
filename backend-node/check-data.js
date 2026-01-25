const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'talos.db');
const db = new Database(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

console.log('--- START DATA CHECK ---');
tables.forEach(t => {
    if (t.name === 'sqlite_sequence') return;
    try {
        const count = db.prepare(`SELECT count(*) as count FROM "${t.name}"`).get();
        console.log(`${t.name}: ${count.count}`);
    } catch (e) {
        console.log(`${t.name}: ERROR ${e.message}`);
    }
});
console.log('--- END DATA CHECK ---');
