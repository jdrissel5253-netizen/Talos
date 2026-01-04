const db = require('./config/database');

async function runMigration() {
    console.log('Running migration: Add template fields to communication_log');

    try {
        // Add template_type column
        try {
            await db.query(`ALTER TABLE communication_log ADD COLUMN template_type TEXT`);
            console.log('Added template_type column');
        } catch (e) {
            console.log('template_type column might already exist:', e.message);
        }

        // Add template_tone column
        try {
            await db.query(`ALTER TABLE communication_log ADD COLUMN template_tone TEXT`);
            console.log('Added template_tone column');
        } catch (e) {
            console.log('template_tone column might already exist:', e.message);
        }

        // Add is_nudge column
        try {
            await db.query(`ALTER TABLE communication_log ADD COLUMN is_nudge BOOLEAN DEFAULT 0`);
            console.log('Added is_nudge column');
        } catch (e) {
            console.log('is_nudge column might already exist:', e.message);
        }

        // Add scheduling_link column
        try {
            await db.query(`ALTER TABLE communication_log ADD COLUMN scheduling_link TEXT`);
            console.log('Added scheduling_link column');
        } catch (e) {
            console.log('scheduling_link column might already exist:', e.message);
        }

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

runMigration();
