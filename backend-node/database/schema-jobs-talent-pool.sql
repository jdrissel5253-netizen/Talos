-- Talos Jobs and Talent Pool Extension Schema (SQLite)

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    required_years_experience REAL DEFAULT 0,
    vehicle_required BOOLEAN DEFAULT 0,
    position_type TEXT, -- 'HVAC Technician', 'HVAC Service Technician', etc.
    salary_min REAL,
    salary_max REAL,
    flexible_on_title BOOLEAN DEFAULT 1, -- If true, accept equivalent roles; if false, apply -9 point penalty
    status TEXT DEFAULT 'active', -- active, paused, closed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Job requirements/skills
CREATE TABLE IF NOT EXISTS job_requirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    requirement_type TEXT, -- 'skill', 'certification', 'experience'
    requirement_text TEXT NOT NULL,
    is_required BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Extended candidate pipeline status
CREATE TABLE IF NOT EXISTS candidate_pipeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,

    -- Pipeline status
    pipeline_status TEXT DEFAULT 'new', -- new, approved, contacted, backup, rejected

    -- Tier information
    tier TEXT, -- green, yellow, red
    tier_score INTEGER, -- 0-100
    star_rating REAL, -- 0-5.0

    -- Special flags
    give_them_a_chance BOOLEAN DEFAULT 0,
    vehicle_status TEXT, -- 'has_vehicle', 'no_vehicle', 'unknown'

    -- AI-generated summary (3 sentences)
    ai_summary TEXT,

    -- Notes and tags
    internal_notes TEXT,
    tags TEXT, -- JSON array

    -- Communication tracking
    contacted_via TEXT, -- 'sms', 'email', null
    contacted_at DATETIME,
    last_message_sent TEXT,

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(candidate_id, job_id)
);

-- Communication log
CREATE TABLE IF NOT EXISTS communication_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_pipeline_id INTEGER REFERENCES candidate_pipeline(id) ON DELETE CASCADE,
    communication_type TEXT NOT NULL, -- 'sms', 'email', 'rejection_email'
    message_content TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'sent' -- sent, delivered, failed
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_job_requirements_job_id ON job_requirements(job_id);
CREATE INDEX IF NOT EXISTS idx_candidate_pipeline_job_id ON candidate_pipeline(job_id);
CREATE INDEX IF NOT EXISTS idx_candidate_pipeline_candidate_id ON candidate_pipeline(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_pipeline_status ON candidate_pipeline(pipeline_status);
CREATE INDEX IF NOT EXISTS idx_candidate_pipeline_tier ON candidate_pipeline(tier);
CREATE INDEX IF NOT EXISTS idx_communication_log_pipeline_id ON communication_log(candidate_pipeline_id);

-- Triggers to auto-update updated_at
CREATE TRIGGER IF NOT EXISTS update_jobs_updated_at
AFTER UPDATE ON jobs
FOR EACH ROW
BEGIN
    UPDATE jobs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_candidate_pipeline_updated_at
AFTER UPDATE ON candidate_pipeline
FOR EACH ROW
BEGIN
    UPDATE candidate_pipeline SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
