/**
 * Data access for interview kits and interviews.
 *
 * Tenancy: an interview belongs to the account that owns the job
 * (jobs.user_id = req.user.accountId). Every interview query is scoped by
 * account_id. There is deliberately NO admin bypass: interview scorecards stay
 * inside the company that ran them.
 */
const db = require('../../config/database');
const { DEFINITIONS, getDefinition, ZERO_TO_TWO } = require('./definitions');
const { scoreInterview, scoreCustom } = require('./scoring');

const MAX_NOTES = 5000;
const MAX_ITEMS = 100;           // questions in one set / custom interview
const MAX_PROMPT = 1000;
const MAX_GOOD_ANSWER = 3000;
const MAX_NAME = 150;
const MAX_COMPANY_QUESTIONS = 1000;
const MAX_SETS = 200;
const GOOD_ANSWER_LABEL = 'What a good answer sounds like';

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

const isCustom = (row) => row.kind === 'custom';

/** A custom interview's own question snapshot, shaped like a kit so the runner can use it. */
function customKit(row) {
    return {
        id: 'custom',
        custom: true,
        title: row.title || 'Custom interview',
        type: 'custom',
        roles: [],
        levels: [],
        status: 'reviewed',
        version: 0,
        sections: row.questions || [],
    };
}

function computeResult(row, kit) {
    return isCustom(row)
        ? scoreCustom(kit, row.answers || {})
        : scoreInterview(rulesFor(kit), kit, row.answers || {});
}

function shapeInterview(row, kit, { includeKit }) {
    const live = row.status === 'completed' ? row.result : computeResult(row, kit);
    return {
        id: row.id,
        kind: isCustom(row) ? 'custom' : 'kit',
        pipelineId: row.candidate_pipeline_id,
        status: row.status,
        mode: row.mode,
        interviewerEmail: row.interviewer_email,
        startedAt: row.started_at,
        updatedAt: row.updated_at,
        completedAt: row.completed_at,
        currentIndex: row.current_index,
        answers: row.answers || {},
        kit: includeKit ? kit : { id: kit.id, title: kit.title, version: kit.version, status: kit.status, type: kit.type, custom: kit.custom || undefined },
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
        if (isCustom(row)) { out.push(shapeInterview(row, customKit(row), { includeKit: false })); continue; }
        if (!kits.has(row.kit_version_id)) kits.set(row.kit_version_id, await getKitVersion(row.kit_version_id));
        out.push(shapeInterview(row, kits.get(row.kit_version_id), { includeKit: false }));
    }
    return out;
}

