const { validateBundle, validateTask } = require('../services/rideAlong/content');
const { syntheticBundle } = require('./helpers/rideAlongFixtures');

const clone = (x) => JSON.parse(JSON.stringify(x));

describe('validateBundle', () => {
    test('accepts a well-formed bundle and assigns step and item keys by position', () => {
        const r = validateBundle(syntheticBundle());
        expect(r.errors).toEqual([]);
        expect(r.tasks.map(t => t.code)).toEqual(['T1', 'T2', 'C1']);
        expect(r.tasks[0].content.steps.map(s => s.key)).toEqual(['1', '2', '3']);
        expect(r.tasks[0].content.steps[1].safety).toBe(true);
        expect(r.scorecards[0].config.categories[0].items.map(i => i.key)).toEqual(['1', '2']);
        expect(r.externalCodes).toEqual([]);
    });

    test('a task shared by two scorecards is defined once (no duplicates)', () => {
        const r = validateBundle(syntheticBundle());
        expect(r.tasks.filter(t => t.code === 'T2')).toHaveLength(1);
        expect(r.scorecards.filter(s => s.tasks.includes('T2'))).toHaveLength(2);
    });

    test('bands are stored highest first, with weights, cap and flag type from the file', () => {
        const { config } = validateBundle(syntheticBundle()).scorecards[0];
        expect(config.bands.map(b => b.min)).toEqual([80, 65, 50, 0]);
        expect(config.capValue).toBe(64);
        expect(config.safetyFlagType).toBe('FAIL');
        expect(config.partWeights).toEqual({ part1: 0.5, part2: 0.5 });
        expect(config.categories.map(c => c.weight)).toEqual([0.6, 0.4]);
    });

    test('scorecard tasks not in the file are reported for a library lookup', () => {
        const r = validateBundle(syntheticBundle({ extraScorecardTask: 'T9' }));
        expect(r.errors).toEqual([]);
        expect(r.externalCodes).toEqual(['T9']);
    });

    test('a task defined twice is an error', () => {
        const b = syntheticBundle();
        b.tasks.push(clone(b.tasks[0]));
        expect(validateBundle(b).errors).toContain('task T1 is defined twice');
    });

    test.each([
        ['bad flag type', b => { b.scorecards[0].redFlags[0].type = 'WARN'; }, /type must be FAIL or CAP/],
        ['no band at 0', b => { b.scorecards[0].bands.pop(); }, /band starting at 0/],
        ['duplicate band min', b => { b.scorecards[0].bands[1].min = 80; }, /same min/],
        ['reserved fail band key', b => { b.scorecards[0].bands[0].key = 'fail'; }, /reserved/],
        ['zero weight', b => { b.scorecards[0].categories[0].weight = 0; }, /weight must be a positive number/],
        ['missing part weights', b => { delete b.scorecards[0].partWeights; }, /partWeights/],
        ['cap out of range', b => { b.scorecards[0].capValue = 120; }, /capValue/],
        ['missing safety flag type', b => { delete b.scorecards[0].safetyFlagType; }, /safetyFlagType/],
        ['duplicate category key', b => { b.scorecards[0].categories[1].key = 'communication'; }, /used twice/],
        ['category with no items', b => { b.scorecards[0].categories[0].items = []; }, /needs at least one item/],
        ['task listed twice on a scorecard', b => { b.scorecards[0].tasks.push('T1'); }, /lists task T1 twice/],
        ['task with no steps', b => { b.tasks[0].steps = []; }, /needs at least one step/],
        ['safety not boolean', b => { b.tasks[0].steps[0].safety = 'yes'; }, /safety must be true or false/],
        ['step without text', b => { b.tasks[0].steps[0].text = ' '; }, /text is required/],
        ['bad task code', b => { b.tasks[0].code = 'T 1'; }, /code must be/],
        ['bad slug', b => { b.scorecards[0].slug = 'Has Spaces'; }, /slug/],
    ])('rejects %s', (_, mutate, message) => {
        const b = syntheticBundle();
        mutate(b);
        const r = validateBundle(b);
        expect(r.errors.some(e => message.test(e))).toBe(true);
    });

    test('collects every error at once', () => {
        const b = syntheticBundle();
        b.scorecards[0].capValue = -1;
        b.scorecards[0].redFlags[0].type = 'X';
        b.tasks[1].name = '';
        expect(validateBundle(b).errors.length).toBeGreaterThanOrEqual(3);
    });

    test('rejects non-objects and empty files', () => {
        expect(validateBundle([]).errors.length).toBe(1);
        expect(validateBundle({}).errors).toContain('The file has no tasks and no scorecards');
    });
});

describe('validateTask (company tasks)', () => {
    test('normalises a task', () => {
        const errors = [];
        const t = validateTask({ name: ' Mine ', steps: [{ text: 'do it', safety: true }] }, 'Task', errors);
        expect(errors).toEqual([]);
        expect(t).toEqual({ name: 'Mine', level: null, time: null, equipment: [], roleTags: [], steps: [{ key: '1', text: 'do it', twoLooksLike: null, safety: true }] });
    });
});
