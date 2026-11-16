/**
 * Data access for ride-along scorecards.
 *
 * Tenancy follows interview kits: an evaluation belongs to the account that
 * owns the job (jobs.user_id = req.user.accountId), every evaluation query is
 * scoped by account_id, and there is deliberately NO admin bypass.
 *
 * Shared tasks and templates are read-only to companies. Only the account
 * owner (userId === accountId) can change scorecard settings or company tasks.
 */
const crypto = require('crypto');
const db = require('../../config/database');
const { scoreEvaluation, SCORE_VALUES, NA } = require('./scoring');
const { validateBundle, validateTask } = require('./content');

const MAX_NOTE = 2000;
const MAX_COMPANY_TASKS = 300;
const SCREEN_RE = /^[a-z0-9:_-]{1,60}$/;

class HttpError extends Error {
    constructor(status, message, details) { super(message); this.status = status; this.details = details; }
}

const sha256 = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

function assertOwner(user) {
    if (user.userId !== user.accountId) throw new HttpError(403, 'Only the account owner can change scorecards');
}

async function inTransaction(fn) {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const out = await fn(client);
        await client.query('COMMIT');
        return out;
    } catch (err) {
        try { await client.query('ROLLBACK'); } catch { /* already rolled back */ }
        throw err;
    } finally {
        client.release();
    }
}

// ─── admin: content upload ───────────────────────────────────────────────────

