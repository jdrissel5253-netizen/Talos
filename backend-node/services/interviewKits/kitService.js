/**
 * Data access for interview kits and interviews.
 *
 * Tenancy: an interview belongs to the account that owns the job
 * (jobs.user_id = req.user.accountId). Every interview query is scoped by
 * account_id. There is deliberately NO admin bypass: interview scorecards stay
 * inside the company that ran them.
 */
const db = require('../../config/database');
const { DEFINITIONS, getDefinition } = require('./definitions');
const { scoreInterview } = require('./scoring');

const MAX_NOTES = 5000;

class HttpError extends Error {
    constructor(status, message) { super(message); this.status = status; }
}

// ─── kits ────────────────────────────────────────────────────────────────────

/** Upserts shared kit metadata from definitions.js. Safe to run on every boot. */
async function syncDefinitions() {
    for (const d of DEFINITIONS) {
        await db.query(
            `INSERT INTO interview_kits (slug, account_id, title, kit_type, roles, levels)
             VALUES ($1, NULL, $2, $3, $4, $5)
             ON CONFLICT (slug) WHERE account_id IS NULL
             DO UPDATE SET title = EXCLUDED.title, kit_type = EXCLUDED.kit_type,
                           roles = EXCLUDED.roles, levels = EXCLUDED.levels, updated_at = NOW()`,
            [d.slug, d.title, d.type, d.roles, d.levels]
        );
    }
}

const LATEST_VERSION_JOIN = `
    JOIN LATERAL (
        SELECT * FROM interview_kit_versions iv
        WHERE iv.kit_id = k.id
        ORDER BY iv.version DESC
        LIMIT 1
    ) v ON true`;

/** Kits with at least one content version, visible to this account. No question content. */
async function listKits(accountId) {
    const { rows } = await db.query(
        `SELECT k.slug, k.title, k.kit_type, k.roles, k.levels,
                v.version, v.status, v.created_at AS version_created_at,
                v.content->>'summary' AS summary, v.content->>'versionDate' AS version_date,
                (SELECT COALESCE(SUM(jsonb_array_length(s->'questions')), 0)
                   FROM jsonb_array_elements(v.content->'sections') s) AS question_count
           FROM interview_kits k
           ${LATEST_VERSION_JOIN}
          WHERE k.account_id IS NULL OR k.account_id = $1
          ORDER BY k.title`,
        [accountId]
    );
    return rows.map(r => ({
        id: r.slug,
        title: r.title,
        type: r.kit_type,
        roles: r.roles,
        levels: r.levels,
        status: r.status,
        version: r.version,
        versionDate: r.version_date,
        summary: r.summary,
        questionCount: Number(r.question_count),
    }));
}

function toKit(row) {
    const c = row.content;
    return {
        id: row.slug,
        title: row.title,
        type: row.kit_type,
        roles: row.roles,
        levels: row.levels,
        status: row.status,
        version: row.version,
        versionId: row.version_id,
        versionDate: c.versionDate,
        summary: c.summary,
        howToUse: c.howToUse,
        guardrails: c.guardrails,
        sections: c.sections,
        extraSections: c.extraSections,
    };
}

async function getLatestKit(slug, accountId) {
    const { rows } = await db.query(
        `SELECT k.slug, k.title, k.kit_type, k.roles, k.levels,
                v.id AS version_id, v.version, v.status, v.content
           FROM interview_kits k
           ${LATEST_VERSION_JOIN}
          WHERE k.slug = $1 AND (k.account_id IS NULL OR k.account_id = $2)
          ORDER BY k.account_id NULLS LAST
          LIMIT 1`,
        [slug, accountId]
    );
    return rows[0] ? toKit(rows[0]) : null;
}

async function getKitVersion(versionId) {
    const { rows } = await db.query(
        `SELECT k.slug, k.title, k.kit_type, k.roles, k.levels,
                v.id AS version_id, v.version, v.status, v.content
           FROM interview_kit_versions v
           JOIN interview_kits k ON k.id = v.kit_id
          WHERE v.id = $1`,
        [versionId]
    );
    return rows[0] ? toKit(rows[0]) : null;
}

/**
 * Stores parsed content as a new version of a shared kit. Identical content
 * (same sha256 as the latest version) doesn't create a new version.
 */
