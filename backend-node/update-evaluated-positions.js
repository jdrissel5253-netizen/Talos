const Database = require('better-sqlite3');
const db = new Database('talos.db');

// Update existing candidates to have evaluated_position
db.exec(`UPDATE candidate_pipeline SET evaluated_position = 'HVAC Service Technician' WHERE evaluated_position IS NULL`);

console.log('✅ Updated existing candidates with evaluated_position');

// Check the results
const result = db.prepare(`SELECT COUNT(*) as count FROM candidate_pipeline WHERE evaluated_position = 'HVAC Service Technician'`).get();
console.log(`Candidates with HVAC Service Technician: ${result.count}`);

const all = db.prepare(`SELECT pipeline_id, candidate_id, tier, evaluated_position FROM candidate_pipeline`).all();
console.log('\nAll candidates:');
all.forEach(c => {
  console.log(`  Pipeline ID ${c.pipeline_id}: Candidate ${c.candidate_id}, Tier: ${c.tier}, Position: ${c.evaluated_position}`);
});

db.close();
