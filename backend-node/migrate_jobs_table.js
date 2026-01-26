require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
});

async function migrate() {
    try {
        const client = await pool.connect();
        console.log('Connected to DB.');

        // List of columns to ensure exist
        const columns = [
            { name: 'company_name', type: 'TEXT' },
            { name: 'description', type: 'TEXT' },
            { name: 'location', type: 'TEXT' },
            { name: 'job_location_type', type: 'TEXT' },
            { name: 'city', type: 'TEXT' },
            { name: 'zip_code', type: 'TEXT' },
            { name: 'job_type', type: 'TEXT' },
            { name: 'required_years_experience', type: 'NUMERIC DEFAULT 0' },
            { name: 'vehicle_required', type: 'INTEGER DEFAULT 0' }, // Postgres doesn't have strict BOOLEAN from SQLite perspective sometimes, but let's use BOOLEAN or INTEGER. key_responsibilities likely TEXT.
            // Wait, standard PG uses BOOLEAN. jobService uses 1/0. Let's use INTEGER for compatibility with SQLite code style or BOOLEAN if preferred.
            // Existing code passes 1 or 0. PG BOOLEAN accepts 1/0. Let's use BOOLEAN.
            // But verify what existing columns are.
            // Let's safe bet: use what schema.sql used (BOOLEAN).
        ];

        // Let's define the full list from jobService.js
        const desiredColumns = {
            'company_name': 'TEXT',
            'job_location_type': 'TEXT',
            'city': 'TEXT',
            'zip_code': 'TEXT',
            'job_type': 'TEXT',
            'required_years_experience': 'NUMERIC DEFAULT 0',
            'vehicle_required': 'BOOLEAN DEFAULT FALSE',
            'position_type': 'TEXT',
            'salary_min': 'NUMERIC',
            'salary_max': 'NUMERIC',
            'pay_range_min': 'NUMERIC',
            'pay_range_max': 'NUMERIC',
            'pay_type': 'TEXT',
            'expected_hours': 'NUMERIC', // or TEXT? '40'
            'work_schedule': 'TEXT',
            'benefits': 'TEXT', // JSON/TEXT
            'key_responsibilities': 'TEXT',
            'qualifications_years': 'TEXT',
            'qualifications_certifications': 'TEXT',
            'qualifications_other': 'TEXT',
            'education_requirements': 'TEXT',
            'other_relevant_titles': 'TEXT',
            'advancement_opportunities': 'BOOLEAN DEFAULT FALSE',
            'advancement_timeline': 'TEXT',
            'company_culture': 'TEXT',
            'ai_generated_description': 'TEXT',
            'flexible_on_title': 'BOOLEAN DEFAULT TRUE',
            'status': 'TEXT DEFAULT \'active\''
        };

        // Get existing columns
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'jobs'
        `);
        const existingColumns = new Set(res.rows.map(r => r.column_name));

        console.log('Existing columns:', Array.from(existingColumns).join(', '));

        for (const [colName, colDef] of Object.entries(desiredColumns)) {
            if (!existingColumns.has(colName)) {
                console.log(`Adding missing column: ${colName} (${colDef})`);
                await client.query(`ALTER TABLE jobs ADD COLUMN ${colName} ${colDef}`);
                console.log(`✅ Added ${colName}`);
            } else {
                console.log(`Column ${colName} exists.`);
            }
        }

        client.release();
        console.log('Migration complete.');
    } catch (err) {
        console.error('Migration error:', err.message);
    } finally {
        await pool.end();
    }
}

migrate();
