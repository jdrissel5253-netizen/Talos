const { scoreEvaluation, toPct } = require('../services/rideAlong/scoring');

// Synthetic scorecard: placeholder text only (real content never goes in the repo).
const task = (code, stepCount, safetyAt = []) => ({
    code,
    name: `Task ${code}`,
    steps: Array.from({ length: stepCount }, (_, i) => ({
        key: String(i + 1), text: `step ${i + 1}`, twoLooksLike: null, safety: safetyAt.includes(i + 1),
    })),
});

const CONFIG = {
    partWeights: { part1: 0.5, part2: 0.5 },
    categories: [
        { key: 'comm', name: 'Communication', weight: 0.5, items: [{ key: '1', text: 'a' }, { key: '2', text: 'b' }] },
        { key: 'clean', name: 'Cleanliness', weight: 0.3, items: [{ key: '1', text: 'c' }] },
        { key: 'time', name: 'Time', weight: 0.2, items: [{ key: '1', text: 'd' }, { key: '2', text: 'e' }] },
    ],
    redFlags: [
        { key: 'theft', text: 'Took something', type: 'FAIL' },
        { key: 'phone', text: 'On phone with customer', type: 'CAP' },
    ],
    bands: [
        { key: 'confirms', label: 'Confirms level', min: 80 },
        { key: 'gaps', label: 'Confirms with gaps', min: 65 },
        { key: 'no', label: 'Does not confirm', min: 50 },
        { key: 'not_ready', label: 'Not ready', min: 0 },
    ],
    capValue: 64,
    safetyFlagType: 'FAIL',
};

const s = (score, note = '') => ({ score, note });
/** { 'T1.1': 2, ... } -> stepScores/itemScores map */
const scores = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, s(v)]));
/** Every item in every category scored v. */
const allItems = (v, config = CONFIG) => scores(Object.fromEntries(
    config.categories.flatMap(c => c.items.map(it => [`${c.key}.${it.key}`, v]))
));

const run = (args) => scoreEvaluation({ config: CONFIG, stepScores: {}, itemScores: {}, redFlags: {}, ...args });

describe('task score', () => {
    test('sum / (2 x steps scored)', () => {
        const r = run({ tasks: [task('T1', 4)], stepScores: scores({ 'T1.1': 2, 'T1.2': 1, 'T1.3': 1, 'T1.4': 0 }) });
        expect(r.tasks[0].score).toBeCloseTo(4 / 8);
    });

    test('N/A steps are left out', () => {
        const r = run({ tasks: [task('T1', 4)], stepScores: scores({ 'T1.1': 2, 'T1.2': 'na', 'T1.3': 1, 'T1.4': 'na' }) });
        expect(r.tasks[0].score).toBeCloseTo(3 / 4);
        expect(r.tasks[0].stepsScored).toBe(2);
        expect(r.tasks[0].stepsNa).toBe(2);
    });

    test('unscored steps are left out too', () => {
        const r = run({ tasks: [task('T1', 3)], stepScores: scores({ 'T1.1': 2 }) });
        expect(r.tasks[0].score).toBe(1);
        expect(r.unscored.steps).toBe(2);
    });

    test('a task with every step N/A has no score', () => {
        const r = run({ tasks: [task('T1', 2)], stepScores: scores({ 'T1.1': 'na', 'T1.2': 'na' }) });
        expect(r.tasks[0].score).toBeNull();
    });

    test('a 0 on a safety step sets the task to 0 and adds a red flag of the template type', () => {
        const r = run({
            tasks: [task('T1', 3, [2])],
            stepScores: { 'T1.1': s(2), 'T1.2': s(0, 'no lockout'), 'T1.3': s(2) },
            itemScores: allItems(2),
        });
        expect(r.tasks[0].score).toBe(0);
        expect(r.tasks[0].safetyZero).toBe(true);
        expect(r.redFlags).toEqual([expect.objectContaining({ key: 'safety:T1.2', type: 'FAIL', auto: true, note: 'no lockout' })]);
        expect(r.failed).toBe(true);
        expect(r.band).toEqual({ key: 'fail', label: 'Fail' });
    });

    test('the safety flag type comes from the template (CAP)', () => {
        const config = { ...CONFIG, safetyFlagType: 'CAP' };
        const r = scoreEvaluation({
            tasks: [task('T1', 2, [1]), task('T2', 2)],
            config,
            stepScores: scores({ 'T1.1': 0, 'T1.2': 2, 'T2.1': 2, 'T2.2': 2 }),
            itemScores: allItems(2),
            redFlags: {},
        });
        expect(r.failed).toBe(false);
        expect(r.redFlags[0].type).toBe('CAP');
        expect(r.total).toBe(64);
        expect(r.capped).toBe(true);
    });

    test('a 1 or N/A on a safety step is not a red flag', () => {
        const r = run({ tasks: [task('T1', 2, [1, 2])], stepScores: scores({ 'T1.1': 1, 'T1.2': 'na' }) });
        expect(r.tasks[0].score).toBeCloseTo(0.5);
        expect(r.redFlags).toEqual([]);
    });

    test('a 0 on a non-safety step is just a 0', () => {
        const r = run({ tasks: [task('T1', 2, [2])], stepScores: scores({ 'T1.1': 0, 'T1.2': 2 }) });
        expect(r.tasks[0].score).toBeCloseTo(0.5);
        expect(r.redFlags).toEqual([]);
    });
});