async function createSharedVersion(slug, { content, sha256, sourceFilename, uploadedBy }) {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const kit = await client.query(
            'SELECT id FROM interview_kits WHERE slug = $1 AND account_id IS NULL FOR UPDATE',
            [slug]
        );
        if (!kit.rows[0]) throw new HttpError(404, 'Unknown kit');
        const kitId = kit.rows[0].id;
        const latest = await client.query(
            'SELECT version, content_sha256 FROM interview_kit_versions WHERE kit_id = $1 ORDER BY version DESC LIMIT 1',
            [kitId]
        );
        if (latest.rows[0] && latest.rows[0].content_sha256 === sha256) {
            await client.query('ROLLBACK');
            return { created: false, version: latest.rows[0].version };
        }
        const version = (latest.rows[0]?.version ?? 0) + 1;
        // Every uploaded version starts as Draft - Under review. Marking a
        // version reviewed is a separate, deliberate step (not built yet).
        const status = 'draft_under_review';
        await client.query(
            `INSERT INTO interview_kit_versions (kit_id, version, status, content, content_sha256, source_filename, uploaded_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [kitId, version, status, JSON.stringify(content), sha256, sourceFilename, uploadedBy]
        );
        await client.query('COMMIT');
        return { created: true, version };
    } catch (err) {
        try { await client.query('ROLLBACK'); } catch { /* already rolled back */ }
        throw err;
    } finally {
        client.release();
    }
}

/** Admin view: every defined kit and its upload state. */
async function adminKitStatus() {
    const { rows } = await db.query(
        `SELECT k.slug, MAX(v.version) AS latest_version, COUNT(v.id) AS version_count,
                MAX(v.created_at) AS last_uploaded_at
           FROM interview_kits k
           LEFT JOIN interview_kit_versions v ON v.kit_id = k.id
          WHERE k.account_id IS NULL
          GROUP BY k.slug`
    );
    const bySlug = new Map(rows.map(r => [r.slug, r]));
    return DEFINITIONS.map(d => {
        const r = bySlug.get(d.slug);
        return {
            slug: d.slug,
            title: d.title,
            type: d.type,
            latestVersion: r?.latest_version ? Number(r.latest_version) : null,
            versionCount: r ? Number(r.version_count) : 0,
            lastUploadedAt: r?.last_uploaded_at ?? null,
        };
    });
}

// ─── interviews ──────────────────────────────────────────────────────────────

async function assertPipelineInAccount(pipelineId, accountId) {
    const { rows } = await db.query(
        `SELECT j.user_id FROM candidate_pipeline cp
           JOIN jobs j ON j.id = cp.job_id
          WHERE cp.id = $1`,
        [pipelineId]
    );
    // 404 rather than 403, so other accounts' application ids aren't confirmed.
    if (!rows[0] || rows[0].user_id !== accountId) throw new HttpError(404, 'Application not found');
}

function rulesFor(kit) {
    const def = getDefinition(kit.id);
    if (!def) throw new HttpError(500, `No scoring rules defined for kit ${kit.id}`);
    return def.scoring;
}

function shapeInterview(row, kit, { includeKit }) {
    const live = row.status === 'completed' ? row.result : scoreInterview(rulesFor(kit), kit, row.answers || {});
    return {
        id: row.id,
        pipelineId: row.candidate_pipeline_id,
        status: row.status,
        mode: row.mode,
        interviewerEmail: row.interviewer_email,
        startedAt: row.started_at,
        updatedAt: row.updated_at,
        completedAt: row.completed_at,
        currentIndex: row.current_index,
        answers: row.answers || {},
        kit: includeKit ? kit : { id: kit.id, title: kit.title, version: kit.version, status: kit.status, type: kit.type },
        result: live,
    };
}

async function createInterview({ pipelineId, kitSlug, mode, user }) {
    if (!['phone', 'in_person'].includes(mode)) throw new HttpError(400, 'Mode must be phone or in_person');
    await assertPipelineInAccount(pipelineId, user.accountId);
    const kit = await getLatestKit(kitSlug, user.accountId);
    if (!kit) throw new HttpError(404, 'Kit not found');
    const { rows } = await db.query(
        `INSERT INTO interviews (candidate_pipeline_id, account_id, kit_version_id, interviewer_user_id, interviewer_email, mode)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [pipelineId, user.accountId, kit.versionId, user.userId, user.email || null, mode]
    );
    return shapeInterview(rows[0], kit, { includeKit: true });
}