/** Adds a task version when the content changed. Returns { versionId, change }. */
async function upsertTaskVersion(client, taskId, content, userId) {
    const sha = sha256(content);
    const latest = await client.query(
        'SELECT id, version, content_sha256 FROM scorecard_task_versions WHERE task_id = $1 ORDER BY version DESC LIMIT 1',
        [taskId]
    );
    const prev = latest.rows[0];
    if (prev && prev.content_sha256 === sha) return { versionId: prev.id, change: 'unchanged' };
    const { rows } = await client.query(
        `INSERT INTO scorecard_task_versions (task_id, version, content, content_sha256, created_by)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [taskId, (prev?.version ?? 0) + 1, JSON.stringify(content), sha, userId]
    );
    return { versionId: rows[0].id, change: prev ? 'updated' : 'created' };
}

/**
 * Imports a validated bundle in one transaction: shared tasks first (a new
 * version only when a task changed), then each scorecard (a new version only
 * when its config or any of its task versions changed).
 */
async function importBundle(bundle, { sourceFilename, uploadedBy }) {
    const parsed = validateBundle(bundle);
    if (parsed.errors.length) throw new HttpError(422, 'This file doesn\'t match the scorecard format.', parsed.errors);

    return inTransaction(async (client) => {
        await client.query('SELECT pg_advisory_xact_lock($1)', [73_410_002]);
        const summary = { tasks: { created: 0, updated: 0, unchanged: 0 }, scorecards: [] };
        const versionByCode = new Map();

        for (const t of parsed.tasks) {
            const existing = await client.query('SELECT id FROM scorecard_tasks WHERE code = $1 AND account_id IS NULL', [t.code]);
            const taskId = existing.rows[0]?.id ?? (await client.query(
                'INSERT INTO scorecard_tasks (code, account_id, created_by) VALUES ($1, NULL, $2) RETURNING id',
                [t.code, uploadedBy]
            )).rows[0].id;
            const { versionId, change } = await upsertTaskVersion(client, taskId, t.content, uploadedBy);
            versionByCode.set(t.code, versionId);
            summary.tasks[change] += 1;
        }

        if (parsed.externalCodes.length) {
            const { rows } = await client.query(
                `SELECT t.code, v.id FROM scorecard_tasks t
                   JOIN LATERAL (SELECT id FROM scorecard_task_versions WHERE task_id = t.id ORDER BY version DESC LIMIT 1) v ON true
                  WHERE t.account_id IS NULL AND t.code = ANY($1::text[])`,
                [parsed.externalCodes]
            );
            rows.forEach(r => versionByCode.set(r.code, r.id));
            const missing = parsed.externalCodes.filter(c => !versionByCode.has(c));
            if (missing.length) {
                throw new HttpError(422, 'This file doesn\'t match the scorecard format.',
                    missing.map(c => `task ${c} is used by a scorecard but isn't in this file or the shared library`));
            }
        }

        for (const sc of parsed.scorecards) {
            const tpl = (await client.query(
                `INSERT INTO scorecard_templates (slug, title, role) VALUES ($1, $2, $3)
                 ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, role = EXCLUDED.role, updated_at = NOW()
                 RETURNING id`,
                [sc.slug, sc.title, sc.role]
            )).rows[0];
            const taskVersionIds = sc.tasks.map(c => versionByCode.get(c));
            const sha = sha256({ config: sc.config, taskVersionIds });
            const latest = (await client.query(
                'SELECT version, content_sha256 FROM scorecard_template_versions WHERE template_id = $1 ORDER BY version DESC LIMIT 1',
                [tpl.id]
            )).rows[0];
            if (latest && latest.content_sha256 === sha) {
                summary.scorecards.push({ slug: sc.slug, version: latest.version, created: false });
                continue;
            }
            const version = (latest?.version ?? 0) + 1;
            await client.query(
                `INSERT INTO scorecard_template_versions (template_id, version, task_version_ids, config, content_sha256, source_filename, uploaded_by)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [tpl.id, version, taskVersionIds, JSON.stringify(sc.config), sha, sourceFilename, uploadedBy]
            );
            summary.scorecards.push({ slug: sc.slug, version, created: true });
        }
        return summary;
    });
}

async function adminStatus() {
    const { rows } = await db.query(
        `SELECT t.slug, t.title, t.role, v.version, v.created_at, cardinality(v.task_version_ids) AS task_count,
                (SELECT COUNT(*) FROM scorecard_template_versions x WHERE x.template_id = t.id) AS version_count
           FROM scorecard_templates t
           LEFT JOIN LATERAL (SELECT * FROM scorecard_template_versions WHERE template_id = t.id ORDER BY version DESC LIMIT 1) v ON true
          ORDER BY t.title`
    );
    const tasks = await db.query('SELECT COUNT(*)::int AS n FROM scorecard_tasks WHERE account_id IS NULL');
    return {
        sharedTaskCount: tasks.rows[0].n,
        scorecards: rows.map(r => ({
            slug: r.slug, title: r.title, role: r.role,
            latestVersion: r.version ?? null,
            versionCount: Number(r.version_count),
            taskCount: r.task_count === null ? 0 : Number(r.task_count),
            lastUploadedAt: r.created_at ?? null,
        })),
    };
}

// ─── scorecards ──────────────────────────────────────────────────────────────

const LATEST_TEMPLATE_VERSION = `
    JOIN LATERAL (
        SELECT * FROM scorecard_template_versions v
        WHERE v.template_id = t.id
        ORDER BY v.version DESC LIMIT 1
    ) v ON true`;

async function listScorecards() {
    const { rows } = await db.query(
        `SELECT t.slug, t.title, t.role, v.version, cardinality(v.task_version_ids) AS task_count,
                jsonb_array_length(v.config->'categories') AS category_count
           FROM scorecard_templates t ${LATEST_TEMPLATE_VERSION}
          ORDER BY t.title`
    );
    return rows.map(r => ({
        slug: r.slug, title: r.title, role: r.role, version: r.version,
        taskCount: Number(r.task_count), categoryCount: Number(r.category_count),
    }));
}

/** Task versions by id, as { id, code, shared, version, ...content }, in the order given. */
async function loadTaskVersions(ids) {
    if (!ids.length) return [];
    const { rows } = await db.query(
        `SELECT v.id, v.version, v.content, t.code, t.account_id
           FROM scorecard_task_versions v JOIN scorecard_tasks t ON t.id = v.task_id
          WHERE v.id = ANY($1::int[])`,
        [ids]
    );
    const byId = new Map(rows.map(r => [r.id, r]));
    return ids.map(id => byId.get(id)).filter(Boolean).map(r => ({
        code: r.code, shared: r.account_id === null, version: r.version, ...r.content,
    }));
}

/** Latest versions of a company's own tasks, keyed by task id. */
async function loadCompanyTasks(accountId, taskIds = null) {
    const { rows } = await db.query(
        `SELECT t.id, t.code, v.version, v.content, t.created_at
           FROM scorecard_tasks t
           JOIN LATERAL (SELECT * FROM scorecard_task_versions WHERE task_id = t.id ORDER BY version DESC LIMIT 1) v ON true
          WHERE t.account_id = $1 ${taskIds ? 'AND t.id = ANY($2::int[])' : ''}
          ORDER BY t.created_at, t.id`,
        taskIds ? [accountId, taskIds] : [accountId]
    );
    return rows.map(r => ({ id: r.id, code: r.code, shared: false, version: r.version, ...r.content }));
}

async function loadSettings(accountId, templateId) {
    const { rows } = await db.query(
        'SELECT disabled_task_codes, custom_task_ids FROM account_scorecard_settings WHERE account_id = $1 AND template_id = $2',
        [accountId, templateId]
    );
    return { disabledTaskCodes: rows[0]?.disabled_task_codes ?? [], customTaskIds: rows[0]?.custom_task_ids ?? [] };
}

/**
 * The latest version of a scorecard as this account sees it: shared tasks
 * (with an enabled flag from the company's settings) followed by the
 * company's own tasks added to it.
 */
async function getScorecard(slug, user) {
    const { rows } = await db.query(
        `SELECT t.id AS template_id, t.slug, t.title, t.role, v.id AS version_id, v.version, v.task_version_ids, v.config
           FROM scorecard_templates t ${LATEST_TEMPLATE_VERSION}
          WHERE t.slug = $1`,
        [slug]
    );
    const r = rows[0];
    if (!r) throw new HttpError(404, 'Scorecard not found');
    const settings = await loadSettings(user.accountId, r.template_id);
    const disabled = new Set(settings.disabledTaskCodes);
    const shared = (await loadTaskVersions(r.task_version_ids)).map(t => ({ ...t, enabled: !disabled.has(t.code) }));
    const own = settings.customTaskIds.length
        ? (await loadCompanyTasks(user.accountId, settings.customTaskIds)).map(t => ({ ...t, enabled: true }))
        : [];
    return {
        templateId: r.template_id,
        versionId: r.version_id,
        slug: r.slug,
        title: r.title,
        role: r.role,
        version: r.version,
        config: r.config,
        tasks: [...shared, ...own],
        canEdit: user.userId === user.accountId,
    };
}

async function updateSettings(slug, user, body = {}) {
    assertOwner(user);
    const card = await getScorecard(slug, user);
    const sharedCodes = new Set(card.tasks.filter(t => t.shared).map(t => t.code));
    const { disabledTaskCodes, customTaskIds } = body;
    if (!Array.isArray(disabledTaskCodes) || !disabledTaskCodes.every(c => typeof c === 'string' && sharedCodes.has(c))) {
        throw new HttpError(400, 'disabledTaskCodes must list tasks on this scorecard');
    }
    if (!Array.isArray(customTaskIds) || !customTaskIds.every(id => Number.isInteger(id) && id > 0)) {
        throw new HttpError(400, 'customTaskIds must be a list of task ids');
    }
    const ids = [...new Set(customTaskIds)];
    if (ids.length) {
        const own = await loadCompanyTasks(user.accountId, ids);
        if (own.length !== ids.length) throw new HttpError(400, 'One of the added tasks no longer exists');
    }
    await db.query(
        `INSERT INTO account_scorecard_settings (account_id, template_id, disabled_task_codes, custom_task_ids, updated_by, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (account_id, template_id)
         DO UPDATE SET disabled_task_codes = EXCLUDED.disabled_task_codes, custom_task_ids = EXCLUDED.custom_task_ids,
                       updated_by = EXCLUDED.updated_by, updated_at = NOW()`,
        [user.accountId, card.templateId, [...new Set(disabledTaskCodes)], ids, user.userId]
    );
    return getScorecard(slug, user);
}

// ─── company tasks ───────────────────────────────────────────────────────────

function parseCompanyTask(body) {
    const errors = [];
    const content = validateTask(body, 'Task', errors);
    if (errors.length) throw new HttpError(400, errors[0], errors);
    return content;
}

async function listCompanyTasks(accountId) {
    return loadCompanyTasks(accountId);
}

async function createCompanyTask(user, body = {}) {
    assertOwner(user);
    const content = parseCompanyTask(body);
    const count = await db.query('SELECT COUNT(*)::int AS n FROM scorecard_tasks WHERE account_id = $1', [user.accountId]);
    if (count.rows[0].n >= MAX_COMPANY_TASKS) throw new HttpError(400, 'You have too many tasks');
    const id = await inTransaction(async (client) => {
        const seq = await client.query(`SELECT nextval(pg_get_serial_sequence('scorecard_tasks', 'id')) AS id`);
        const taskId = Number(seq.rows[0].id);
        // Company codes (CO12) can't collide with shared ones (T2, C1) because
        // they're unique per account and shown with a "Your task" label.
        await client.query(
            'INSERT INTO scorecard_tasks (id, code, account_id, created_by) VALUES ($1, $2, $3, $4)',
            [taskId, `CO${taskId}`, user.accountId, user.userId]
        );
        await upsertTaskVersion(client, taskId, content, user.userId);
        return taskId;
    });
    return (await loadCompanyTasks(user.accountId, [id]))[0];
}

/** Edits add a new version; evaluations already started keep their own copy. */
async function updateCompanyTask(id, user, body = {}) {
    assertOwner(user);
    const content = parseCompanyTask(body);
    const own = await loadCompanyTasks(user.accountId, [id]);
    if (!own.length) throw new HttpError(404, 'Task not found');
    await inTransaction(client => upsertTaskVersion(client, id, content, user.userId));
    return (await loadCompanyTasks(user.accountId, [id]))[0];
}

async function deleteCompanyTask(id, user) {
    assertOwner(user);
    await inTransaction(async (client) => {
        const { rowCount } = await client.query('DELETE FROM scorecard_tasks WHERE id = $1 AND account_id = $2', [id, user.accountId]);
        if (!rowCount) throw new HttpError(404, 'Task not found');
        await client.query(
            `UPDATE account_scorecard_settings SET custom_task_ids = array_remove(custom_task_ids, $1), updated_at = NOW()
              WHERE account_id = $2`,
            [id, user.accountId]
        );
    });
}

// ─── evaluations ─────────────────────────────────────────────────────────────

async function pipelineInAccount(pipelineId, accountId) {
    const { rows } = await db.query(
        `SELECT j.user_id, cp.job_id FROM candidate_pipeline cp
           JOIN jobs j ON j.id = cp.job_id
          WHERE cp.id = $1`,
        [pipelineId]
    );
    // 404 rather than 403, so other accounts' application ids aren't confirmed.
    if (!rows[0] || rows[0].user_id !== accountId) throw new HttpError(404, 'Application not found');
    return rows[0].job_id;
}

/** Candidates a scorer can pick: every non-rejected application in the account. */
async function listScorableCandidates(accountId) {
    const { rows } = await db.query(
        `SELECT cp.id AS pipeline_id, COALESCE(NULLIF(c.full_name, ''), c.filename) AS name,
                j.id AS job_id, j.title AS job_title, cp.pipeline_status
           FROM candidate_pipeline cp
           JOIN jobs j ON j.id = cp.job_id
           JOIN candidates c ON c.id = cp.candidate_id
          WHERE j.user_id = $1 AND cp.pipeline_status <> 'rejected'
          ORDER BY cp.updated_at DESC NULLS LAST, cp.id DESC
          LIMIT 500`,
        [accountId]
    );
    return rows.map(r => ({ pipelineId: r.pipeline_id, name: r.name, jobId: r.job_id, jobTitle: r.job_title, status: r.pipeline_status }));
}

async function loadTemplateVersion(versionId) {
    const { rows } = await db.query(
        `SELECT v.id, v.version, v.config, t.slug, t.title, t.role
           FROM scorecard_template_versions v JOIN scorecard_templates t ON t.id = v.template_id
          WHERE v.id = $1`,
        [versionId]
    );
    return rows[0];
}

const chosenTasks = (row) => {
    const byCode = new Map(row.tasks.map(t => [t.code, t]));
    return row.chosen_task_codes.map(c => byCode.get(c)).filter(Boolean);
};

function computeResult(row, config) {
    return scoreEvaluation({
        tasks: chosenTasks(row),
        config,
        stepScores: row.step_scores,
        itemScores: row.item_scores,
        redFlags: row.red_flags,
    });
}

function shapeEvaluation(row, tv, { full }) {
    const base = {
        id: row.id,
        pipelineId: row.candidate_pipeline_id,
        jobId: row.job_id,
        status: row.status,
        scorerEmail: row.scorer_email,
        scorerUserId: row.scorer_user_id,
        // DATE as plain text, so no timezone can shift the day.
        evaluatedOn: row.evaluated_on_text ?? row.evaluated_on,
        candidateConsent: row.candidate_consent,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        submittedAt: row.submitted_at,
        scorecard: { slug: tv.slug, title: tv.title, role: tv.role, version: tv.version, bands: tv.config.bands },
        chosenTaskCodes: row.chosen_task_codes,
        result: row.status === 'submitted' ? row.result : computeResult(row, tv.config),
        ...(row.candidate_name !== undefined && { candidateName: row.candidate_name, jobTitle: row.job_title }),
    };
    if (!full) return base;
    return {
        ...base,
        config: tv.config,
        tasks: row.tasks,
        stepScores: row.step_scores,
        itemScores: row.item_scores,
        redFlags: row.red_flags,
        currentScreen: row.current_screen,
    };
}

const EVAL_SELECT = `
    SELECT e.*, to_char(e.evaluated_on, 'YYYY-MM-DD') AS evaluated_on_text,
           COALESCE(NULLIF(c.full_name, ''), c.filename) AS candidate_name, j.title AS job_title
      FROM ride_along_evaluations e
      JOIN candidate_pipeline cp ON cp.id = e.candidate_pipeline_id
      JOIN candidates c ON c.id = cp.candidate_id
      JOIN jobs j ON j.id = e.job_id`;

async function shapeRows(rows, opts) {
    const cache = new Map();
    const out = [];
    for (const row of rows) {
        if (!cache.has(row.template_version_id)) cache.set(row.template_version_id, await loadTemplateVersion(row.template_version_id));
        out.push(shapeEvaluation(row, cache.get(row.template_version_id), opts));
    }
    return out;
}

async function createEvaluation({ pipelineId, slug, user }) {
    const jobId = await pipelineInAccount(pipelineId, user.accountId);
    const card = await getScorecard(slug, user);
    // Copy every task the scorer can pick now, so later library or company
    // edits never change this evaluation.
    const tasks = card.tasks.filter(t => t.enabled).map(({ enabled, id, ...t }) => t);
    if (!tasks.length) throw new HttpError(400, 'Every task on this scorecard is turned off');
    const { rows } = await db.query(
        `INSERT INTO ride_along_evaluations
            (account_id, candidate_pipeline_id, job_id, template_version_id, scorer_user_id, scorer_email, tasks)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [user.accountId, pipelineId, jobId, card.versionId, user.userId, user.email || null, JSON.stringify(tasks)]
    );
    return getEvaluation(rows[0].id, user.accountId);
}

async function loadRow(id, accountId) {
    const { rows } = await db.query(`${EVAL_SELECT} WHERE e.id = $1 AND e.account_id = $2`, [id, accountId]);
    if (!rows[0]) throw new HttpError(404, 'Evaluation not found');
    return rows[0];
}

async function getEvaluation(id, accountId) {
    const row = await loadRow(id, accountId);
    return (await shapeRows([row], { full: true }))[0];
}

async function listForPipeline(pipelineId, accountId) {
    await pipelineInAccount(pipelineId, accountId);
    const { rows } = await db.query(
        `${EVAL_SELECT} WHERE e.candidate_pipeline_id = $1 AND e.account_id = $2 ORDER BY e.created_at DESC`,
        [pipelineId, accountId]
    );
    return shapeRows(rows, { full: false });
}

async function listMyDrafts(user) {
    const { rows } = await db.query(
        `${EVAL_SELECT} WHERE e.account_id = $1 AND e.scorer_user_id = $2 AND e.status = 'draft' ORDER BY e.updated_at DESC LIMIT 50`,
        [user.accountId, user.userId]
    );
    return shapeRows(rows, { full: false });
}

function cleanNote(note) {
    if (note === undefined || note === null) return '';
    if (typeof note !== 'string') throw new HttpError(400, 'Notes must be text');
    return note.slice(0, MAX_NOTE);
}

function cleanScore(score) {
    if (score === null || score === undefined) return null;
    if (SCORE_VALUES.includes(score) || score === NA) return score;
    throw new HttpError(400, 'Score must be 0, 1, 2 or N/A');
}

const isDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

/**
 * Autosave. One change per call keeps each tap small and lets concurrent taps
 * merge in SQL rather than overwrite each other. Body (one of):
 *   { chosenTaskCodes: [...] }
 *   { step: { key, score, note } }     score: 0 | 1 | 2 | 'na' | null
 *   { item: { key, score, note } }
 *   { redFlag: { key, ticked, note } }
 *   { currentScreen }  { evaluatedOn: 'YYYY-MM-DD' }
 * currentScreen may ride along with any of the above.
 */
async function saveProgress(id, accountId, body = {}) {
    const row = await loadRow(id, accountId);
    if (row.status !== 'draft') throw new HttpError(409, 'This evaluation is submitted and locked');
    const tv = await loadTemplateVersion(row.template_version_id);
    const sets = [];
    const params = [];
    const p = (v) => { params.push(v); return `$${params.length}`; };

    const entry = (score, note) => (score === null && !note ? null : { score, note });
    const mergeKey = (column, key, value) => (value === null
        ? `${column} = ${column} - ${p(key)}::text`
        : `${column} = ${column} || jsonb_build_object(${p(key)}::text, ${p(JSON.stringify(value))}::jsonb)`);

    if (body.chosenTaskCodes !== undefined) {
        const available = new Set(row.tasks.map(t => t.code));
        if (!Array.isArray(body.chosenTaskCodes) || !body.chosenTaskCodes.every(c => typeof c === 'string' && available.has(c))) {
            throw new HttpError(400, 'Pick tasks from this scorecard');
        }
        // Keep the scorecard's order regardless of tap order.
        const picked = new Set(body.chosenTaskCodes);
        sets.push(`chosen_task_codes = ${p(row.tasks.map(t => t.code).filter(c => picked.has(c)))}`);
    }
    if (body.step !== undefined) {
        const { key, score, note } = body.step || {};
        const valid = typeof key === 'string' && row.tasks.some(t => t.steps.some(s => `${t.code}.${s.key}` === key));
        if (!valid) throw new HttpError(400, 'Unknown step');
        sets.push(mergeKey('step_scores', key, entry(cleanScore(score), cleanNote(note))));
    }
    if (body.item !== undefined) {
        const { key, score, note } = body.item || {};
        const valid = typeof key === 'string' && tv.config.categories.some(c => c.items.some(it => `${c.key}.${it.key}` === key));
        if (!valid) throw new HttpError(400, 'Unknown observation item');
        sets.push(mergeKey('item_scores', key, entry(cleanScore(score), cleanNote(note))));
    }
    if (body.redFlag !== undefined) {
        const { key, ticked, note } = body.redFlag || {};
        if (typeof key !== 'string' || !tv.config.redFlags.some(f => f.key === key)) throw new HttpError(400, 'Unknown red flag');
        sets.push(mergeKey('red_flags', key, ticked === true ? { note: cleanNote(note) } : null));
    }
    if (body.evaluatedOn !== undefined) {
        if (!isDate(body.evaluatedOn)) throw new HttpError(400, 'Date must be YYYY-MM-DD');
        sets.push(`evaluated_on = ${p(body.evaluatedOn)}`);
    }
    if (body.currentScreen !== undefined) {
        if (typeof body.currentScreen !== 'string' || !SCREEN_RE.test(body.currentScreen)) throw new HttpError(400, 'Invalid screen');
        sets.push(`current_screen = ${p(body.currentScreen)}`);
    }
    if (!sets.length) throw new HttpError(400, 'Nothing to save');

    const { rowCount } = await db.query(
        `UPDATE ride_along_evaluations SET ${sets.join(', ')}, updated_at = NOW()
          WHERE id = ${p(id)} AND account_id = ${p(accountId)} AND status = 'draft'`,
        params
    );
    if (!rowCount) throw new HttpError(409, 'This evaluation is submitted and locked');
    return getEvaluation(id, accountId);
}

async function submitEvaluation(id, accountId) {
    const row = await loadRow(id, accountId);
    if (row.status !== 'draft') throw new HttpError(409, 'This evaluation is already submitted');
    const tv = await loadTemplateVersion(row.template_version_id);
    const missingNotes = tv.config.redFlags.filter(f => row.red_flags[f.key] && !String(row.red_flags[f.key].note || '').trim());
    if (missingNotes.length) {
        throw new HttpError(400, 'Add a note to every red flag you ticked', missingNotes.map(f => f.text));
    }
    const result = computeResult(row, tv.config);
    if (result.total === null && !result.failed) throw new HttpError(400, 'Score at least one step or observation before submitting');
    const { rowCount } = await db.query(
        `UPDATE ride_along_evaluations SET status = 'submitted', result = $1, submitted_at = NOW(), updated_at = NOW()
          WHERE id = $2 AND account_id = $3 AND status = 'draft'`,
        [JSON.stringify(result), id, accountId]
    );
    if (!rowCount) throw new HttpError(409, 'This evaluation is already submitted');
    return getEvaluation(id, accountId);
}

async function discardEvaluation(id, accountId) {
    const { rowCount } = await db.query(
        `DELETE FROM ride_along_evaluations WHERE id = $1 AND account_id = $2 AND status = 'draft'`,
        [id, accountId]
    );
    if (!rowCount) throw new HttpError(404, 'No draft to discard');
}

/** Every note the scorer wrote, labelled with what it was about. */
function collectNotes(row, config) {
    const notes = [];
    for (const t of chosenTasks(row)) {
        for (const s of t.steps) {
            const n = row.step_scores[`${t.code}.${s.key}`]?.note;
            if (n) notes.push({ about: `${t.code} ${t.name} · step ${s.key}`, note: n });
        }
    }
    for (const c of config.categories) {
        for (const it of c.items) {
            const n = row.item_scores[`${c.key}.${it.key}`]?.note;
            if (n) notes.push({ about: `${c.name} · ${it.text}`, note: n });
        }
    }
    return notes;
}

/**
 * Owner comparison for one job: per candidate, the latest submitted
 * evaluation (plus how many there are in total), with the scorer's notes.
 */
async function compareForJob(jobId, accountId) {
    const job = await db.query('SELECT id, title FROM jobs WHERE id = $1 AND user_id = $2', [jobId, accountId]);
    if (!job.rows[0]) throw new HttpError(404, 'Job not found');
    const { rows } = await db.query(
        `${EVAL_SELECT}
          WHERE e.job_id = $1 AND e.account_id = $2 AND e.status = 'submitted'
          ORDER BY e.candidate_pipeline_id, e.submitted_at DESC`,
        [jobId, accountId]
    );
    const byPipeline = new Map();
    for (const row of rows) {
        const entry = byPipeline.get(row.candidate_pipeline_id);
        if (entry) { entry.count += 1; entry.others.push({ id: row.id, submittedAt: row.submitted_at, total: row.result?.total ?? null }); continue; }
        byPipeline.set(row.candidate_pipeline_id, { row, count: 1, others: [] });
    }
    const cache = new Map();
    const candidates = [];
    for (const { row, count, others } of byPipeline.values()) {
        if (!cache.has(row.template_version_id)) cache.set(row.template_version_id, await loadTemplateVersion(row.template_version_id));
        const tv = cache.get(row.template_version_id);
        candidates.push({
            ...shapeEvaluation(row, tv, { full: false }),
            evaluationCount: count,
            otherEvaluations: others,
            notes: collectNotes(row, tv.config),
        });
    }
    candidates.sort((a, b) => (b.result?.total ?? -1) - (a.result?.total ?? -1));
    return { job: job.rows[0], candidates };
}

module.exports = {
    HttpError,
    importBundle,
    adminStatus,
    listScorecards,
    getScorecard,
    updateSettings,
    listCompanyTasks,
    createCompanyTask,
    updateCompanyTask,
    deleteCompanyTask,
    listScorableCandidates,
    createEvaluation,
    getEvaluation,
    listForPipeline,
    listMyDrafts,
    saveProgress,
    submitEvaluation,
    discardEvaluation,
    compareForJob,
};
