/**
 * Access control for interview kits and interviews, exercised over HTTP with
 * the real authenticateToken middleware and an in-memory stand-in for the
 * database. Covers: authentication required, tenant isolation (including no
 * admin bypass), teammates sharing their account, completed interviews being
 * locked, and earlier interviews never being overwritten.
 */
process.env.JWT_SECRET = 'test-secret';

const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const jwt = require('jsonwebtoken');
const { syntheticContent } = require('./helpers/kitFixtures');

// ─── in-memory database ──────────────────────────────────────────────────────

const state = {};
function resetState() {
    state.users = {
        1: { id: 1, email: 'owner-a@example.com', role: 'user' },
        5: { id: 5, email: 'teammate-a@example.com', role: 'user', parent_user_id: 1 },
        2: { id: 2, email: 'owner-b@example.com', role: 'user' },
        3: { id: 3, email: 'admin@example.com', role: 'admin' },
    };
    state.pipelines = { 100: 1, 200: 2 }; // pipeline id -> owning account
    state.kit = { slug: 'pm-technician', title: 'PM Technician Question Bank', kit_type: 'technical', roles: [], levels: [], version_id: 10, version: 1, status: 'draft_under_review', content: syntheticContent('pm-technician') };
    state.interviews = [];
    state.nextId = 1;
}

const fakeQuery = async (sql, params = []) => {
    const s = sql.replace(/\s+/g, ' ');
    if (/SELECT \* FROM users WHERE id = \$1/.test(s)) return { rows: state.users[params[0]] ? [state.users[params[0]]] : [] };
    if (/FROM candidate_pipeline cp JOIN jobs j/.test(s)) {
        const owner = state.pipelines[params[0]];
        return { rows: owner ? [{ user_id: owner }] : [] };
    }
    if (/WHERE k\.slug = \$1 AND/.test(s)) return { rows: params[0] === state.kit.slug ? [state.kit] : [] };
    if (/WHERE v\.id = \$1/.test(s)) return { rows: params[0] === state.kit.version_id ? [state.kit] : [] };
    if (/ORDER BY k\.title/.test(s)) {
        return { rows: [{ ...state.kit, summary: null, version_date: null, question_count: 37 }] };
    }
    if (/^INSERT INTO interviews/.test(s.trim())) {
        const [pipelineId, accountId, versionId, userId, email, mode] = params;
        const row = { id: state.nextId++, candidate_pipeline_id: pipelineId, account_id: accountId, kit_version_id: versionId, interviewer_user_id: userId, interviewer_email: email, mode, status: 'in_progress', answers: {}, current_index: -1, result: null, started_at: new Date().toISOString(), updated_at: new Date().toISOString(), completed_at: null };
        state.interviews.push(row);
        return { rows: [row] };
    }
    if (/SELECT \* FROM interviews WHERE candidate_pipeline_id = \$1 AND account_id = \$2/.test(s)) {
        return { rows: state.interviews.filter(i => i.candidate_pipeline_id === params[0] && i.account_id === params[1]) };
    }
    if (/SELECT \* FROM interviews WHERE id = \$1 AND account_id = \$2/.test(s)) {
        return { rows: state.interviews.filter(i => i.id === params[0] && i.account_id === params[1]) };
    }
    if (/UPDATE interviews SET answers/.test(s)) {
        const [answers, index, id, accountId] = params;
        const row = state.interviews.find(i => i.id === id && i.account_id === accountId && i.status === 'in_progress');
        if (!row) return { rows: [] };
        Object.assign(row, { answers: JSON.parse(answers), current_index: index });
        return { rows: [row] };
    }
    if (/UPDATE interviews SET status = 'completed'/.test(s)) {
        const [result, id, accountId] = params;
        const row = state.interviews.find(i => i.id === id && i.account_id === accountId && i.status === 'in_progress');
        if (!row) return { rows: [] };
        Object.assign(row, { status: 'completed', result: JSON.parse(result), completed_at: new Date().toISOString() });
        return { rows: [row] };
    }
    if (/^DELETE FROM interviews/.test(s.trim())) {
        const before = state.interviews.length;
        state.interviews = state.interviews.filter(i => !(i.id === params[0] && i.account_id === params[1] && i.status === 'in_progress'));
        return { rows: [], rowCount: before - state.interviews.length };
    }
    throw new Error(`Unexpected query in test: ${s.slice(0, 120)}`);
};

