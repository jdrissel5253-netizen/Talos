const { db } = require('../config/database');

console.log('📊 Talos Database Viewer\n');
console.log('='.repeat(80));

// View users
console.log('\n👥 USERS:');
const users = db.prepare('SELECT id, email, company_name, created_at FROM users').all();
console.table(users);

// View batches
console.log('\n📦 BATCHES:');
const batches = db.prepare('SELECT id, user_id, name, total_resumes, created_at FROM batches ORDER BY created_at DESC').all();
console.table(batches);

// View candidates
console.log('\n👤 CANDIDATES:');
const candidates = db.prepare('SELECT id, batch_id, filename, status, upload_date FROM candidates ORDER BY upload_date DESC LIMIT 20').all();
console.table(candidates);

// View analyses with scores
console.log('\n📋 ANALYSES (Summary):');
const analyses = db.prepare(`
    SELECT
        a.id,
        c.filename,
        a.score_out_of_10 as score,
        a.hiring_recommendation,
        a.summary
    FROM analyses a
    JOIN candidates c ON a.candidate_id = c.id
    ORDER BY a.score_out_of_10 DESC
    LIMIT 20
`).all();
console.table(analyses);

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Database Stats:`);
console.log(`   Total Users: ${users.length}`);
console.log(`   Total Batches: ${batches.length}`);
console.log(`   Total Candidates: ${candidates.length}`);
console.log(`   Total Analyses: ${analyses.length}`);
console.log('\n✅ Database viewer complete!\n');
