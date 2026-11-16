/**
 * Ride-along scorecards over HTTP with the real authenticateToken middleware
 * and an in-memory stand-in for the database. Covers: authentication, tenant
 * isolation (no admin bypass), teammates sharing their account, owner-only
 * settings and company tasks, autosave merging, submit rules and locking,
 * template versioning, and the library never duplicating a task.
 */
process.env.JWT_SECRET = 'test-secret';

const http = require('http');
const express = require('express');
const jwt = require('jsonwebtoken');
const { syntheticBundle } = require('./helpers/rideAlongFixtures');

// ─── in-memory database ──────────────────────────────────────────────────────

const state = {};
function resetState() {
    state.users = {
        1: { id: 1, email: 'owner-a@example.com', role: 'user' },
        5: { id: 5, email: 'teammate-a@example.com', role: 'user', parent_user_id: 1 },
        2: { id: 2, email: 'owner-b@example.com', role: 'user' },
        3: { id: 3, email: 'admin@example.com', role: 'admin' },
    };
    state.jobs = { 10: { id: 10, user_id: 1, title: 'Service Tech A' }, 20: { id: 20, user_id: 2, title: 'Service Tech B' } };
    state.pipelines = {
        100: { job_id: 10, name: 'Alice' },
        101: { job_id: 10, name: 'Bob' },
        200: { job_id: 20, name: 'Carol' },
    };
    state.tasks = [];          // { id, code, account_id }
    state.taskVersions = [];   // { id, task_id, version, content, content_sha256 }
    state.templates = [];      // { id, slug, title, role }
    state.templateVersions = []; // { id, template_id, version, task_version_ids, config, content_sha256 }
    state.settings = [];       // { account_id, template_id, disabled_task_codes, custom_task_ids }
    state.evaluations = [];
    state.seq = 1;
}

const latest = (list, key, id) => list.filter(x => x[key] === id).sort((a, b) => b.version - a.version)[0];
const evalOut = (e) => {
    const p = state.pipelines[e.candidate_pipeline_id];
    return { ...e, candidate_name: p.name, job_title: state.jobs[e.job_id].title };
};
const templateRow = (t, v) => ({ template_id: t.id, slug: t.slug, title: t.title, role: t.role, version_id: v.id, version: v.version, task_version_ids: v.task_version_ids, config: v.config });