jest.mock('../config/database', () => ({ query: (...a) => fakeQuery(...a), getClient: jest.fn(), pool: {} }));
jest.mock('../services/gmailService', () => ({}));
jest.mock('../config/logoS3', () => ({}));
jest.mock('../services/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }));

const { authenticateToken, requireAdmin } = require('../routes/authRoutes');
const { kitRouter, interviewRouter, adminRouter } = require('../routes/interviewKitRoutes');

// ─── server ──────────────────────────────────────────────────────────────────

let server;
let base;
beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/interview-kits', authenticateToken, kitRouter);
    app.use('/api/interviews', authenticateToken, interviewRouter);
    app.use('/api/admin/interview-kits', authenticateToken, requireAdmin, adminRouter);
    server = http.createServer(app);
    await new Promise(r => server.listen(0, r));
    base = `http://127.0.0.1:${server.address().port}`;
});
afterAll(() => new Promise(r => server.close(r)));
beforeEach(resetState);

const token = (userId, accountId, role = 'user') =>
    jwt.sign({ userId, email: state.users[userId]?.email, role, accountId }, process.env.JWT_SECRET);
const OWNER_A = () => token(1, 1);
const TEAMMATE_A = () => token(5, 1);
const OWNER_B = () => token(2, 2);
const ADMIN = () => token(3, 3, 'admin');

async function call(method, url, { auth, body } = {}) {
    const res = await fetch(base + url, {
        method,
        headers: { 'content-type': 'application/json', ...(auth && { authorization: `Bearer ${auth}` }) },
        body: body ? JSON.stringify(body) : undefined,
    });
    let json = null;
    try { json = await res.json(); } catch { /* empty */ }
    return { status: res.status, json, headers: res.headers };
}

const startInterview = (auth = OWNER_A(), pipelineId = 100) =>
    call('POST', '/api/interviews', { auth, body: { pipelineId, kitId: 'pm-technician', mode: 'phone' } });

// ─── tests ───────────────────────────────────────────────────────────────────

describe('authentication is required everywhere', () => {
    test.each([
        ['GET', '/api/interview-kits'],
        ['GET', '/api/interview-kits/pm-technician'],
        ['GET', '/api/interviews?pipelineId=100'],
        ['POST', '/api/interviews'],
        ['GET', '/api/interviews/1'],
        ['PATCH', '/api/interviews/1'],
        ['GET', '/api/admin/interview-kits'],
    ])('%s %s without a token is 401', async (method, url) => {
        expect((await call(method, url)).status).toBe(401);
    });

    test('a forged token is 401', async () => {
        const forged = jwt.sign({ userId: 1, accountId: 1, role: 'user' }, 'wrong-secret');
        expect((await call('GET', '/api/interview-kits', { auth: forged })).status).toBe(401);
    });
});

describe('kit content', () => {
    test('authenticated users get answer keys, with caching disabled', async () => {
        const r = await call('GET', '/api/interview-kits/pm-technician', { auth: OWNER_B() });
        expect(r.status).toBe(200);
        expect(r.json.data.kit.sections[0].questions[0].answerKey).toBeTruthy();
        expect(r.json.data.kit.versionId).toBeUndefined();
        expect(r.headers.get('cache-control')).toBe('private, no-store');
    });

    test('the list never includes question content', async () => {
        const r = await call('GET', '/api/interview-kits', { auth: OWNER_A() });
        expect(r.status).toBe(200);
        expect(JSON.stringify(r.json)).not.toMatch(/answerKey|placeholder/);
    });
});

describe('tenant isolation', () => {
    test('an account can start an interview on its own application', async () => {
        const r = await startInterview();
        expect(r.status).toBe(201);
        expect(r.json.data.interview.kit.version).toBe(1);
        expect(state.interviews[0]).toMatchObject({ account_id: 1, interviewer_user_id: 1 });
    });

    test('another account cannot start an interview on that application', async () => {
        expect((await startInterview(OWNER_B(), 100)).status).toBe(404);
        expect(state.interviews).toHaveLength(0);
    });

    test('another account cannot read, list, save to, complete or discard it', async () => {
        const id = (await startInterview()).json.data.interview.id;
        const B = OWNER_B();
        expect((await call('GET', `/api/interviews/${id}`, { auth: B })).status).toBe(404);
        expect((await call('GET', '/api/interviews?pipelineId=100', { auth: B })).status).toBe(404);
        expect((await call('PATCH', `/api/interviews/${id}`, { auth: B, body: { key: 'L1.Q1', answer: { score: 2 } } })).status).toBe(404);
        expect((await call('POST', `/api/interviews/${id}/complete`, { auth: B })).status).toBe(404);
        expect((await call('DELETE', `/api/interviews/${id}`, { auth: B })).status).toBe(404);
        expect(state.interviews[0].answers).toEqual({});
        expect(state.interviews[0].status).toBe('in_progress');
    });

    test('platform admins get no bypass into another company\'s interviews', async () => {
        const id = (await startInterview()).json.data.interview.id;
        expect((await call('GET', `/api/interviews/${id}`, { auth: ADMIN() })).status).toBe(404);
        expect((await call('GET', '/api/interviews?pipelineId=100', { auth: ADMIN() })).status).toBe(404);
    });

    test('a teammate on the same account can continue the interview', async () => {
        const id = (await startInterview()).json.data.interview.id;
        const r = await call('PATCH', `/api/interviews/${id}`, { auth: TEAMMATE_A(), body: { key: 'L1.Q1', answer: { score: 2, notes: 'n' } } });
        expect(r.status).toBe(200);
        expect(state.interviews[0].answers['L1.Q1']).toEqual({ score: 2, notes: 'n', redFlag: false });
    });

    test('admin upload routes reject non-admins', async () => {
        expect((await call('GET', '/api/admin/interview-kits', { auth: OWNER_A() })).status).toBe(403);
    });
});