async function loadInterview(id, accountId) {
    const { rows } = await db.query('SELECT * FROM interviews WHERE id = $1 AND account_id = $2', [id, accountId]);
    if (!rows[0]) throw new HttpError(404, 'Interview not found');
    const kit = isCustom(rows[0]) ? customKit(rows[0]) : await getKitVersion(rows[0].kit_version_id);
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
    const result = computeResult(row, kit);
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

// ─── company question bank ───────────────────────────────────────────────────

function cleanText(value, max, field, { required }) {
    if (value === undefined || value === null) {
        if (required) throw new HttpError(400, `${field} is required`);
        return null;
    }
    if (typeof value !== 'string') throw new HttpError(400, `${field} must be text`);
    const text = value.trim();
    if (!text && required) throw new HttpError(400, `${field} is required`);
    if (text.length > max) throw new HttpError(400, `${field} must be ${max} characters or fewer`);
    return text || null;
}

const shapeCompanyQuestion = (r) => ({
    id: r.id,
    prompt: r.prompt,
    goodAnswer: r.good_answer,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
});

async function listCompanyQuestions(accountId) {
    const { rows } = await db.query(
        `SELECT id, prompt, good_answer, created_at, updated_at FROM company_questions
          WHERE account_id = $1 ORDER BY created_at, id`,
        [accountId]
    );
    return rows.map(shapeCompanyQuestion);
}

async function createCompanyQuestion(user, body = {}) {
    const prompt = cleanText(body.prompt, MAX_PROMPT, 'Question', { required: true });
    const goodAnswer = cleanText(body.goodAnswer, MAX_GOOD_ANSWER, 'Good answer', { required: false });
    const count = await db.query('SELECT COUNT(*)::int AS n FROM company_questions WHERE account_id = $1', [user.accountId]);
    if (count.rows[0].n >= MAX_COMPANY_QUESTIONS) throw new HttpError(400, 'Your question bank is full');
    const { rows } = await db.query(
        `INSERT INTO company_questions (account_id, prompt, good_answer, created_by)
         VALUES ($1, $2, $3, $4)
         RETURNING id, prompt, good_answer, created_at, updated_at`,
        [user.accountId, prompt, goodAnswer, user.userId]
    );
    return shapeCompanyQuestion(rows[0]);
}

async function updateCompanyQuestion(id, accountId, body = {}) {
    const prompt = cleanText(body.prompt, MAX_PROMPT, 'Question', { required: true });
    const goodAnswer = cleanText(body.goodAnswer, MAX_GOOD_ANSWER, 'Good answer', { required: false });
    const { rows } = await db.query(
        `UPDATE company_questions SET prompt = $1, good_answer = $2, updated_at = NOW()
          WHERE id = $3 AND account_id = $4
          RETURNING id, prompt, good_answer, created_at, updated_at`,
        [prompt, goodAnswer, id, accountId]
    );
    if (!rows[0]) throw new HttpError(404, 'Question not found');
    return shapeCompanyQuestion(rows[0]);
}

/** Past interviews keep their own copy of the question, so deleting is safe. */
async function deleteCompanyQuestion(id, accountId) {
    const { rowCount } = await db.query('DELETE FROM company_questions WHERE id = $1 AND account_id = $2', [id, accountId]);
    if (!rowCount) throw new HttpError(404, 'Question not found');
}

// ─── picked questions ────────────────────────────────────────────────────────

/** Validates a list of question references. Drops duplicates, keeps order. */
function normalizeItems(items) {
    if (!Array.isArray(items)) throw new HttpError(400, 'items must be a list');
    const seen = new Set();
    const out = [];
    for (const it of items) {
        if (!it || typeof it !== 'object') throw new HttpError(400, 'Invalid question reference');
        let ref;
        if (it.source === 'kit' && typeof it.kitId === 'string' && typeof it.key === 'string'
            && it.kitId.length <= 100 && it.key.length <= 50) {
            ref = { source: 'kit', kitId: it.kitId, key: it.key };
        } else if (it.source === 'company' && Number.isInteger(it.id) && it.id > 0) {
            ref = { source: 'company', id: it.id };
        } else {
            throw new HttpError(400, 'Invalid question reference');
        }
        const sig = ref.source === 'kit' ? `k:${ref.kitId}:${ref.key}` : `c:${ref.id}`;
        if (seen.has(sig)) continue;
        seen.add(sig);
        out.push(ref);
    }
    if (out.length > MAX_ITEMS) throw new HttpError(400, `Pick ${MAX_ITEMS} questions or fewer`);
    return out;
}

/**
 * Looks up each reference against the latest kit content and the account's
 * own bank. Returns, in order, either the question with its group, or
 * { missing: true } when it no longer exists.
 */
async function resolveItems(refs, accountId) {
    const kitCache = new Map();
    for (const slug of new Set(refs.filter(r => r.source === 'kit').map(r => r.kitId))) {
        kitCache.set(slug, await getLatestKit(slug, accountId));
    }
    const companyIds = refs.filter(r => r.source === 'company').map(r => r.id);
    const company = new Map();
    if (companyIds.length) {
        const { rows } = await db.query(
            'SELECT id, prompt, good_answer FROM company_questions WHERE account_id = $1 AND id = ANY($2::int[])',
            [accountId, companyIds]
        );
        rows.forEach(r => company.set(r.id, r));
    }

    return refs.map(ref => {
        if (ref.source === 'company') {
            const q = company.get(ref.id);
            if (!q) return { ref, missing: true };
            return {
                ref,
                groupKey: 'company',
                groupTitle: 'Your company questions',
                scoreOptions: ZERO_TO_TWO,
                question: {
                    prompt: q.prompt,
                    ...(q.good_answer && { details: [{ label: GOOD_ANSWER_LABEL, text: q.good_answer }] }),
                },
            };
        }
        const kit = kitCache.get(ref.kitId);
        const section = kit?.sections.find(s => s.questions.some(q => q.key === ref.key));
        if (!section) return { ref, missing: true };
        const q = section.questions.find(x => x.key === ref.key);
        return {
            ref,
            groupKey: `kit:${ref.kitId}:${section.key}`,
            groupTitle: `${kit.title} · ${section.title}`,
            scoreOptions: section.scoreOptions || null,
            question: {
                prompt: q.prompt,
                ...(q.answerKey && { answerKey: q.answerKey }),
                ...(q.redFlags && { redFlags: q.redFlags }),
                ...(q.guidance && { guidance: q.guidance }),
                ...(q.details?.length && { details: q.details }),
            },
        };
    });
}

/** Display form of resolved items (no answer keys). */
const displayItems = (resolved) => resolved.map(r => (r.missing
    ? { ...r.ref, missing: true, prompt: null, sourceLabel: null }
    : { ...r.ref, prompt: r.question.prompt, sourceLabel: r.groupTitle }));

/** Groups consecutive questions from the same source section into kit-shaped sections. */
function buildSnapshot(resolved) {
    const sections = [];
    let n = 0;
    for (const r of resolved) {
        let section = sections[sections.length - 1];
        if (!section || section._group !== r.groupKey) {
            section = {
                _group: r.groupKey,
                key: `S${sections.length + 1}`,
                title: r.groupTitle,
                ...(r.scoreOptions && { scoreOptions: r.scoreOptions }),
                questions: [],
            };
            sections.push(section);
        }
        n += 1;
        section.questions.push({ key: `Q${n}`, number: String(n), ...r.question, source: r.ref });
    }
    return sections.map(({ _group, ...s }) => s);
}

// ─── saved question sets ─────────────────────────────────────────────────────

async function listSets(accountId) {
    const { rows } = await db.query(
        `SELECT id, name, jsonb_array_length(items) AS item_count, updated_at
           FROM interview_question_sets WHERE account_id = $1 ORDER BY LOWER(name), id`,
        [accountId]
    );
    return rows.map(r => ({ id: r.id, name: r.name, itemCount: Number(r.item_count), updatedAt: r.updated_at }));
}

async function getSet(id, accountId) {
    const { rows } = await db.query(
        'SELECT id, name, items, updated_at FROM interview_question_sets WHERE id = $1 AND account_id = $2',
        [id, accountId]
    );
    if (!rows[0]) throw new HttpError(404, 'Question set not found');
    const resolved = await resolveItems(rows[0].items || [], accountId);
    return { id: rows[0].id, name: rows[0].name, updatedAt: rows[0].updated_at, items: displayItems(resolved) };
}

async function createSet(user, body = {}) {
    const name = cleanText(body.name, MAX_NAME, 'Name', { required: true });
    const items = normalizeItems(body.items);
    if (!items.length) throw new HttpError(400, 'Pick at least one question');
    const count = await db.query('SELECT COUNT(*)::int AS n FROM interview_question_sets WHERE account_id = $1', [user.accountId]);
    if (count.rows[0].n >= MAX_SETS) throw new HttpError(400, 'You have too many saved question sets');
    const { rows } = await db.query(
        `INSERT INTO interview_question_sets (account_id, name, items, created_by)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [user.accountId, name, JSON.stringify(items), user.userId]
    );
    return getSet(rows[0].id, user.accountId);
}

async function updateSet(id, accountId, body = {}) {
    const name = cleanText(body.name, MAX_NAME, 'Name', { required: true });
    const items = normalizeItems(body.items);
    if (!items.length) throw new HttpError(400, 'Pick at least one question');
    const { rowCount } = await db.query(
        `UPDATE interview_question_sets SET name = $1, items = $2, updated_at = NOW()
          WHERE id = $3 AND account_id = $4`,
        [name, JSON.stringify(items), id, accountId]
    );
    if (!rowCount) throw new HttpError(404, 'Question set not found');
    return getSet(id, accountId);
}

async function deleteSet(id, accountId) {
    const { rowCount } = await db.query('DELETE FROM interview_question_sets WHERE id = $1 AND account_id = $2', [id, accountId]);
    if (!rowCount) throw new HttpError(404, 'Question set not found');
}

// ─── custom interviews ───────────────────────────────────────────────────────

async function createCustomInterview({ pipelineId, mode, title, items, user }) {
    if (!['phone', 'in_person'].includes(mode)) throw new HttpError(400, 'Mode must be phone or in_person');
    await assertPipelineInAccount(pipelineId, user.accountId);
    const name = cleanText(title, MAX_NAME, 'Title', { required: false }) || 'Custom interview';
    const refs = normalizeItems(items);
    if (!refs.length) throw new HttpError(400, 'Pick at least one question');
    const resolved = await resolveItems(refs, user.accountId);
    const missing = resolved.filter(r => r.missing).length;
    if (missing) throw new HttpError(400, `${missing} of the picked questions no longer exist. Remove them and try again.`);
    const sections = buildSnapshot(resolved);
    const { rows } = await db.query(
        `INSERT INTO interviews (candidate_pipeline_id, account_id, kit_version_id, interviewer_user_id, interviewer_email, mode, kind, title, questions)
         VALUES ($1, $2, NULL, $3, $4, $5, 'custom', $6, $7)
         RETURNING *`,
        [pipelineId, user.accountId, user.userId, user.email || null, mode, name, JSON.stringify(sections)]
    );
    return shapeInterview(rows[0], customKit(rows[0]), { includeKit: true });
}

module.exports = {
    HttpError,
    syncDefinitions,
    listCompanyQuestions,
    createCompanyQuestion,
    updateCompanyQuestion,
    deleteCompanyQuestion,
    normalizeItems,
    resolveItems,
    buildSnapshot,
    listSets,
    getSet,
    createSet,
    updateSet,
    deleteSet,
    createCustomInterview,
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
