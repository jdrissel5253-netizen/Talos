/**
 * Custom interviews: the company question bank, saved question sets, and
 * interviews built from hand-picked questions. Exercised over HTTP with the
 * real authenticateToken middleware and an in-memory stand-in for the database.
 */
process.env.JWT_SECRET = 'test-secret';

const http = require('http');
const express = require('express');
const jwt = require('jsonwebtoken');
const { syntheticContent } = require('./helpers/kitFixtures');
const { scoreCustom } = require('../services/interviewKits/scoring');

// ─── in-memory database ──────────────────────────────────────────────────────

const state = {};
function resetState() {
    state.users = {
        1: { id: 1, email: 'owner-a@example.com', role: 'user' },
        5: { id: 5, email: 'teammate-a@example.com', role: 'user', parent_user_id: 1 },
        2: { id: 2, email: 'owner-b@example.com', role: 'user' },
    };
    state.pipelines = { 100: 1, 200: 2 };
    state.kit = { slug: 'pm-technician', title: 'PM Technician Question Bank', kit_type: 'technical', roles: [], levels: [], version_id: 10, version: 1, status: 'draft_under_review', content: syntheticContent('pm-technician') };
    state.questions = [];
    state.sets = [];
    state.interviews = [];
    state.nextId = 1;
}
const now = () => new Date().toISOString();

const fakeQuery = async (sql, params = []) => {
    const s = sql.replace(/\s+/g, ' ').trim();
    if (/SELECT \* FROM users WHERE id = \$1/.test(s)) return { rows: state.users[params[0]] ? [state.users[params[0]]] : [] };
    if (/FROM candidate_pipeline cp JOIN jobs j/.test(s)) {
        const owner = state.pipelines[params[0]];
        return { rows: owner ? [{ user_id: owner }] : [] };
    }
    if (/WHERE k\.slug = \$1 AND/.test(s)) return { rows: params[0] === state.kit.slug ? [state.kit] : [] };

    // company_questions
    if (/SELECT COUNT\(\*\)::int AS n FROM company_questions/.test(s)) return { rows: [{ n: state.questions.filter(q => q.account_id === params[0]).length }] };
    if (/^INSERT INTO company_questions/.test(s)) {
        const [account_id, prompt, good_answer, created_by] = params;
        const row = { id: state.nextId++, account_id, prompt, good_answer, created_by, created_at: now(), updated_at: now() };
        state.questions.push(row);
        return { rows: [row] };
    }
    if (/FROM company_questions WHERE account_id = \$1 ORDER BY/.test(s)) return { rows: state.questions.filter(q => q.account_id === params[0]) };
    if (/FROM company_questions WHERE account_id = \$1 AND id = ANY/.test(s)) return { rows: state.questions.filter(q => q.account_id === params[0] && params[1].includes(q.id)) };
    if (/^UPDATE company_questions/.test(s)) {
        const [prompt, good_answer, id, accountId] = params;
        const row = state.questions.find(q => q.id === id && q.account_id === accountId);
        if (!row) return { rows: [] };
        Object.assign(row, { prompt, good_answer });
        return { rows: [row] };
    }
    if (/^DELETE FROM company_questions/.test(s)) {
        const before = state.questions.length;
        state.questions = state.questions.filter(q => !(q.id === params[0] && q.account_id === params[1]));
        return { rows: [], rowCount: before - state.questions.length };
    }

    // interview_question_sets
    if (/SELECT COUNT\(\*\)::int AS n FROM interview_question_sets/.test(s)) return { rows: [{ n: state.sets.filter(x => x.account_id === params[0]).length }] };
    if (/^INSERT INTO interview_question_sets/.test(s)) {
        const [account_id, name, items] = params;
        const row = { id: state.nextId++, account_id, name, items: JSON.parse(items), updated_at: now() };
        state.sets.push(row);
        return { rows: [row] };
    }
    if (/FROM interview_question_sets WHERE id = \$1 AND account_id = \$2/.test(s)) return { rows: state.sets.filter(x => x.id === params[0] && x.account_id === params[1]) };
    if (/FROM interview_question_sets WHERE account_id = \$1/.test(s)) {
        return { rows: state.sets.filter(x => x.account_id === params[0]).map(x => ({ ...x, item_count: x.items.length })) };
    }
    if (/^UPDATE interview_question_sets/.test(s)) {
        const [name, items, id, accountId] = params;
        const row = state.sets.find(x => x.id === id && x.account_id === accountId);
        if (!row) return { rowCount: 0, rows: [] };
        Object.assign(row, { name, items: JSON.parse(items) });
        return { rowCount: 1, rows: [] };
    }
    if (/^DELETE FROM interview_question_sets/.test(s)) {
        const before = state.sets.length;
        state.sets = state.sets.filter(x => !(x.id === params[0] && x.account_id === params[1]));
        return { rows: [], rowCount: before - state.sets.length };
    }

    // interviews
    if (/^INSERT INTO interviews .* 'custom'/.test(s)) {
        const [pipelineId, accountId, userId, email, mode, title, questions] = params;
        const row = { id: state.nextId++, kind: 'custom', title, questions: JSON.parse(questions), candidate_pipeline_id: pipelineId, account_id: accountId, kit_version_id: null, interviewer_user_id: userId, interviewer_email: email, mode, status: 'in_progress', answers: {}, current_index: -1, result: null, started_at: now(), updated_at: now(), completed_at: null };
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
        Object.assign(row, { status: 'completed', result: JSON.parse(result), completed_at: now() });
        return { rows: [row] };
    }
    throw new Error(`Unexpected query in test: ${s.slice(0, 140)}`);
};

