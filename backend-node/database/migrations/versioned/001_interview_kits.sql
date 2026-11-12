-- Structured interview kits: shared content, immutable versions, interviews.

-- Kits. account_id NULL = shared Talos content. A company-specific copy sets
-- account_id to the owning account (users.id of the account owner), so shared
-- content and company edits never mix.
CREATE TABLE IF NOT EXISTS interview_kits (
    id          SERIAL PRIMARY KEY,
    slug        VARCHAR(100) NOT NULL,
    account_id  INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    kit_type    VARCHAR(20)  NOT NULL CHECK (kit_type IN ('technical', 'character', 'aptitude')),
    roles       TEXT[]       NOT NULL DEFAULT '{}',
    levels      TEXT[]       NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_interview_kits_shared_slug
    ON interview_kits (slug) WHERE account_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_interview_kits_account_slug
    ON interview_kits (account_id, slug) WHERE account_id IS NOT NULL;

-- Content versions. Immutable once written: a saved interview always shows
-- the exact questions and answer keys it used.
CREATE TABLE IF NOT EXISTS interview_kit_versions (
    id               SERIAL PRIMARY KEY,
    kit_id           INTEGER     NOT NULL REFERENCES interview_kits(id) ON DELETE CASCADE,
    version          INTEGER     NOT NULL,
    status           VARCHAR(30) NOT NULL DEFAULT 'draft_under_review'
                     CHECK (status IN ('draft_under_review', 'reviewed')),
    content          JSONB       NOT NULL,
    content_sha256   CHAR(64)    NOT NULL,
    source_filename  VARCHAR(255),
    uploaded_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (kit_id, version)
);
CREATE INDEX IF NOT EXISTS idx_interview_kit_versions_kit ON interview_kit_versions (kit_id, version DESC);

CREATE OR REPLACE FUNCTION interview_kit_versions_immutable() RETURNS trigger AS $$
BEGIN
    IF NEW.content IS DISTINCT FROM OLD.content
       OR NEW.content_sha256 IS DISTINCT FROM OLD.content_sha256
       OR NEW.version IS DISTINCT FROM OLD.version
       OR NEW.kit_id IS DISTINCT FROM OLD.kit_id THEN
        RAISE EXCEPTION 'interview kit versions are immutable; upload a new version instead';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_interview_kit_versions_immutable ON interview_kit_versions;
CREATE TRIGGER trg_interview_kit_versions_immutable
    BEFORE UPDATE ON interview_kit_versions
    FOR EACH ROW EXECUTE FUNCTION interview_kit_versions_immutable();

-- Interviews. One row per interview, so earlier interviews are never
-- overwritten. account_id is the owning account, copied from the job at
-- creation, and every read and write is scoped by it.
CREATE TABLE IF NOT EXISTS interviews (
    id                     SERIAL PRIMARY KEY,
    candidate_pipeline_id  INTEGER     NOT NULL REFERENCES candidate_pipeline(id) ON DELETE CASCADE,
    account_id             INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kit_version_id         INTEGER     NOT NULL REFERENCES interview_kit_versions(id) ON DELETE RESTRICT,
    interviewer_user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    interviewer_email      VARCHAR(255),
    mode                   VARCHAR(20) NOT NULL CHECK (mode IN ('phone', 'in_person')),
    status                 VARCHAR(20) NOT NULL DEFAULT 'in_progress'
                           CHECK (status IN ('in_progress', 'completed')),
    answers                JSONB       NOT NULL DEFAULT '{}'::jsonb,
    current_index          INTEGER     NOT NULL DEFAULT -1,
    result                 JSONB,
    started_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at           TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_interviews_pipeline ON interviews (candidate_pipeline_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_interviews_account ON interviews (account_id);

-- Completed interviews are locked.
CREATE OR REPLACE FUNCTION interviews_lock_completed() RETURNS trigger AS $$
BEGIN
    IF OLD.status = 'completed' THEN
        RAISE EXCEPTION 'completed interviews cannot be changed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_interviews_lock_completed ON interviews;
CREATE TRIGGER trg_interviews_lock_completed
    BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION interviews_lock_completed();
