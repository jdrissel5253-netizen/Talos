const fs = require('fs');
const path = require('path');
const { db } = require('../config/database');
const bcrypt = require('bcryptjs');

// Read and execute schema
const schemaPath = path.join(__dirname, 'schema-sqlite.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Read and execute jobs/talent pool schema
const jobsSchemaPath = path.join(__dirname, 'schema-jobs-talent-pool.sql');
const jobsSchema = fs.readFileSync(jobsSchemaPath, 'utf8');

console.log('🔧 Initializing database...');

try {
    // Execute entire schema at once
    db.exec(schema);
    console.log('✅ Database schema created successfully');

    // Execute jobs and talent pool schema
    db.exec(jobsSchema);
    console.log('✅ Jobs and talent pool schema created successfully');

    // Create a default test user
    const defaultEmail = 'test@talos.com';
    const defaultPassword = 'password123';

    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(defaultEmail);

    if (!existingUser) {
        const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
        const stmt = db.prepare('INSERT INTO users (email, password_hash, company_name) VALUES (?, ?, ?)');
        const result = stmt.run(defaultEmail, hashedPassword, 'Talos Demo Company');

        console.log('✅ Default test user created:');
        console.log(`   Email: ${defaultEmail}`);
        console.log(`   Password: ${defaultPassword}`);
        console.log(`   User ID: ${result.lastInsertRowid}`);
    } else {
        console.log('ℹ️  Default test user already exists');
        console.log(`   Email: ${defaultEmail}`);
        console.log(`   User ID: ${existingUser.id}`);
    }

    console.log('\n🎉 Database initialization complete!');
} catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
}
