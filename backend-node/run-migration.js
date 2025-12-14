const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Connect to database
const dbPath = path.join(__dirname, 'talos.db');
const db = new Database(dbPath);

console.log('Running migration: add-template-tracking.sql');

try {
  // Read migration file
  const migrationPath = path.join(__dirname, 'database', 'migrations', 'add-template-tracking.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  // Split by semicolons and execute each statement
  const statements = migrationSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

  statements.forEach((statement, index) => {
    try {
      console.log(`Executing statement ${index + 1}...`);
      db.exec(statement);
      console.log(`✓ Statement ${index + 1} executed successfully`);
    } catch (error) {
      // Ignore errors for columns that already exist
      if (error.message.includes('duplicate column name')) {
        console.log(`⚠ Statement ${index + 1} skipped (column already exists)`);
      } else {
        console.error(`✗ Error executing statement ${index + 1}:`, error.message);
      }
    }
  });

  console.log('\n✅ Migration completed successfully!');

  // Verify the changes
  const tableInfo = db.pragma('table_info(communication_log)');
  console.log('\nCurrent communication_log schema:');
  tableInfo.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
  });

} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}
