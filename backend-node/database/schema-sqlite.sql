-- Talos HVAC Resume Analysis Database Schema (SQLite)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    company_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Analysis batches table
CREATE TABLE IF NOT EXISTS batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT,
    total_resumes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending' -- pending, analyzing, completed, error
);

-- Resume analyses table
CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER UNIQUE REFERENCES candidates(id) ON DELETE CASCADE,

    -- Overall scores
    overall_score INTEGER,
    score_out_of_10 INTEGER,
    summary TEXT,

    -- Technical skills
    technical_skills_score INTEGER,
    technical_skills_found TEXT, -- JSON array of skills found
    technical_skills_missing TEXT, -- JSON array of missing skills
    technical_skills_feedback TEXT,

    -- Certifications
    certifications_score INTEGER,
    certifications_found TEXT, -- JSON array
    certifications_recommended TEXT, -- JSON array
    certifications_feedback TEXT,

    -- Experience
    experience_score INTEGER,
    years_of_experience REAL,
    relevant_experience TEXT, -- JSON array
    experience_feedback TEXT,

    -- Presentation quality
    presentation_score INTEGER,
    presentation_strengths TEXT, -- JSON array
    presentation_improvements TEXT, -- JSON array
    presentation_feedback TEXT,

    -- Summary fields
    strengths TEXT, -- JSON array
    weaknesses TEXT, -- JSON array
    recommendations TEXT, -- JSON array
    hiring_recommendation TEXT, -- STRONG_YES, YES, MAYBE, NO, STRONG_NO

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_batches_user_id ON batches(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_batch_id ON candidates(batch_id);
CREATE INDEX IF NOT EXISTS idx_analyses_candidate_id ON analyses(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_analyses_score ON analyses(score_out_of_10);

-- Triggers to auto-update updated_at
CREATE TRIGGER IF NOT EXISTS update_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_analyses_updated_at
AFTER UPDATE ON analyses
FOR EACH ROW
BEGIN
    UPDATE analyses SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