jest.mock('../config/database', () => ({ query: (...a) => fakeQuery(...a), getClient: jest.fn(), pool: {} }));
jest.mock('../services/gmailService', () => ({}));
jest.mock('../config/logoS3', () => ({}));
jest.mock('../services/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }));

const { authenticateToken } = require('../routes/authRoutes');
const { interviewRouter, questionRouter, setRouter } = require('../routes/interviewKitRoutes');

let server;
let base;
beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/interviews', authenticateToken, interviewRouter);
    app.use('/api/interview-questions', authenticateToken, questionRouter);
    app.use('/api/interview-sets', authenticateToken, setRouter);
    server = http.createServer(app);
    await new Promise(r => server.listen(0, r));
    base = `http://127.0.0.1:${server.address().port}`;
});
afterAll(() => new Promise(r => server.close(r)));
beforeEach(resetState);

const token = (userId, accountId) => jwt.sign({ userId, email: state.users[userId]?.email, role: 'user', accountId }, process.env.JWT_SECRET);
const OWNER_A = () => token(1, 1);
const TEAMMATE_A = () => token(5, 1);
const OWNER_B = () => token(2, 2);

async function call(method, url, { auth, body } = {}) {
    const res = await fetch(base + url, {
        method,
        headers: { 'content-type': 'application/json', ...(auth && { authorization: `Bearer ${auth}` }) },
        body: body ? JSON.stringify(body) : undefined,
    });
    let json = null;
    try { json = await res.json(); } catch { /* empty */ }
    return { status: res.status, json };
}

const addQuestion = (auth, prompt = 'Why HVAC?', goodAnswer) =>
    call('POST', '/api/interview-questions', { auth, body: { prompt, goodAnswer } });

const kitRef = (key) => ({ source: 'kit', kitId: 'pm-technician', key });

// ─── tests ───────────────────────────────────────────────────────────────────

describe('authentication', () => {
    test.each([
        ['GET', '/api/interview-questions'],
        ['POST', '/api/interview-questions'],
        ['GET', '/api/interview-sets'],
        ['POST', '/api/interview-sets'],
    ])('%s %s without a token is 401', async (method, url) => {
        expect((await call(method, url)).status).toBe(401);
    });
});

describe('company question bank', () => {
    test('teammates share the bank; other companies cannot see or change it', async () => {
        const created = await addQuestion(OWNER_A(), '  Tell me about a tough call.  ', 'Owns the mistake');
        expect(created.status).toBe(201);
        expect(created.json.data.question).toMatchObject({ prompt: 'Tell me about a tough call.', goodAnswer: 'Owns the mistake' });
        const id = created.json.data.question.id;

        expect((await call('GET', '/api/interview-questions', { auth: TEAMMATE_A() })).json.data.questions).toHaveLength(1);
        expect((await call('GET', '/api/interview-questions', { auth: OWNER_B() })).json.data.questions).toHaveLength(0);
        expect((await call('PUT', `/api/interview-questions/${id}`, { auth: OWNER_B(), body: { prompt: 'x' } })).status).toBe(404);
        expect((await call('DELETE', `/api/interview-questions/${id}`, { auth: OWNER_B() })).status).toBe(404);

        const edited = await call('PUT', `/api/interview-questions/${id}`, { auth: TEAMMATE_A(), body: { prompt: 'Edited' } });
        expect(edited.json.data.question).toMatchObject({ prompt: 'Edited', goodAnswer: null });
    });

    test('rejects an empty or over-long question', async () => {
        expect((await addQuestion(OWNER_A(), '   ')).status).toBe(400);
        expect((await addQuestion(OWNER_A(), 'x'.repeat(1001))).status).toBe(400);
    });
});