describe('autosave validation', () => {
    let id;
    beforeEach(async () => { id = (await startInterview()).json.data.interview.id; });

    test.each([
        [{ key: 'NOPE.Q1', answer: { score: 1 } }, 400],
        [{ key: 'L1.Q1', answer: { score: 3 } }, 400],
        [{ key: 'BS.Q1', answer: { score: 1 } }, 400],
        [{ key: 'L1.Q1', answer: { notes: 42 } }, 400],
        [{ key: 'BS.Q1', answer: { redFlag: true } }, 200],
        [{ currentIndex: 4 }, 200],
    ])('%j -> %i', async (body, status) => {
        expect((await call('PATCH', `/api/interviews/${id}`, { auth: OWNER_A(), body })).status).toBe(status);
    });
});

describe('completion and history', () => {
    test('completing stores the scored result and locks the interview', async () => {
        const id = (await startInterview()).json.data.interview.id;
        const done = await call('POST', `/api/interviews/${id}/complete`, { auth: OWNER_A() });
        expect(done.status).toBe(200);
        expect(done.json.data.interview.result.recommendationOnly).toBe(true);
        expect(state.interviews[0].result).toBeTruthy();

        expect((await call('PATCH', `/api/interviews/${id}`, { auth: OWNER_A(), body: { key: 'L1.Q1', answer: { score: 2 } } })).status).toBe(409);
        expect((await call('POST', `/api/interviews/${id}/complete`, { auth: OWNER_A() })).status).toBe(409);
        expect((await call('DELETE', `/api/interviews/${id}`, { auth: OWNER_A() })).status).toBe(404);
    });

    test('a second interview is a new record; the first is untouched', async () => {
        const first = (await startInterview()).json.data.interview.id;
        await call('PATCH', `/api/interviews/${first}`, { auth: OWNER_A(), body: { key: 'L1.Q1', answer: { score: 2 } } });
        await call('POST', `/api/interviews/${first}/complete`, { auth: OWNER_A() });
        const second = (await startInterview()).json.data.interview.id;
        expect(second).not.toBe(first);

        const list = await call('GET', '/api/interviews?pipelineId=100', { auth: OWNER_A() });
        expect(list.json.data.interviews).toHaveLength(2);
        expect(state.interviews.find(i => i.id === first).answers['L1.Q1'].score).toBe(2);
    });

    test('an in-progress interview can be discarded', async () => {
        const id = (await startInterview()).json.data.interview.id;
        expect((await call('DELETE', `/api/interviews/${id}`, { auth: OWNER_A() })).status).toBe(200);
        expect(state.interviews).toHaveLength(0);
    });
});

describe('candidate-facing code never touches interview kits', () => {
    const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

    test.each(['routes/applyRoutes.js', 'routes/jobFeedRoutes.js', 'routes/indeedRoutes.js'])('%s has no kit or interview references', (f) => {
        expect(read(f)).not.toMatch(/interviewKits|interview_kit|interviews\b|answerKey/);
    });

    test('server.js mounts every kit route behind authenticateToken', () => {
        const src = read('server.js');
        expect(src).toMatch(/app\.use\('\/api\/interview-kits', authenticateToken, /);
        expect(src).toMatch(/app\.use\('\/api\/interviews', authenticateToken, /);
        expect(src).toMatch(/app\.use\('\/api\/admin\/interview-kits', authenticateToken, requireAdmin, /);
    });
});
