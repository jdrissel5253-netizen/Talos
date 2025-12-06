-- Talos HVAC Resume Analysis Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analysis batches table
CREATE TABLE IF NOT EXISTS batches (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    total_resumes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending' -- pending, analyzing, completed, error
);

-- Resume analyses table
CREATE TABLE IF NOT EXISTS analyses (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER UNIQUE REFERENCES candidates(id) ON DELETE CASCADE,

    -- Overall scores
    overall_score INTEGER,
    score_out_of_10 INTEGER,
    summary TEXT,

    -- Technical skills
    technical_skills_score INTEGER,
    technical_skills_found TEXT[], -- Array of skills found
    technical_skills_missing TEXT[], -- Array of missing skills
    technical_skills_feedback TEXT,

    -- Certifications
    certifications_score INTEGER,
    certifications_found TEXT[],
    certifications_recommended TEXT[],
    certifications_feedback TEXT,

    -- Experience
    experience_score INTEGER,
    years_of_experience NUMERIC(4,1),
    relevant_experience TEXT[],
    experience_feedback TEXT,

    -- Presentation quality
    presentation_score INTEGER,
    presentation_strengths TEXT[],
    presentation_improvements TEXT[],
    presentation_feedback TEXT,

    -- Summary fields
    strengths TEXT[],
    weaknesses TEXT[],
    recommendations TEXT[],
    hiring_recommendation VARCHAR(50), -- STRONG_YES, YES, MAYBE, NO, STRONG_NO

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_batches_user_id ON batches(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_batch_id ON candidates(batch_id);
CREATE INDEX IF NOT EXISTS idx_analyses_candidate_id ON analyses(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_analyses_score ON analyses(score_out_of_10);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
