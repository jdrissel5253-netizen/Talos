/**
 * Consolidated migration script for production database
 * Run this to create all missing tables and columns
 */
const { pool, query } = require('../../config/database-pg');

const migrations = `
-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    required_years_experience NUMERIC DEFAULT 0,
    vehicle_required BOOLEAN DEFAULT FALSE,
    position_type VARCHAR(100),
    salary_min NUMERIC,
    salary_max NUMERIC,
    flexible_on_title BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job requirements/skills
CREATE TABLE IF NOT EXISTS job_requirements (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    requirement_type VARCHAR(50),
    requirement_text TEXT NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Extended candidate pipeline status
CREATE TABLE IF NOT EXISTS candidate_pipeline (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    pipeline_status VARCHAR(50) DEFAULT 'new',
    tier VARCHAR(50),
    tier_score INTEGER,
    star_rating NUMERIC,
    give_them_a_chance BOOLEAN DEFAULT FALSE,
    vehicle_status VARCHAR(50),
    ai_summary TEXT,
    internal_notes TEXT,
    tags TEXT,
    evaluated_position TEXT,
    contacted_via VARCHAR(50),
    contacted_at TIMESTAMP,
    last_message_sent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(candidate_id, job_id)
);

-- Communication log
CREATE TABLE IF NOT EXISTS communication_log (
    id SERIAL PRIMARY KEY,
    candidate_pipeline_id INTEGER REFERENCES candidate_pipeline(id) ON DELETE CASCADE,
    communication_type VARCHAR(50) NOT NULL,
    message_content TEXT,
    template_type VARCHAR(50),
    template_tone VARCHAR(50),
    is_nudge BOOLEAN DEFAULT FALSE,
    scheduling_link TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'sent'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_candidate_pipeline_job_id ON candidate_pipeline(job_id);
CREATE INDEX IF NOT EXISTS idx_candidate_pipeline_candidate_id ON candidate_pipeline(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_pipeline_status ON candidate_pipeline(pipeline_status);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_candidate_pipeline_updated_at ON candidate_pipeline;
CREATE TRIGGER update_candidate_pipeline_updated_at BEFORE UPDATE ON candidate_pipeline
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

// Additional columns for jobs table (run as separate statements to handle IF NOT EXISTS)
const additionalJobColumns = [
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_name TEXT',
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_location_type TEXT',
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS city TEXT',
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS zip_code TEXT',
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_type TEXT',
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pay_range_min NUMERIC',
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pay_range_max NUMERIC',
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pay_type TEXT',
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS expected_hours TEXT',
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS work_schedule TEXT',
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS benefits TEXT',
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS key_responsibilities TEXT',
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS qualifications_years REAL',
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS qualifications_certifications TEXT',
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS qualifications_other TEXT',
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS education_requirements TEXT',
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS other_relevant_titles TEXT',
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS advancement_opportunities BOOLEAN DEFAULT false',
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS advancement_timeline TEXT',
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_culture TEXT',
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ai_generated_description TEXT',
];

// Soft delete support
const softDeleteColumns = [
    'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL',
];

// Additional columns for candidate_pipeline table
const additionalPipelineColumns = [
    'ALTER TABLE candidate_pipeline ADD COLUMN IF NOT EXISTS evaluated_position TEXT',
];

// Salary/pay field precision and CHECK constraints
const salaryMigrations = [
    'ALTER TABLE jobs ALTER COLUMN salary_min TYPE NUMERIC(10,2)',
    'ALTER TABLE jobs ALTER COLUMN salary_max TYPE NUMERIC(10,2)',
    'ALTER TABLE jobs ALTER COLUMN pay_range_min TYPE NUMERIC(10,2)',
    'ALTER TABLE jobs ALTER COLUMN pay_range_max TYPE NUMERIC(10,2)',
    `DO $$ BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.check_constraints
            WHERE constraint_name = 'chk_salary_range'
        ) THEN
            ALTER TABLE jobs ADD CONSTRAINT chk_salary_range
                CHECK (salary_max IS NULL OR salary_min IS NULL OR salary_max >= salary_min);
        END IF;
    END $$`,
    `DO $$ BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.check_constraints
            WHERE constraint_name = 'chk_pay_range'
        ) THEN
            ALTER TABLE jobs ADD CONSTRAINT chk_pay_range
                CHECK (pay_range_max IS NULL OR pay_range_min IS NULL OR pay_range_max >= pay_range_min);
        END IF;
    END $$`,
];

// Audit log table
const auditLogMigration = [
    `CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INTEGER,
        old_value TEXT,
        new_value TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`,
    'CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id)',
];

// Duplicate application prevention - add applicant_email to candidates
const applicantEmailMigration = [
    'ALTER TABLE candidates ADD COLUMN IF NOT EXISTS applicant_email VARCHAR(255)',
    'CREATE INDEX IF NOT EXISTS idx_candidates_applicant_email ON candidates(applicant_email)',
];

// User role column
const roleMigration = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user'",
    `DO $$ BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.check_constraints
            WHERE constraint_name = 'users_role_check'
        ) THEN
            ALTER TABLE users ADD CONSTRAINT users_role_check
                CHECK (role IN ('user', 'admin'));
        END IF;
    END $$`,
];

// Constraint fixes
const constraintFixes = [
    `DO $$ BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'jobs_user_id_fkey' AND table_name = 'jobs'
        ) THEN
            ALTER TABLE jobs ADD CONSTRAINT jobs_user_id_fkey
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
    END $$`,
];

async function runMigrations() {
    console.log('🔧 Running consolidated database migrations...\n');

    try {
        // Run main schema
        console.log('Creating tables (jobs, candidate_pipeline, etc.)...');
        await query(migrations);
        console.log('✅ Tables created successfully\n');

        // Run additional column migrations
        console.log('Adding additional job columns...');
        for (const sql of additionalJobColumns) {
            try {
                await query(sql);
                console.log(`  ✓ ${sql.split('ADD COLUMN IF NOT EXISTS ')[1]?.split(' ')[0] || 'done'}`);
            } catch (e) {
                // Column might already exist
                if (e.code === '42701') {
                    console.log(`  - Column already exists, skipping`);
                } else {
                    console.error(`  ✗ Error: ${e.message}`);
                }
            }
        }

        // Run additional candidate_pipeline column migrations
        console.log('\nAdding additional candidate_pipeline columns...');
        for (const sql of additionalPipelineColumns) {
            try {
                await query(sql);
                console.log(`  ✓ ${sql.split('ADD COLUMN IF NOT EXISTS ')[1]?.split(' ')[0] || 'done'}`);
            } catch (e) {
                if (e.code === '42701') {
                    console.log(`  - Column already exists, skipping`);
                } else {
                    console.error(`  ✗ Error: ${e.message}`);
                }
            }
        }

        // Run soft delete columns
        console.log('\nAdding soft delete support...');
        for (const sql of softDeleteColumns) {
            try {
                await query(sql);
                console.log(`  ✓ ${sql.split('ADD COLUMN IF NOT EXISTS ')[1]?.split(' ')[0] || 'done'}`);
            } catch (e) {
                if (e.code === '42701') {
                    console.log('  - Column already exists, skipping');
                } else {
                    console.error(`  ✗ Error: ${e.message}`);
                }
            }
        }

        // Run salary field precision migrations
        console.log('\nUpdating salary/pay field precision...');
        for (const sql of salaryMigrations) {
            try {
                await query(sql);
                console.log('  ✓ Salary migration applied');
            } catch (e) {
                console.error(`  ✗ Error: ${e.message}`);
            }
        }

        // Run audit log migration
        console.log('\nCreating audit_log table...');
        for (const sql of auditLogMigration) {
            try {
                await query(sql);
                console.log('  ✓ Audit log migration applied');
            } catch (e) {
                console.error(`  ✗ Error: ${e.message}`);
            }
        }

        // Run applicant email migration
        console.log('\nAdding applicant_email to candidates...');
        for (const sql of applicantEmailMigration) {
            try {
                await query(sql);
                console.log(`  ✓ ${sql.includes('INDEX') ? 'Index created' : 'Column added'}`);
            } catch (e) {
                if (e.code === '42701') {
                    console.log('  - Already exists, skipping');
                } else {
                    console.error(`  ✗ Error: ${e.message}`);
                }
            }
        }

        // Run role column migration
        console.log('\nAdding role column to users...');
        for (const sql of roleMigration) {
            try {
                await query(sql);
                console.log('  ✓ Role migration applied');
            } catch (e) {
                if (e.code === '42701') {
                    console.log('  - Column already exists, skipping');
                } else {
                    console.error(`  ✗ Error: ${e.message}`);
                }
            }
        }

        // Run constraint fixes
        console.log('\nApplying constraint fixes...');
        for (const sql of constraintFixes) {
            try {
                await query(sql);
                console.log('  ✓ Constraint applied');
            } catch (e) {
                console.error(`  ✗ Error: ${e.message}`);
            }
        }

        console.log('\n🎉 All migrations completed successfully!');

        // Verify tables exist
        console.log('\nVerifying tables...');
        const tables = await query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        console.log('Tables in database:', tables.rows.map(r => r.table_name).join(', '));

    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigrations();
