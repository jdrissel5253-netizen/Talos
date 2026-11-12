-- Custom interviews: pick questions from the kits and the company's own bank.

-- The company's own questions. Shared by everyone on the account.
CREATE TABLE IF NOT EXISTS company_questions (
    id           SERIAL PRIMARY KEY,
    account_id   INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt       TEXT        NOT NULL,
    good_answer  TEXT,
    created_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_company_questions_account ON company_questions (account_id, created_at);

-- Saved question sets. items is an ordered list of references:
--   { "source": "kit", "kitId": "<slug>", "key": "L1.Q3" }
--   { "source": "company", "id": 12 }
-- Interviews copy the questions at start, so editing a set never changes past interviews.
CREATE TABLE IF NOT EXISTS interview_question_sets (
    id           SERIAL PRIMARY KEY,
    account_id   INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name         VARCHAR(150) NOT NULL,
    items        JSONB        NOT NULL DEFAULT '[]'::jsonb,
    created_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_interview_question_sets_account ON interview_question_sets (account_id, name);

-- Interviews: a custom interview has no kit version; it carries its own
-- snapshot of the questions (same shape as a kit's sections) and a title.
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS kind VARCHAR(10) NOT NULL DEFAULT 'kit';
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS title VARCHAR(150);
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS questions JSONB;
ALTER TABLE interviews ALTER COLUMN kit_version_id DROP NOT NULL;

ALTER TABLE interviews DROP CONSTRAINT IF EXISTS interviews_kind_shape;
ALTER TABLE interviews ADD CONSTRAINT interviews_kind_shape CHECK (
    (kind = 'kit' AND kit_version_id IS NOT NULL)
    OR (kind = 'custom' AND kit_version_id IS NULL AND questions IS NOT NULL)
);
