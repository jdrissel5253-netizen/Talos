const { pool, query } = require('../config/database-pg');

const schema = `
-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER, -- REFERENCES users(id) ON DELETE CASCADE, -- User table might not exist yet or we skip FK for now to be safe, but let's try
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

    -- Pipeline status
    pipeline_status VARCHAR(50) DEFAULT 'new',

    -- Tier information
    tier VARCHAR(50),
    tier_score INTEGER,
    star_rating NUMERIC,

    -- Special flags
    give_them_a_chance BOOLEAN DEFAULT FALSE,
    vehicle_status VARCHAR(50),

    -- AI-generated summary
    ai_summary TEXT,

    -- Notes and tags
    internal_notes TEXT,
    tags TEXT, -- JSON string or we could use JSONB

    -- Communication tracking
    contacted_via VARCHAR(50),
    contacted_at TIMESTAMP,
    last_message_sent TEXT,

    -- Metadata
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

-- Triggers for updated_at (reusing function from schema.sql if exists, else create it)
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

async function init() {
    try {
        console.log('Running jobs/pipeline schema...');
        await query(schema);
        console.log('✅ Jobs and Pipeline schema created.');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await pool.end();
    }
}

init();