describe('saved question sets', () => {
    test('saves kit and company questions in order, de-duplicated, and resolves them for display', async () => {
        const q = (await addQuestion(OWNER_A(), 'Our own question')).json.data.question;
        const res = await call('POST', '/api/interview-sets', {
            auth: OWNER_A(),
            body: { name: 'Phone screen', items: [kitRef('L2.Q1'), { source: 'company', id: q.id }, kitRef('L2.Q1')] },
        });
        expect(res.status).toBe(201);
        const set = res.json.data.set;
        expect(set.items).toHaveLength(2);
        expect(set.items[0]).toMatchObject({ source: 'kit', key: 'L2.Q1', prompt: 'placeholder prompt L2.Q1' });
        expect(set.items[0].sourceLabel).toMatch(/^PM Technician Question Bank · /);
        expect(set.items[1]).toMatchObject({ source: 'company', id: q.id, prompt: 'Our own question', sourceLabel: 'Your company questions' });
        // Display form carries no answer keys.
        expect(JSON.stringify(set)).not.toMatch(/placeholder key/);

        expect((await call('GET', `/api/interview-sets/${set.id}`, { auth: OWNER_B() })).status).toBe(404);
        expect((await call('GET', '/api/interview-sets', { auth: TEAMMATE_A() })).json.data.sets[0]).toMatchObject({ name: 'Phone screen', itemCount: 2 });
    });

    test('a deleted question shows as missing in the set', async () => {
        const q = (await addQuestion(OWNER_A())).json.data.question;
        const set = (await call('POST', '/api/interview-sets', { auth: OWNER_A(), body: { name: 'S', items: [{ source: 'company', id: q.id }] } })).json.data.set;
        await call('DELETE', `/api/interview-questions/${q.id}`, { auth: OWNER_A() });
        const again = (await call('GET', `/api/interview-sets/${set.id}`, { auth: OWNER_A() })).json.data.set;
        expect(again.items[0]).toMatchObject({ missing: true });
    });

    test('rejects bad input', async () => {
        expect((await call('POST', '/api/interview-sets', { auth: OWNER_A(), body: { name: '', items: [kitRef('L1.Q1')] } })).status).toBe(400);
        expect((await call('POST', '/api/interview-sets', { auth: OWNER_A(), body: { name: 'S', items: [] } })).status).toBe(400);
        expect((await call('POST', '/api/interview-sets', { auth: OWNER_A(), body: { name: 'S', items: [{ source: 'evil' }] } })).status).toBe(400);
        const tooMany = Array.from({ length: 101 }, (_, i) => ({ source: 'company', id: i + 1 }));
        expect((await call('POST', '/api/interview-sets', { auth: OWNER_A(), body: { name: 'S', items: tooMany } })).status).toBe(400);
    });
});