describe('Part 1', () => {
    test('is the average of task scores (not of steps)', () => {
        const r = run({
            tasks: [task('T1', 2), task('T2', 4)],
            stepScores: scores({ 'T1.1': 2, 'T1.2': 2, 'T2.1': 0, 'T2.2': 0, 'T2.3': 0, 'T2.4': 2 }),
        });
        // T1 = 1.0, T2 = 0.25 -> 0.625 (a per-step average would be 0.5)
        expect(r.part1).toBeCloseTo(0.625);
    });

    test('tasks with nothing scored are left out of the average', () => {
        const r = run({ tasks: [task('T1', 2), task('T2', 2)], stepScores: scores({ 'T1.1': 2, 'T1.2': 1 }) });
        expect(r.part1).toBeCloseTo(0.75);
    });

    test('is null when no task has a score', () => {
        expect(run({ tasks: [task('T1', 2)] }).part1).toBeNull();
        expect(run({ tasks: [] }).part1).toBeNull();
    });
});

describe('Part 2', () => {
    test('category score is sum / (2 x items scored), N/A left out', () => {
        const r = run({ tasks: [], itemScores: scores({ 'comm.1': 2, 'comm.2': 'na', 'time.1': 1, 'time.2': 0 }) });
        expect(r.categories.find(c => c.key === 'comm').score).toBe(1);
        expect(r.categories.find(c => c.key === 'time').score).toBeCloseTo(0.25);
    });

    test('is the weighted average of categories', () => {
        const r = run({ tasks: [], itemScores: scores({ 'comm.1': 2, 'comm.2': 2, 'clean.1': 1, 'time.1': 0, 'time.2': 0 }) });
        // 0.5*1 + 0.3*0.5 + 0.2*0 = 0.65
        expect(r.part2).toBeCloseTo(0.65);
    });

    test('an all-N/A category spreads its weight over the rest in proportion', () => {
        const r = run({ tasks: [], itemScores: scores({ 'comm.1': 2, 'comm.2': 2, 'clean.1': 'na', 'time.1': 0, 'time.2': 0 }) });
        // clean (0.3) drops out: comm 0.5/0.7, time 0.2/0.7 -> 1*(5/7) + 0*(2/7)
        expect(r.part2).toBeCloseTo(5 / 7);
        const clean = r.categories.find(c => c.key === 'clean');
        expect(clean.score).toBeNull();
        expect(clean.effectiveWeight).toBe(0);
        expect(r.categories.reduce((a, c) => a + c.effectiveWeight, 0)).toBeCloseTo(1);
    });

    test('is null when every category is N/A', () => {
        expect(run({ tasks: [], itemScores: allItems('na') }).part2).toBeNull();
    });
});

describe('total', () => {
    test('round(100 x (0.5 x Part 1 + 0.5 x Part 2))', () => {
        const r = run({
            tasks: [task('T1', 4)],
            stepScores: scores({ 'T1.1': 2, 'T1.2': 2, 'T1.3': 2, 'T1.4': 1 }), // 7/8
            itemScores: allItems(1), // 0.5
        });
        expect(r.total).toBe(Math.round(100 * (0.5 * 0.875 + 0.5 * 0.5))); // 68.75 -> 69
        expect(r.total).toBe(69);
        expect(r.partial).toBe(false);
    });

    test('part weights come from the template', () => {
        const config = { ...CONFIG, partWeights: { part1: 0.7, part2: 0.3 } };
        const r = scoreEvaluation({
            tasks: [task('T1', 1)], config, stepScores: scores({ 'T1.1': 2 }), itemScores: allItems(0), redFlags: {},
        });
        expect(r.total).toBe(70);
    });

    test('only Part 1 scored: total is Part 1 alone, labeled partial', () => {
        const r = run({ tasks: [task('T1', 4)], stepScores: scores({ 'T1.1': 2, 'T1.2': 2, 'T1.3': 1, 'T1.4': 1 }) });
        expect(r.total).toBe(75);
        expect(r.partial).toBe(true);
        expect(r.partialPart).toBe('part1');
    });

    test('only Part 2 scored: total is Part 2 alone, labeled partial', () => {
        const r = run({ tasks: [], itemScores: allItems(2) });
        expect(r.total).toBe(100);
        expect(r.partial).toBe(true);
        expect(r.partialPart).toBe('part2');
    });

    test('nothing scored: no total, no band', () => {
        const r = run({ tasks: [task('T1', 2)] });
        expect(r.total).toBeNull();
        expect(r.band).toBeNull();
    });

    test('rounding is not thrown off by floating point', () => {
        expect(toPct(0.795)).toBe(80);
        expect(toPct(0.645)).toBe(65);
        expect(toPct(0.7949)).toBe(79);
    });
});