const fakeQuery = async (sql, params = []) => {
    const s = sql.replace(/\s+/g, ' ').trim();
    if (/^(BEGIN|COMMIT|ROLLBACK)$/.test(s) || /pg_advisory_xact_lock/.test(s)) return { rows: [] };
    if (/SELECT \* FROM users WHERE id = \$1/.test(s)) return { rows: state.users[params[0]] ? [state.users[params[0]]] : [] };

    // pipelines / jobs
    if (/FROM candidate_pipeline cp JOIN jobs j ON j.id = cp.job_id WHERE cp.id = \$1/.test(s)) {
        const p = state.pipelines[params[0]];
        return { rows: p ? [{ user_id: state.jobs[p.job_id].user_id, job_id: p.job_id }] : [] };
    }
    if (/SELECT id, title FROM jobs WHERE id = \$1 AND user_id = \$2/.test(s)) {
        const j = state.jobs[params[0]];
        return { rows: j && j.user_id === params[1] ? [j] : [] };
    }

    // task library
    if (/SELECT id FROM scorecard_tasks WHERE code = \$1 AND account_id IS NULL/.test(s)) {
        return { rows: state.tasks.filter(t => t.code === params[0] && t.account_id === null) };
    }
    if (/^INSERT INTO scorecard_tasks \(code, account_id, created_by\)/.test(s)) {
        const row = { id: state.seq++, code: params[0], account_id: null };
        state.tasks.push(row);
        return { rows: [row] };
    }
    if (/SELECT nextval/.test(s)) return { rows: [{ id: state.seq++ }] };
    if (/^INSERT INTO scorecard_tasks \(id, code, account_id, created_by\)/.test(s)) {
        state.tasks.push({ id: params[0], code: params[1], account_id: params[2] });
        return { rows: [] };
    }
    if (/FROM scorecard_task_versions WHERE task_id = \$1 ORDER BY version DESC LIMIT 1/.test(s)) {
        const v = latest(state.taskVersions, 'task_id', params[0]);
        return { rows: v ? [v] : [] };
    }
    if (/^INSERT INTO scorecard_task_versions/.test(s)) {
        const row = { id: state.seq++, task_id: params[0], version: params[1], content: JSON.parse(params[2]), content_sha256: params[3] };
        state.taskVersions.push(row);
        return { rows: [row] };
    }
    if (/SELECT t.code, v.id FROM scorecard_tasks t/.test(s)) {
        const rows = state.tasks.filter(t => t.account_id === null && params[0].includes(t.code))
            .map(t => ({ code: t.code, id: latest(state.taskVersions, 'task_id', t.id).id }));
        return { rows };
    }
    if (/FROM scorecard_task_versions v JOIN scorecard_tasks t ON t.id = v.task_id WHERE v.id = ANY/.test(s)) {
        const rows = state.taskVersions.filter(v => params[0].includes(v.id)).map(v => {
            const t = state.tasks.find(x => x.id === v.task_id);
            return { id: v.id, version: v.version, content: v.content, code: t.code, account_id: t.account_id };
        });
        return { rows };
    }
    if (/FROM scorecard_tasks t JOIN LATERAL .* WHERE t.account_id = \$1/.test(s)) {
        const rows = state.tasks
            .filter(t => t.account_id === params[0] && (!params[1] || params[1].includes(t.id)))
            .map(t => { const v = latest(state.taskVersions, 'task_id', t.id); return { id: t.id, code: t.code, version: v.version, content: v.content }; });
        return { rows };
    }
    if (/^DELETE FROM scorecard_tasks WHERE id = \$1 AND account_id = \$2/.test(s)) {
        const before = state.tasks.length;
        state.tasks = state.tasks.filter(t => !(t.id === params[0] && t.account_id === params[1]));
        return { rows: [], rowCount: before - state.tasks.length };
    }
    if (/SELECT COUNT\(\*\)::int AS n FROM scorecard_tasks WHERE account_id = \$1/.test(s)) {
        return { rows: [{ n: state.tasks.filter(t => t.account_id === params[0]).length }] };
    }

    // templates
    if (/^INSERT INTO scorecard_templates/.test(s)) {
        let t = state.templates.find(x => x.slug === params[0]);
        if (!t) { t = { id: state.seq++, slug: params[0] }; state.templates.push(t); }
        Object.assign(t, { title: params[1], role: params[2] });
        return { rows: [{ id: t.id }] };
    }
    if (/SELECT version, content_sha256 FROM scorecard_template_versions WHERE template_id = \$1/.test(s)) {
        const v = latest(state.templateVersions, 'template_id', params[0]);
        return { rows: v ? [v] : [] };
    }
    if (/^INSERT INTO scorecard_template_versions/.test(s)) {
        state.templateVersions.push({ id: state.seq++, template_id: params[0], version: params[1], task_version_ids: params[2], config: JSON.parse(params[3]), content_sha256: params[4] });
        return { rows: [] };
    }
    if (/FROM scorecard_templates t JOIN LATERAL .* WHERE t.slug = \$1/.test(s)) {
        const t = state.templates.find(x => x.slug === params[0]);
        const v = t && latest(state.templateVersions, 'template_id', t.id);
        return { rows: v ? [templateRow(t, v)] : [] };
    }
    if (/FROM scorecard_templates t JOIN LATERAL .* ORDER BY t.title/.test(s)) {
        const rows = state.templates.map(t => {
            const v = latest(state.templateVersions, 'template_id', t.id);
            return { slug: t.slug, title: t.title, role: t.role, version: v.version, task_count: v.task_version_ids.length, category_count: v.config.categories.length };
        });
        return { rows };
    }
    if (/FROM scorecard_template_versions v JOIN scorecard_templates t ON t.id = v.template_id WHERE v.id = \$1/.test(s)) {
        const v = state.templateVersions.find(x => x.id === params[0]);
        const t = v && state.templates.find(x => x.id === v.template_id);
        return { rows: v ? [{ id: v.id, version: v.version, config: v.config, slug: t.slug, title: t.title, role: t.role }] : [] };
    }

    // settings
    if (/FROM account_scorecard_settings WHERE account_id = \$1 AND template_id = \$2/.test(s)) {
        return { rows: state.settings.filter(x => x.account_id === params[0] && x.template_id === params[1]) };
    }
    if (/^INSERT INTO account_scorecard_settings/.test(s)) {
        state.settings = state.settings.filter(x => !(x.account_id === params[0] && x.template_id === params[1]));
        state.settings.push({ account_id: params[0], template_id: params[1], disabled_task_codes: params[2], custom_task_ids: params[3] });
        return { rows: [] };
    }
    if (/^UPDATE account_scorecard_settings SET custom_task_ids = array_remove/.test(s)) {
        state.settings.filter(x => x.account_id === params[1]).forEach(x => { x.custom_task_ids = x.custom_task_ids.filter(i => i !== params[0]); });
        return { rows: [] };
    }

    // evaluations
    if (/^INSERT INTO ride_along_evaluations/.test(s)) {
        const [accountId, pipelineId, jobId, versionId, userId, email, tasks] = params;
        const row = {
            id: state.seq++, account_id: accountId, candidate_pipeline_id: pipelineId, job_id: jobId, template_version_id: versionId,
            scorer_user_id: userId, scorer_email: email, evaluated_on: '2026-11-16', tasks: JSON.parse(tasks), chosen_task_codes: [],
            step_scores: {}, item_scores: {}, red_flags: {}, candidate_consent: false, current_screen: null, status: 'draft',
            result: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), submitted_at: null,
        };
        state.evaluations.push(row);
        return { rows: [{ id: row.id }] };
    }
    if (/FROM ride_along_evaluations e/.test(s)) {
        let rows = state.evaluations;
        if (/WHERE e.id = \$1 AND e.account_id = \$2/.test(s)) rows = rows.filter(e => e.id === params[0] && e.account_id === params[1]);
        else if (/WHERE e.candidate_pipeline_id = \$1 AND e.account_id = \$2/.test(s)) rows = rows.filter(e => e.candidate_pipeline_id === params[0] && e.account_id === params[1]);
        else if (/e.scorer_user_id = \$2 AND e.status = 'draft'/.test(s)) rows = rows.filter(e => e.account_id === params[0] && e.scorer_user_id === params[1] && e.status === 'draft');
        else if (/WHERE e.job_id = \$1 AND e.account_id = \$2 AND e.status = 'submitted'/.test(s)) {
            rows = rows.filter(e => e.job_id === params[0] && e.account_id === params[1] && e.status === 'submitted')
                .sort((a, b) => a.candidate_pipeline_id - b.candidate_pipeline_id || b.id - a.id);
        } else throw new Error(`Unexpected evaluation select: ${s.slice(0, 160)}`);
        return { rows: rows.map(evalOut) };
    }
    if (/^UPDATE ride_along_evaluations SET status = 'submitted'/.test(s)) {
        const [result, id, accountId] = params;
        const row = state.evaluations.find(e => e.id === id && e.account_id === accountId && e.status === 'draft');
        if (!row) return { rows: [], rowCount: 0 };
        Object.assign(row, { status: 'submitted', result: JSON.parse(result), submitted_at: new Date().toISOString() });
        return { rows: [], rowCount: 1 };
    }
    if (/^UPDATE ride_along_evaluations SET/.test(s)) {
        const where = s.match(/WHERE id = \$(\d+) AND account_id = \$(\d+) AND status = 'draft'/);
        const id = params[where[1] - 1];
        const accountId = params[where[2] - 1];
        const row = state.evaluations.find(e => e.id === id && e.account_id === accountId && e.status === 'draft');
        if (!row) return { rows: [], rowCount: 0 };
        for (const m of s.matchAll(/(step_scores|item_scores|red_flags) = \1 \|\| jsonb_build_object\(\$(\d+)::text, \$(\d+)::jsonb\)/g)) {
            row[m[1]] = { ...row[m[1]], [params[m[2] - 1]]: JSON.parse(params[m[3] - 1]) };
        }
        for (const m of s.matchAll(/(step_scores|item_scores|red_flags) = \1 - \$(\d+)::text/g)) {
            const { [params[m[2] - 1]]: _, ...rest } = row[m[1]];
            row[m[1]] = rest;
        }
        const simple = (col) => { const m = s.match(new RegExp(`${col} = \\$(\\d+)`)); if (m) row[col] = params[m[1] - 1]; };
        ['chosen_task_codes', 'evaluated_on', 'current_screen'].forEach(simple);
        return { rows: [], rowCount: 1 };
    }
    if (/^DELETE FROM ride_along_evaluations/.test(s)) {
        const before = state.evaluations.length;
        state.evaluations = state.evaluations.filter(e => !(e.id === params[0] && e.account_id === params[1] && e.status === 'draft'));
        return { rows: [], rowCount: before - state.evaluations.length };
    }
    throw new Error(`Unexpected query in test: ${s.slice(0, 160)}`);
};

