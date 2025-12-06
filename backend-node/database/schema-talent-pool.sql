-- Talent Pool Database Schema
-- Stores all candidate resumes and their evaluations

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    location TEXT,
    distance_miles INTEGER,

    -- Position applied for
    position TEXT NOT NULL,

    -- Resume details
    resume_file_path TEXT,
    resume_text TEXT,

    -- Scoring and evaluation
    overall_score INTEGER NOT NULL,
    tier TEXT NOT NULL CHECK(tier IN ('green', 'yellow', 'red')),

    -- Experience breakdown
    years_experience REAL,
    experience_tier TEXT CHECK(experience_tier IN ('required', 'close', 'not_close')),

    -- Resume quality
    resume_quality TEXT CHECK(resume_quality IN ('good', 'mid', 'poor')),

    -- Work history factors
    has_certifications BOOLEAN DEFAULT 0,
    certifications_list TEXT,
    work_gap TEXT CHECK(work_gap IN ('none', 'small', 'large')),
    is_job_hoppy BOOLEAN DEFAULT 0,

    -- Competency scores (for positions with competency evaluation)
    competency_a_score TEXT,  -- Strong/Moderate/Weak
    competency_b_score TEXT,
    competency_c_score TEXT,
    competency_d_score TEXT,

    -- AI analysis
    ai_summary TEXT,
    strengths TEXT,
    concerns TEXT,
    recommendation TEXT,

    -- Metadata
    date_submitted DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'new' CHECK(status IN ('new', 'reviewed', 'interviewing', 'offer', 'hired', 'rejected', 'archived')),
    notes TEXT,

    -- Flags
    is_overqualified BOOLEAN DEFAULT 0,
    flexibility_applied BOOLEAN DEFAULT 1
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_candidates_position ON candidates(position);
CREATE INDEX IF NOT EXISTS idx_candidates_tier ON candidates(tier);
CREATE INDEX IF NOT EXISTS idx_candidates_score ON candidates(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_date ON candidates(date_submitted DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_position_tier ON candidates(position, tier);

-- Create jobs table (for tracking open positions)
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    position_type TEXT NOT NULL,
    required_years INTEGER NOT NULL,
    flexibility_on_title BOOLEAN DEFAULT 1,
    location TEXT,
    description TEXT,
    status TEXT DEFAULT 'open' CHECK(status IN ('open', 'closed', 'filled')),
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    filled_date DATETIME
);

-- Create candidate_job_applications table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS candidate_job_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    score_for_job INTEGER,
    tier_for_job TEXT,
    status TEXT DEFAULT 'applied' CHECK(status IN ('applied', 'screening', 'interviewing', 'offer', 'hired', 'rejected')),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE(candidate_id, job_id)
);

-- Create interview_notes table
CREATE TABLE IF NOT EXISTS interview_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER NOT NULL,
    interviewer_name TEXT,
    interview_date DATETIME,
    interview_type TEXT CHECK(interview_type IN ('phone', 'video', 'in-person', 'technical')),
    notes TEXT,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    decision TEXT CHECK(decision IN ('advance', 'reject', 'hold')),
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

-- Create tags table for categorizing candidates
CREATE TABLE IF NOT EXISTS candidate_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER NOT NULL,
    tag TEXT NOT NULL,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_candidate_tags_candidate ON candidate_tags(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_tags_tag ON candidate_tags(tag);