describe('red flags', () => {
    const strong = {
        tasks: [task('T1', 2)],
        stepScores: scores({ 'T1.1': 2, 'T1.2': 2 }),
        itemScores: allItems(2),
    };

    test('a FAIL flag makes the result Fail but keeps the score for reference', () => {
        const r = run({ ...strong, redFlags: { theft: { note: 'saw it' } } });
        expect(r.failed).toBe(true);
        expect(r.band.key).toBe('fail');
        expect(r.total).toBe(100);
        expect(r.redFlags).toEqual([expect.objectContaining({ key: 'theft', type: 'FAIL', note: 'saw it', auto: false })]);
    });

    test('a CAP flag limits the total to the template cap', () => {
        const r = run({ ...strong, redFlags: { phone: { note: 'x' } } });
        expect(r.rawTotal).toBe(100);
        expect(r.total).toBe(64);
        expect(r.capped).toBe(true);
        expect(r.band.key).toBe('no');
    });

    test('a CAP flag does not raise a total already under the cap', () => {
        const r = run({ tasks: [], itemScores: allItems(1), redFlags: { phone: { note: 'x' } } });
        expect(r.total).toBe(50);
        expect(r.capped).toBe(false);
    });

    test('the cap value comes from the template', () => {
        const config = { ...CONFIG, capValue: 70 };
        const r = scoreEvaluation({ ...strong, config, redFlags: { phone: { note: 'x' } } });
        expect(r.total).toBe(70);
    });

    test('FAIL wins over CAP', () => {
        const r = run({ ...strong, redFlags: { phone: { note: 'x' }, theft: { note: 'y' } } });
        expect(r.failed).toBe(true);
        expect(r.band.key).toBe('fail');
        expect(r.total).toBe(64);
    });

    test('a FAIL flag fails even with nothing scored', () => {
        const r = run({ tasks: [], redFlags: { theft: { note: 'y' } } });
        expect(r.total).toBeNull();
        expect(r.band.key).toBe('fail');
    });

    test('flags not in the template are ignored', () => {
        const r = run({ ...strong, redFlags: { madeUp: { note: 'x' } } });
        expect(r.redFlags).toEqual([]);
        expect(r.failed).toBe(false);
    });
});

describe('bands', () => {
    // Part 2 only, using a single 50-item category so any whole percentage is reachable.
    const bandConfig = {
        ...CONFIG,
        categories: [{ key: 'c', name: 'C', weight: 1, items: Array.from({ length: 50 }, (_, i) => ({ key: String(i + 1), text: 'x' })) }],
    };
    const totalOf = (pct) => {
        const pts = pct; // 50 items x 2 = 100 points
        const itemScores = {};
        let left = pts;
        for (let i = 1; i <= 50; i++) { const v = Math.min(2, left); itemScores[`c.${i}`] = s(v); left -= v; }
        return scoreEvaluation({ tasks: [], config: bandConfig, stepScores: {}, itemScores, redFlags: {} });
    };

    test.each([
        [100, 'confirms'], [80, 'confirms'],
        [79, 'gaps'], [65, 'gaps'],
        [64, 'no'], [50, 'no'],
        [49, 'not_ready'], [0, 'not_ready'],
    ])('%i -> %s', (pct, key) => {
        const r = totalOf(pct);
        expect(r.total).toBe(pct);
        expect(r.band.key).toBe(key);
    });

    test('bands come from the template', () => {
        const config = { ...bandConfig, bands: [{ key: 'hi', label: 'Hi', min: 90 }, { key: 'lo', label: 'Lo', min: 0 }] };
        const r = scoreEvaluation({ tasks: [], config, stepScores: {}, itemScores: allItems(2, config), redFlags: {} });
        expect(r.band).toEqual({ key: 'hi', label: 'Hi' });
    });
});