jest.mock('../config/database', () => ({
    query: (...a) => fakeQuery(...a),
    getClient: async () => ({ query: (...a) => fakeQuery(...a), release: () => {} }),
    pool: {},
}));
jest.mock('../services/gmailService', () => ({}));
jest.mock('../config/logoS3', () => ({}));
jest.mock('../services/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }));

const { authenticateToken, requireAdmin } = require('../routes/authRoutes');
const { scorecardRouter, taskRouter, evaluationRouter, adminRouter } = require('../routes/rideAlongRoutes');
const svc = require('../services/rideAlong/rideAlongService');

// ─── server ──────────────────────────────────────────────────────────────────

let server;
let base;
beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/scorecards', authenticateToken, scorecardRouter);
    app.use('/api/scorecard-tasks', authenticateToken, taskRouter);
    app.use('/api/evaluations', authenticateToken, evaluationRouter);
    app.use('/api/admin/scorecards', authenticateToken, requireAdmin, adminRouter);
    server = http.createServer(app);
    await new Promise(r => server.listen(0, r));
    base = `http://127.0.0.1:${server.address().port}`;
});
afterAll(() => new Promise(r => server.close(r)));
beforeEach(async () => {
    resetState();
    await svc.importBundle(syntheticBundle(), { sourceFilename: 'test.json', uploadedBy: 3 });
});