async function listForPipeline(pipelineId, accountId) {
    await assertPipelineInAccount(pipelineId, accountId);
    const { rows } = await db.query(
        `SELECT * FROM interviews
          WHERE candidate_pipeline_id = $1 AND account_id = $2
          ORDER BY started_at DESC`,
        [pipelineId, accountId]
    );
    const kits = new Map();
    const out = [];
    for (const row of rows) {
        if (!kits.has(row.kit_version_id)) kits.set(row.kit_version_id, await getKitVersion(row.kit_version_id));
        out.push(shapeInterview(row, kits.get(row.kit_version_id), { includeKit: false }));
    }
    return out;
}

async function loadInterview(id, accountId) {
    const { rows } = await db.query('SELECT * FROM interviews WHERE id = $1 AND account_id = $2', [id, accountId]);
    if (!rows[0]) throw new HttpError(404, 'Interview not found');
    const kit = await getKitVersion(rows[0].kit_version_id);
    return { row: rows[0], kit };
}

async function getInterview(id, accountId) {
    const { row, kit } = await loadInterview(id, accountId);
    return shapeInterview(row, kit, { includeKit: true });
}

/** Validates one answer against the interview's own kit version. */
function validateAnswer(kit, key, answer) {
    const section = kit.sections.find(s => s.questions.some(q => q.key === key));
    if (!section) throw new HttpError(400, 'Unknown question');
    const out = { score: null, notes: '', redFlag: false };
    if (answer.score !== null && answer.score !== undefined) {
        if (!section.scoreOptions) throw new HttpError(400, 'This question is not scored');
        if (!section.scoreOptions.some(o => o.value === answer.score)) throw new HttpError(400, 'Invalid score');
        out.score = answer.score;
    }
    if (answer.notes !== undefined) {
        if (typeof answer.notes !== 'string') throw new HttpError(400, 'Notes must be text');
        out.notes = answer.notes.slice(0, MAX_NOTES);
    }
    if (answer.redFlag !== undefined) out.redFlag = answer.redFlag === true;
    return out;
}

/** Autosave: replaces one question's answer and/or the current position. */
async function saveProgress(id, accountId, { key, answer, currentIndex }) {
    const { row, kit } = await loadInterview(id, accountId);
    if (row.status !== 'in_progress') throw new HttpError(409, 'This interview is completed and locked');
    const answers = { ...(row.answers || {}) };
    if (key !== undefined) answers[key] = validateAnswer(kit, key, answer || {});
    const total = kit.sections.reduce((n, s) => n + s.questions.length, 0);
    const index = Number.isInteger(currentIndex) && currentIndex >= -1 && currentIndex <= total ? currentIndex : row.current_index;
    const { rows } = await db.query(
        `UPDATE interviews SET answers = $1, current_index = $2, updated_at = NOW()
          WHERE id = $3 AND account_id = $4 AND status = 'in_progress'
          RETURNING *`,
        [JSON.stringify(answers), index, id, accountId]
    );
    if (!rows[0]) throw new HttpError(409, 'This interview is completed and locked');
    return shapeInterview(rows[0], kit, { includeKit: false });
}

async function completeInterview(id, accountId) {
    const { row, kit } = await loadInterview(id, accountId);
    if (row.status !== 'in_progress') throw new HttpError(409, 'This interview is already completed');
    const result = scoreInterview(rulesFor(kit), kit, row.answers || {});
    const { rows } = await db.query(
        `UPDATE interviews SET status = 'completed', result = $1, completed_at = NOW(), updated_at = NOW()
          WHERE id = $2 AND account_id = $3 AND status = 'in_progress'
          RETURNING *`,
        [JSON.stringify(result), id, accountId]
    );
    if (!rows[0]) throw new HttpError(409, 'This interview is already completed');
    return shapeInterview(rows[0], kit, { includeKit: true });
}

async function discardInterview(id, accountId) {
    const { rowCount } = await db.query(
        `DELETE FROM interviews WHERE id = $1 AND account_id = $2 AND status = 'in_progress'`,
        [id, accountId]
    );
    if (!rowCount) throw new HttpError(404, 'No in-progress interview to discard');
}

module.exports = {
    HttpError,
    syncDefinitions,
    listKits,
    getLatestKit,
    getKitVersion,
    createSharedVersion,
    adminKitStatus,
    createInterview,
    listForPipeline,
    getInterview,
    saveProgress,
    completeInterview,
    discardInterview,
};
