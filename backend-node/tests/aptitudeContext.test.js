/**
 * The aptitude kit takes its work habits score from the application's latest
 * completed apprentice character interview. This checks the lookup is scoped to
 * the same application and account, and that the result uses it.
 */
jest.mock('../config/database', () => ({ query: jest.fn(), getClient: jest.fn() }));

const db = require('../config/database');
const kits = require('../services/interviewKits/kitService');
const { syntheticContent } = require('./helpers/kitFixtures');

const aptitudeKit = {
    slug: 'apprentice-aptitude', title: 'Apprentice Aptitude Assessment', kit_type: 'aptitude',
    roles: ['Apprentice'], levels: [], version_id: 20, version: 1, status: 'draft_under_review',
    content: syntheticContent('apprentice-aptitude'),
};
const interviewRow = {
    id: 1, candidate_pipeline_id: 100, account_id: 1, kit_version_id: 20, kind: 'kit', mode: 'in_person',
    status: 'in_progress', answers: {}, current_index: -1, result: null,
};

function fakeDb({ character }) {
    const calls = [];
    db.query.mockImplementation(async (sql, params = []) => {
        const s = sql.replace(/\s+/g, ' ');
        calls.push({ s, params });
        if (/SELECT \* FROM interviews WHERE id = \$1 AND account_id = \$2/.test(s)) return { rows: [interviewRow] };
        if (/WHERE v\.id = \$1/.test(s)) return { rows: [aptitudeKit] };
        if (/i\.status = 'completed' AND k\.slug = \$3/.test(s)) return { rows: character ? [character] : [] };
        throw new Error(`unexpected query: ${s}`);
    });
    return calls;
}

describe('aptitude work habits from the character interview', () => {
    beforeEach(() => db.query.mockReset());

    test('uses the completed character result, scoped to the same application and account', async () => {
        const calls = fakeDb({
            character: { id: 9, title: 'Apprentice & Green Candidate Character Assessment', result: { outcome: { key: 'strong', label: 'Strong. Move on.' } } },
        });
        const iv = await kits.getInterview(1, 1);
        expect(iv.result.aptitude.habits).toMatchObject({ score: 8, source: 'character', interviewId: 9 });
        const lookup = calls.find(c => /k\.slug = \$3/.test(c.s));
        expect(lookup.params).toEqual([100, 1, 'apprentice-character']);
        expect(lookup.s).toMatch(/i\.candidate_pipeline_id = \$1 AND i\.account_id = \$2/);
    });

    test('falls back to Section 4 when there is no completed character interview', async () => {
        fakeDb({ character: null });
        const iv = await kits.getInterview(1, 1);
        expect(iv.result.aptitude.habits.source).toBe('section');
    });
});