const token = (userId, accountId, role = 'user') =>
    jwt.sign({ userId, email: state.users[userId]?.email, role, accountId }, process.env.JWT_SECRET);
const OWNER_A = () => token(1, 1);
const TEAMMATE_A = () => token(5, 1);
const OWNER_B = () => token(2, 2);
const ADMIN = () => token(3, 3, 'admin');

async function call(method, url, { auth, body, form } = {}) {
    const res = await fetch(base + url, {
        method,
        headers: { ...(!form && { 'content-type': 'application/json' }), ...(auth && { authorization: `Bearer ${auth}` }) },
        body: form || (body ? JSON.stringify(body) : undefined),
    });
    let json = null;
    try { json = await res.json(); } catch { /* empty */ }
    return { status: res.status, json, headers: res.headers };
}

const start = (auth = OWNER_A(), pipelineId = 100, scorecard = 'residential-service-tech') =>
    call('POST', '/api/evaluations', { auth, body: { pipelineId, scorecard } });
const patch = (id, body, auth = OWNER_A()) => call('PATCH', `/api/evaluations/${id}`, { auth, body });

/** Starts an evaluation and scores everything 2 except as overridden. */
async function scoredEvaluation({ auth = OWNER_A(), pipelineId = 100, step = 2 } = {}) {
    const { json } = await start(auth, pipelineId);
    const id = json.data.evaluation.id;
    await patch(id, { chosenTaskCodes: ['T1', 'T2'] }, auth);
    for (const k of ['T1.1', 'T1.2', 'T1.3', 'T2.1', 'T2.2']) await patch(id, { step: { key: k, score: step } }, auth);
    for (const k of ['communication.1', 'communication.2', 'cleanliness.1']) await patch(id, { item: { key: k, score: 2 } }, auth);
    return id;
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('authentication is required everywhere', () => {
    test.each([
        ['GET', '/api/scorecards'],
        ['GET', '/api/scorecards/residential-service-tech'],
        ['PUT', '/api/scorecards/residential-service-tech/settings'],
        ['GET', '/api/scorecard-tasks'],
        ['POST', '/api/scorecard-tasks'],
        ['GET', '/api/evaluations?pipelineId=100'],
        ['GET', '/api/evaluations/candidates'],
        ['GET', '/api/evaluations/compare?jobId=10'],
        ['POST', '/api/evaluations'],
        ['GET', '/api/evaluations/1'],
        ['PATCH', '/api/evaluations/1'],
        ['POST', '/api/evaluations/1/submit'],
        ['DELETE', '/api/evaluations/1'],
        ['GET', '/api/admin/scorecards'],
    ])('%s %s without a token is 401', async (method, url) => {
        expect((await call(method, url)).status).toBe(401);
    });

    test('content routes are never cacheable', async () => {
        const res = await call('GET', '/api/scorecards/residential-service-tech', { auth: OWNER_A() });
        expect(res.headers.get('cache-control')).toBe('private, no-store');
    });

    test('content uploads are admin only', async () => {
        expect((await call('GET', '/api/admin/scorecards', { auth: OWNER_A() })).status).toBe(403);
    });
});

describe('tenant isolation', () => {
    test('a company cannot start an evaluation on another company\'s candidate', async () => {
        expect((await start(OWNER_B(), 100)).status).toBe(404);
        expect((await start(OWNER_A(), 200)).status).toBe(404);
    });

    test('another company cannot read, score, submit or discard an evaluation, even as platform admin', async () => {
        const { json } = await start();
        const id = json.data.evaluation.id;
        for (const auth of [OWNER_B(), ADMIN()]) {
            expect((await call('GET', `/api/evaluations/${id}`, { auth })).status).toBe(404);
            expect((await patch(id, { currentScreen: 'tasks' }, auth)).status).toBe(404);
            expect((await call('POST', `/api/evaluations/${id}/submit`, { auth })).status).toBe(404);
            expect((await call('DELETE', `/api/evaluations/${id}`, { auth })).status).toBe(404);
            expect((await call('GET', '/api/evaluations?pipelineId=100', { auth })).status).toBe(404);
            expect((await call('GET', '/api/evaluations/compare?jobId=10', { auth })).status).toBe(404);
        }
    });

    test('the candidate picker only lists the company\'s own applications', async () => {
        // Covered by the SQL filter on j.user_id; here we just check it is scoped to the caller's account.
        const spy = jest.spyOn(svc, 'listScorableCandidates');
        spy.mockResolvedValueOnce([]);
        await call('GET', '/api/evaluations/candidates', { auth: TEAMMATE_A() });
        expect(spy).toHaveBeenCalledWith(1);
        spy.mockRestore();
    });

    test('teammates share the account: a teammate can score and the owner sees it', async () => {
        const id = await scoredEvaluation({ auth: TEAMMATE_A() });
        const owner = await call('GET', `/api/evaluations/${id}`, { auth: OWNER_A() });
        expect(owner.status).toBe(200);
        expect(owner.json.data.evaluation.scorerEmail).toBe('teammate-a@example.com');
        expect(owner.json.data.evaluation.result.total).toBe(100);
    });

    test('drafts list is per scorer', async () => {
        await start(TEAMMATE_A());
        expect((await call('GET', '/api/evaluations?mine=drafts', { auth: TEAMMATE_A() })).json.data.evaluations).toHaveLength(1);
        expect((await call('GET', '/api/evaluations?mine=drafts', { auth: OWNER_A() })).json.data.evaluations).toHaveLength(0);
    });
});

describe('scoring flow', () => {
    test('a new evaluation copies the enabled tasks, records the template version and defaults consent to false', async () => {
        const { status, json } = await start();
        expect(status).toBe(201);
        const e = json.data.evaluation;
        expect(e.status).toBe('draft');
        expect(e.candidateConsent).toBe(false);
        expect(e.scorecard).toEqual(expect.objectContaining({ slug: 'residential-service-tech', version: 1 }));
        expect(e.tasks.map(t => t.code)).toEqual(['T1', 'T2']);
        expect(e.jobId).toBe(10);
    });

    test('autosave merges taps instead of overwriting', async () => {
        const { json } = await start();
        const id = json.data.evaluation.id;
        await patch(id, { chosenTaskCodes: ['T2', 'T1'] });
        await patch(id, { step: { key: 'T1.1', score: 2 } });
        await patch(id, { step: { key: 'T1.3', score: 'na', note: 'no access' } });
        const res = await patch(id, { item: { key: 'communication.1', score: 1 }, currentScreen: 'observations' });
        const e = res.json.data.evaluation;
        expect(e.chosenTaskCodes).toEqual(['T1', 'T2']); // scorecard order
        expect(e.stepScores).toEqual({ 'T1.1': { score: 2, note: '' }, 'T1.3': { score: 'na', note: 'no access' } });
        expect(e.itemScores).toEqual({ 'communication.1': { score: 1, note: '' } });
        expect(e.currentScreen).toBe('observations');
    });

    test('clearing a score with no note removes it', async () => {
        const { json } = await start();
        const id = json.data.evaluation.id;
        await patch(id, { step: { key: 'T1.1', score: 2 } });
        const res = await patch(id, { step: { key: 'T1.1', score: null } });
        expect(res.json.data.evaluation.stepScores).toEqual({});
    });

    test.each([
        [{ step: { key: 'T9.1', score: 2 } }, 'Unknown step'],
        [{ step: { key: 'T1.1', score: 3 } }, 'Score must be 0, 1, 2 or N/A'],
        [{ item: { key: 'communication.9', score: 2 } }, 'Unknown observation item'],
        [{ redFlag: { key: 'made-up', ticked: true } }, 'Unknown red flag'],
        [{ chosenTaskCodes: ['C1'] }, 'Pick tasks from this scorecard'],
        [{ evaluatedOn: 'yesterday' }, 'Date must be YYYY-MM-DD'],
        [{}, 'Nothing to save'],
    ])('rejects %j', async (body, message) => {
        const { json } = await start();
        const res = await patch(json.data.evaluation.id, body);
        expect(res.status).toBe(400);
        expect(res.json.message).toBe(message);
    });

    test('a safety step scored 0 fails the evaluation with an automatic red flag', async () => {
        const { json } = await start();
        const id = json.data.evaluation.id;
        await patch(id, { chosenTaskCodes: ['T1'] });
        await patch(id, { step: { key: 'T1.1', score: 2 } });
        const res = await patch(id, { step: { key: 'T1.2', score: 0 } }); // step 2 is the safety step
        const r = res.json.data.evaluation.result;
        expect(r.tasks[0].score).toBe(0);
        expect(r.band.key).toBe('fail');
        expect(r.redFlags[0]).toEqual(expect.objectContaining({ auto: true, type: 'FAIL' }));
    });

    test('a ticked red flag needs a note before submitting', async () => {
        const id = await scoredEvaluation();
        await patch(id, { redFlag: { key: 'rude', ticked: true, note: '' } });
        const res = await call('POST', `/api/evaluations/${id}/submit`, { auth: OWNER_A() });
        expect(res.status).toBe(400);
        expect(res.json.message).toMatch(/note to every red flag/);
        await patch(id, { redFlag: { key: 'rude', ticked: true, note: 'swore at the customer' } });
        const ok = await call('POST', `/api/evaluations/${id}/submit`, { auth: OWNER_A() });
        expect(ok.status).toBe(200);
        expect(ok.json.data.evaluation.result.total).toBe(64);
        expect(ok.json.data.evaluation.result.capped).toBe(true);
    });

    test('unticking a red flag removes it', async () => {
        const id = await scoredEvaluation();
        await patch(id, { redFlag: { key: 'dishonest', ticked: true, note: 'x' } });
        const res = await patch(id, { redFlag: { key: 'dishonest', ticked: false } });
        expect(res.json.data.evaluation.redFlags).toEqual({});
        expect(res.json.data.evaluation.result.failed).toBe(false);
    });

    test('nothing scored cannot be submitted', async () => {
        const { json } = await start();
        const res = await call('POST', `/api/evaluations/${json.data.evaluation.id}/submit`, { auth: OWNER_A() });
        expect(res.status).toBe(400);
    });

    test('submitted evaluations are locked and keep their stored result', async () => {
        const id = await scoredEvaluation();
        const sub = await call('POST', `/api/evaluations/${id}/submit`, { auth: OWNER_A() });
        expect(sub.json.data.evaluation.status).toBe('submitted');
        expect((await patch(id, { step: { key: 'T1.1', score: 0 } })).status).toBe(409);
        expect((await call('POST', `/api/evaluations/${id}/submit`, { auth: OWNER_A() })).status).toBe(409);
        expect((await call('DELETE', `/api/evaluations/${id}`, { auth: OWNER_A() })).status).toBe(404);
    });

    test('drafts can be discarded', async () => {
        const { json } = await start();
        expect((await call('DELETE', `/api/evaluations/${json.data.evaluation.id}`, { auth: TEAMMATE_A() })).status).toBe(200);
        expect(state.evaluations).toHaveLength(0);
    });
});

describe('versioning and the task library', () => {
    test('re-uploading identical content creates no new versions', async () => {
        const summary = await svc.importBundle(syntheticBundle(), { sourceFilename: 'again.json', uploadedBy: 3 });
        expect(summary.tasks).toEqual({ created: 0, updated: 0, unchanged: 3 });
        expect(summary.scorecards.every(s => !s.created)).toBe(true);
        expect(state.tasks).toHaveLength(3);
        expect(state.taskVersions).toHaveLength(3);
    });

    test('a task used by two scorecards exists once in the library', () => {
        expect(state.tasks.filter(t => t.code === 'T2')).toHaveLength(1);
        const t2Version = state.taskVersions.find(v => v.task_id === state.tasks.find(t => t.code === 'T2').id).id;
        expect(state.templateVersions.filter(v => v.task_version_ids.includes(t2Version))).toHaveLength(2);
    });

    test('changing a task makes a new task version and a new version of every scorecard using it', async () => {
        const summary = await svc.importBundle(syntheticBundle({ t1Steps: 4 }), { sourceFilename: 'v2.json', uploadedBy: 3 });
        expect(summary.tasks).toEqual({ created: 0, updated: 1, unchanged: 2 });
        expect(summary.scorecards).toEqual([
            { slug: 'residential-service-tech', version: 2, created: true },
            { slug: 'commercial-service-tech', version: 1, created: false },
        ]);
    });

    test('an evaluation keeps the version it was scored on', async () => {
        const id = await scoredEvaluation();
        await svc.importBundle(syntheticBundle({ t1Steps: 4 }), { sourceFilename: 'v2.json', uploadedBy: 3 });
        const e = (await call('GET', `/api/evaluations/${id}`, { auth: OWNER_A() })).json.data.evaluation;
        expect(e.scorecard.version).toBe(1);
        expect(e.tasks.find(t => t.code === 'T1').steps).toHaveLength(3);
        expect(e.result.total).toBe(100);
        const fresh = (await start()).json.data.evaluation;
        expect(fresh.scorecard.version).toBe(2);
        expect(fresh.tasks.find(t => t.code === 'T1').steps).toHaveLength(4);
    });

    test('a scorecard referring to a task missing from the file and library is rejected', async () => {
        await expect(svc.importBundle(syntheticBundle({ extraScorecardTask: 'T9' }), { sourceFilename: 'x.json', uploadedBy: 3 }))
            .rejects.toMatchObject({ status: 422 });
    });

    test('admin upload over HTTP validates the file', async () => {
        const form = new FormData();
        form.append('file', new Blob(['{"tasks": [{"code": "T1"}]}'], { type: 'application/json' }), 'bad.json');
        const res = await call('POST', '/api/admin/scorecards/upload', { auth: ADMIN(), form });
        expect(res.status).toBe(422);
        expect(res.json.errors.length).toBeGreaterThan(0);
    });
});

describe('company settings and tasks (owner only)', () => {
    const settings = (body, auth = OWNER_A()) => call('PUT', '/api/scorecards/residential-service-tech/settings', { auth, body });
    const taskBody = { name: 'Our own check', steps: [{ text: 'do the thing', twoLooksLike: 'done well', safety: false }] };

    test('teammates cannot change settings or tasks', async () => {
        expect((await settings({ disabledTaskCodes: [], customTaskIds: [] }, TEAMMATE_A())).status).toBe(403);
        expect((await call('POST', '/api/scorecard-tasks', { auth: TEAMMATE_A(), body: taskBody })).status).toBe(403);
    });

    test('turning a task off removes it from new evaluations only', async () => {
        const before = (await start()).json.data.evaluation;
        const res = await settings({ disabledTaskCodes: ['T2'], customTaskIds: [] });
        expect(res.status).toBe(200);
        expect(res.json.data.scorecard.tasks.find(t => t.code === 'T2').enabled).toBe(false);
        expect((await start()).json.data.evaluation.tasks.map(t => t.code)).toEqual(['T1']);
        const old = (await call('GET', `/api/evaluations/${before.id}`, { auth: OWNER_A() })).json.data.evaluation;
        expect(old.tasks.map(t => t.code)).toEqual(['T1', 'T2']);
    });

    test('settings are per company', async () => {
        await settings({ disabledTaskCodes: ['T2'], customTaskIds: [] });
        const b = await call('GET', '/api/scorecards/residential-service-tech', { auth: OWNER_B() });
        expect(b.json.data.scorecard.tasks.every(t => t.enabled)).toBe(true);
    });

    test('only tasks on the scorecard can be turned off', async () => {
        expect((await settings({ disabledTaskCodes: ['C1'], customTaskIds: [] })).status).toBe(400);
    });

    test('owners add their own tasks to a scorecard, and other companies cannot use them', async () => {
        const created = await call('POST', '/api/scorecard-tasks', { auth: OWNER_A(), body: taskBody });
        expect(created.status).toBe(201);
        const task = created.json.data.task;
        expect(task.code).toMatch(/^CO\d+$/);
        expect((await settings({ disabledTaskCodes: [], customTaskIds: [task.id] })).status).toBe(200);
        expect((await start()).json.data.evaluation.tasks.map(t => t.code)).toEqual(['T1', 'T2', task.code]);
        // Company B can't attach, edit or delete it.
        const bSettings = await call('PUT', '/api/scorecards/residential-service-tech/settings', { auth: OWNER_B(), body: { disabledTaskCodes: [], customTaskIds: [task.id] } });
        expect(bSettings.status).toBe(400);
        expect((await call('PUT', `/api/scorecard-tasks/${task.id}`, { auth: OWNER_B(), body: taskBody })).status).toBe(404);
        expect((await call('DELETE', `/api/scorecard-tasks/${task.id}`, { auth: OWNER_B() })).status).toBe(404);
    });

    test('shared library tasks cannot be edited or deleted by a company', async () => {
        const shared = state.tasks.find(t => t.code === 'T1');
        expect((await call('PUT', `/api/scorecard-tasks/${shared.id}`, { auth: OWNER_A(), body: taskBody })).status).toBe(404);
        expect((await call('DELETE', `/api/scorecard-tasks/${shared.id}`, { auth: OWNER_A() })).status).toBe(404);
        expect(state.tasks.find(t => t.code === 'T1')).toBeTruthy();
    });

    test('deleting an own task removes it from settings', async () => {
        const task = (await call('POST', '/api/scorecard-tasks', { auth: OWNER_A(), body: taskBody })).json.data.task;
        await settings({ disabledTaskCodes: [], customTaskIds: [task.id] });
        expect((await call('DELETE', `/api/scorecard-tasks/${task.id}`, { auth: OWNER_A() })).status).toBe(200);
        expect(state.settings[0].custom_task_ids).toEqual([]);
    });
});

describe('owner comparison', () => {
    test('shows each candidate\'s latest submitted evaluation with a count, best first', async () => {
        const first = await scoredEvaluation({ pipelineId: 100, step: 1 });
        await patch(first, { step: { key: 'T1.1', score: 1, note: 'slow but careful' } });
        await call('POST', `/api/evaluations/${first}/submit`, { auth: OWNER_A() });
        const second = await scoredEvaluation({ pipelineId: 100, step: 2 });
        await call('POST', `/api/evaluations/${second}/submit`, { auth: OWNER_A() });
        const bob = await scoredEvaluation({ pipelineId: 101, step: 1 });
        await call('POST', `/api/evaluations/${bob}/submit`, { auth: OWNER_A() });
        await start(OWNER_A(), 101); // a draft: not shown

        const res = await call('GET', '/api/evaluations/compare?jobId=10', { auth: TEAMMATE_A() });
        expect(res.status).toBe(200);
        const { candidates } = res.json.data;
        expect(candidates.map(c => c.candidateName)).toEqual(['Alice', 'Bob']);
        expect(candidates[0].id).toBe(second);
        expect(candidates[0].evaluationCount).toBe(2);
        expect(candidates[0].otherEvaluations.map(o => o.id)).toEqual([first]);
        expect(candidates[1].evaluationCount).toBe(1);
        expect(candidates[0].result.categories.map(c => c.key)).toEqual(['communication', 'cleanliness']);
    });

    test('includes the scorer\'s notes', async () => {
        const id = await scoredEvaluation();
        await patch(id, { item: { key: 'cleanliness.1', score: 2, note: 'used drop cloths' } });
        await call('POST', `/api/evaluations/${id}/submit`, { auth: OWNER_A() });
        const { candidates } = (await call('GET', '/api/evaluations/compare?jobId=10', { auth: OWNER_A() })).json.data;
        expect(candidates[0].notes).toEqual([{ about: 'Cleanliness · placeholder item c', note: 'used drop cloths' }]);
    });

    test('nothing about pay is returned', async () => {
        const id = await scoredEvaluation();
        await call('POST', `/api/evaluations/${id}/submit`, { auth: OWNER_A() });
        const raw = JSON.stringify((await call('GET', '/api/evaluations/compare?jobId=10', { auth: OWNER_A() })).json);
        expect(raw).not.toMatch(/pay|wage|salary/i);
    });
});
