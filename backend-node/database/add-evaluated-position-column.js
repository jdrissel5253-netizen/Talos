const { db } = require('../config/database');

console.log('🔧 Adding evaluated_position column to candidate_pipeline table...');

try {
    // Add the evaluated_position column
    db.exec(`
        ALTER TABLE candidate_pipeline
        ADD COLUMN evaluated_position TEXT;
    `);

    console.log('✅ Successfully added evaluated_position column to candidate_pipeline table');
    console.log('🎉 Migration complete!');
} catch (error) {
    // Check if error is because column already exists
    if (error.message.includes('duplicate column name')) {
        console.log('ℹ️  Column evaluated_position already exists - skipping');
    } else {
        console.error('❌ Error adding column:', error.message);
        process.exit(1);
    }
}
