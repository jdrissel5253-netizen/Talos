const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const db = new Database(path.join(__dirname, 'talos.db'));

// Tables in dependency order
const tables = [
    'users',
    'batches',
    'jobs',
    'candidates',
    'analyses',
    'candidate_pipeline',
    'communication_log'
];

let sql = '';

tables.forEach(table => {
    try {
        const rows = db.prepare(`SELECT * FROM "${table}"`).all();
        if (rows.length > 0) {
            sql += `\n-- Data for ${table}\n`;
            rows.forEach(row => {
                const keys = Object.keys(row);
                const cols = keys.map(k => `"${k}"`).join(', ');
                const vals = keys.map(k => {
                    const val = row[k];
                    if (val === null) return 'NULL';
                    if (typeof val === 'number') return val;
                    // Escape data for SQL
                    return "'" + String(val).replace(/'/g, "''") + "'";
                }).join(', ');
                sql += `INSERT INTO "${table}" (${cols}) VALUES (${vals}) ON CONFLICT DO NOTHING;\n`;
            });
        }
    } catch (e) {
        console.error(`Error dumping ${table}:`, e.message);
    }
});

fs.writeFileSync('dump.sql', sql);
console.log('✅ SQL dump created: dump.sql');
