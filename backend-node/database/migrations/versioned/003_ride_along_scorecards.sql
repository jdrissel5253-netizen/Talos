-- Ride-along scorecards: a shared task library, versioned scorecard templates,
-- per-company task settings and evaluations.
--
-- Content (task steps, observation items, red flags) is uploaded as a JSON
-- bundle through the admin dashboard and never committed (the repo is public).

-- Task library. account_id NULL = shared Talos task (read-only to companies).
-- A company's own task sets account_id to the owning account.
CREATE TABLE IF NOT EXISTS scorecard_tasks (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(40) NOT NULL,
    account_id  INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_scorecard_tasks_shared_code
    ON scorecard_tasks (code) WHERE account_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_scorecard_tasks_account_code
    ON scorecard_tasks (account_id, code) WHERE account_id IS NOT NULL;

-- Immutable task versions. content: { name, level, time, equipment[], roleTags[],
-- steps: [{ key, text, twoLooksLike, safety }] }
CREATE TABLE IF NOT EXISTS scorecard_task_versions (
    id              SERIAL PRIMARY KEY,
    task_id         INTEGER     NOT NULL REFERENCES scorecard_tasks(id) ON DELETE CASCADE,
    version         INTEGER     NOT NULL,
    content         JSONB       NOT NULL,
    content_sha256  CHAR(64)    NOT NULL,
    created_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (task_id, version)
);

-- Scorecard templates (shared only for now).
CREATE TABLE IF NOT EXISTS scorecard_templates (
    id          SERIAL PRIMARY KEY,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    title       VARCHAR(255) NOT NULL,
    role        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Immutable template versions. task_version_ids is the ordered task list;
-- config holds categories (weights, items), red flags, bands, cap value,
-- part weights and the safety flag type. No scoring numbers live in code.
CREATE TABLE IF NOT EXISTS scorecard_template_versions (
    id                SERIAL PRIMARY KEY,
    template_id       INTEGER     NOT NULL REFERENCES scorecard_templates(id) ON DELETE CASCADE,
    version           INTEGER     NOT NULL,
    task_version_ids  INTEGER[]   NOT NULL,
    config            JSONB       NOT NULL,
    content_sha256    CHAR(64)    NOT NULL,
    source_filename   VARCHAR(255),
    uploaded_by       INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (template_id, version)
);

CREATE OR REPLACE FUNCTION scorecard_versions_immutable() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'scorecard versions are immutable; upload a new version instead';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_scorecard_task_versions_immutable ON scorecard_task_versions;
CREATE TRIGGER trg_scorecard_task_versions_immutable
    BEFORE UPDATE ON scorecard_task_versions
    FOR EACH ROW EXECUTE FUNCTION scorecard_versions_immutable();

DROP TRIGGER IF EXISTS trg_scorecard_template_versions_immutable ON scorecard_template_versions;
CREATE TRIGGER trg_scorecard_template_versions_immutable
    BEFORE UPDATE ON scorecard_template_versions
    FOR EACH ROW EXECUTE FUNCTION scorecard_versions_immutable();

-- Per-company settings for a scorecard: shared tasks turned off (by code) and
-- the company's own tasks added. Tied to the template, not a version, so it
-- carries over to new versions.
CREATE TABLE IF NOT EXISTS account_scorecard_settings (
    account_id           INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id          INTEGER     NOT NULL REFERENCES scorecard_templates(id) ON DELETE CASCADE,
    disabled_task_codes  TEXT[]      NOT NULL DEFAULT '{}',
    custom_task_ids      INTEGER[]   NOT NULL DEFAULT '{}',
    updated_by           INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (account_id, template_id)
);

-- Evaluations. account_id is the owning account (copied from the job), and
-- every read and write is scoped by it. tasks is a copy of every task the
-- scorer could pick when the evaluation started, so later edits to the
-- library or company tasks never change it.
CREATE TABLE IF NOT EXISTS ride_along_evaluations (
    id                     SERIAL PRIMARY KEY,
    account_id             INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    candidate_pipeline_id  INTEGER     NOT NULL REFERENCES candidate_pipeline(id) ON DELETE CASCADE,
    job_id                 INTEGER     NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    template_version_id    INTEGER     NOT NULL REFERENCES scorecard_template_versions(id) ON DELETE RESTRICT,
    scorer_user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
    scorer_email           VARCHAR(255),
    evaluated_on           DATE        NOT NULL DEFAULT CURRENT_DATE,
    tasks                  JSONB       NOT NULL,
    chosen_task_codes      TEXT[]      NOT NULL DEFAULT '{}',
    step_scores            JSONB       NOT NULL DEFAULT '{}'::jsonb,
    item_scores            JSONB       NOT NULL DEFAULT '{}'::jsonb,
    red_flags              JSONB       NOT NULL DEFAULT '{}'::jsonb,
    candidate_consent      BOOLEAN     NOT NULL DEFAULT FALSE,
    current_screen         VARCHAR(60),
    status                 VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
    result                 JSONB,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at           TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_ride_along_pipeline ON ride_along_evaluations (candidate_pipeline_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ride_along_job ON ride_along_evaluations (account_id, job_id);
CREATE INDEX IF NOT EXISTS idx_ride_along_scorer_drafts ON ride_along_evaluations (scorer_user_id) WHERE status = 'draft';

CREATE OR REPLACE FUNCTION ride_along_lock_submitted() RETURNS trigger AS $$
BEGIN
    IF OLD.status = 'submitted' THEN
        RAISE EXCEPTION 'submitted evaluations cannot be changed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ride_along_lock_submitted ON ride_along_evaluations;
CREATE TRIGGER trg_ride_along_lock_submitted
    BEFORE UPDATE ON ride_along_evaluations
    FOR EACH ROW EXECUTE FUNCTION ride_along_lock_submitted();
