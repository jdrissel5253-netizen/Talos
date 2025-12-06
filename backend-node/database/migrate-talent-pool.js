const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../talos.db');
const schemaPath = path.join(__dirname, 'schema-talent-pool.sql');

console.log('📦 Migrating talent pool schema...\n');

const db = new Database(dbPath);
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split schema into individual statements and execute them
const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

try {
    for (const statement of statements) {
        db.exec(statement);
    }
    console.log('✅ Talent pool schema created successfully!');
    console.log('✅ Tables created:');
    console.log('   - candidates');
    console.log('   - jobs');
    console.log('   - candidate_job_applications');
    console.log('   - interview_notes');
    console.log('   - candidate_tags\n');
} catch (err) {
    console.error('❌ Error creating schema:', err.message);
    process.exit(1);
} finally {
    db.close();
}