describe('custom interviews', () => {
    async function startCustom(auth = OWNER_A(), extra = {}) {
        const q = (await addQuestion(OWNER_A(), 'Our own question', 'Specific example')).json.data.question;
        const items = [kitRef('L1.Q1'), kitRef('L1.Q2'), kitRef('BS.Q1'), { source: 'company', id: q.id }];
        return { q, res: await call('POST', '/api/interviews', { auth, body: { pipelineId: 100, mode: 'phone', title: 'Phone screen', items, ...extra } }) };
    }

    test('snapshots the picked questions, grouped by source, with answer keys for the interviewer', async () => {
        const { res } = await startCustom();
        expect(res.status).toBe(201);
        const iv = res.json.data.interview;
        expect(iv.kind).toBe('custom');
        expect(iv.kit).toMatchObject({ custom: true, title: 'Phone screen' });
        const sections = iv.kit.sections;
        expect(sections.map(s => s.questions.length)).toEqual([2, 1, 1]);
        expect(sections[0].scoreOptions).toHaveLength(3);
        expect(sections[1].scoreOptions).toBeUndefined(); // BS-detector stays unscored
        expect(sections[2].title).toBe('Your company questions');
        expect(sections.flatMap(s => s.questions.map(q => q.key))).toEqual(['Q1', 'Q2', 'Q3', 'Q4']);
        expect(sections[0].questions[0].answerKey).toBe('placeholder key L1.Q1');
        expect(sections[2].questions[0].details[0].text).toBe('Specific example');
    });

    test('scores are optional and add up to a plain total', async () => {
        const { res } = await startCustom();
        const id = res.json.data.interview.id;
        const save = (key, answer) => call('PATCH', `/api/interviews/${id}`, { auth: TEAMMATE_A(), body: { key, answer } });
        expect((await save('Q1', { score: 2, notes: 'solid' })).status).toBe(200);
        expect((await save('Q3', { score: 2 })).status).toBe(400); // unscored question
        expect((await save('Q3', { redFlag: true })).status).toBe(200);
        expect((await save('Q4', { score: 1 })).status).toBe(200);
        expect((await save('Q9', { score: 1 })).status).toBe(400);

        const done = await call('POST', `/api/interviews/${id}/complete`, { auth: OWNER_A() });
        expect(done.status).toBe(200);
        const r = done.json.data.interview.result;
        expect(r.engine).toBe('custom');
        expect(r.outcome).toBeNull();
        expect(r.total).toEqual({ score: 3, max: 4, answered: 2, scorable: 3 });
        expect(r.redFlags.count).toBe(1);
        expect((await save('Q2', { score: 1 })).status).toBe(409);
    });

    test('editing or deleting a bank question never changes a started interview', async () => {
        const { q, res } = await startCustom();
        await call('PUT', `/api/interview-questions/${q.id}`, { auth: OWNER_A(), body: { prompt: 'Changed' } });
        await call('DELETE', `/api/interview-questions/${q.id}`, { auth: OWNER_A() });
        const iv = (await call('GET', `/api/interviews/${res.json.data.interview.id}`, { auth: OWNER_A() })).json.data.interview;
        expect(iv.kit.sections[2].questions[0].prompt).toBe('Our own question');
    });

    test('another company cannot use your bank questions or your candidates', async () => {
        const q = (await addQuestion(OWNER_A())).json.data.question;
        const useMine = await call('POST', '/api/interviews', { auth: OWNER_B(), body: { pipelineId: 200, mode: 'phone', items: [{ source: 'company', id: q.id }] } });
        expect(useMine.status).toBe(400);
        const theirCandidate = await call('POST', '/api/interviews', { auth: OWNER_B(), body: { pipelineId: 100, mode: 'phone', items: [kitRef('L1.Q1')] } });
        expect(theirCandidate.status).toBe(404);
    });

    test('rejects no questions, unknown kit questions and a bad mode', async () => {
        const post = (body) => call('POST', '/api/interviews', { auth: OWNER_A(), body: { pipelineId: 100, mode: 'phone', ...body } });
        expect((await post({ items: [] })).status).toBe(400);
        expect((await post({ items: [kitRef('L9.Q1')] })).status).toBe(400);
        expect((await post({ items: [kitRef('L1.Q1')], mode: 'video' })).status).toBe(400);
    });

    test('list on the application shows custom interviews', async () => {
        await startCustom();
        const list = (await call('GET', '/api/interviews?pipelineId=100', { auth: TEAMMATE_A() })).json.data.interviews;
        expect(list).toHaveLength(1);
        expect(list[0]).toMatchObject({ kind: 'custom', kit: { title: 'Phone screen', custom: true } });
        expect(list[0].kit.sections).toBeUndefined();
    });
});

describe('scoreCustom', () => {
    const content = {
        sections: [
            { key: 'S1', scoreOptions: [{ value: 0 }, { value: 1 }, { value: 2 }], questions: [{ key: 'Q1' }, { key: 'Q2' }] },
            { key: 'S2', questions: [{ key: 'Q3' }] },
        ],
    };
    test('nothing scored', () => {
        expect(scoreCustom(content, {}).total).toEqual({ score: 0, max: 0, answered: 0, scorable: 2 });
    });
    test('ignores invalid scores', () => {
        const r = scoreCustom(content, { Q1: { score: 5 }, Q2: { score: 2 } });
        expect(r.total).toEqual({ score: 2, max: 2, answered: 1, scorable: 2 });
        expect(r.allScored).toBe(false);
    });
});
