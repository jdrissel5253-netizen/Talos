const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Force PostgreSQL mode
process.env.USE_POSTGRES = 'true';

const { query, pool } = require('../config/database-pg');

async function initializeDatabase() {
    console.log('🔧 Initializing PostgreSQL database...');

    try {
        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await query(schema);
        console.log('✅ Database schema created successfully');

        // Create a default test user
        const defaultEmail = 'test@talos.com';
        const defaultPassword = 'password123';

        // Check if user already exists
        const existingUser = await query('SELECT * FROM users WHERE email = $1', [defaultEmail]);

        if (existingUser.rows.length === 0) {
            const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
            const result = await query(
                'INSERT INTO users (email, password_hash, company_name) VALUES ($1, $2, $3) RETURNING id',
                [defaultEmail, hashedPassword, 'Talos Demo Company']
            );

            console.log('✅ Default test user created:');
            console.log(`   Email: ${defaultEmail}`);
            console.log(`   User ID: ${result.rows[0].id}`);
        } else {
            console.log('ℹ️  Default test user already exists');
            console.log(`   Email: ${defaultEmail}`);
            console.log(`   User ID: ${existingUser.rows[0].id}`);
        }

        console.log('\n🎉 Database initialization complete!');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

initializeDatabase();
