const { scoreInterview } = require('../services/interviewKits/scoring');
const { getDefinition, DEFINITIONS } = require('../services/interviewKits/definitions');
const { syntheticContent, sectionAnswers, tenTotalling, redFlags } = require('./helpers/kitFixtures');

const score = (slug, answers) => {
    const def = getDefinition(slug);
    return scoreInterview(def.scoring, syntheticContent(slug), answers);
};
const levels = (l1, l2, l3) => ({
    ...(l1 !== undefined && sectionAnswers('L1', tenTotalling(l1))),
    ...(l2 !== undefined && sectionAnswers('L2', tenTotalling(l2))),
    ...(l3 !== undefined && sectionAnswers('L3', tenTotalling(l3))),
});

describe('definitions', () => {
    test('every definition has a known engine and placements/outcomes', () => {
        for (const d of DEFINITIONS) {
            expect(['leveled', 'gated']).toContain(d.scoring.engine);
            if (d.scoring.engine === 'leveled') expect(d.scoring.placements).toHaveLength(d.scoring.levels.length + 1);
            if (d.scoring.engine === 'gated') expect(Object.keys(d.scoring.outcomes).sort()).toEqual(['development', 'notReady', 'readyNow']);
        }
    });
    test('skill profile questions all exist in the kit structure', () => {
        for (const d of DEFINITIONS) {
            const content = syntheticContent(d.slug);
            const allKeys = new Set(content.sections.flatMap(s => s.questions.map(q => q.key)));
            for (const g of d.scoring.skillProfile || []) {
                for (const k of g.questions) expect(allKeys.has(k)).toBe(true);
            }
        }
    });
    test('pay guidance is never part of any scoring definition', () => {
        expect(JSON.stringify(DEFINITIONS)).not.toMatch(/\$\s*_+|\/hr/);
    });
});

describe('leveled banks (PM): placement at the highest level scoring 14+', () => {
    const P = getDefinition('pm-technician').scoring.placements;

    test('nothing scored is incomplete, with no recommendation', () => {
        const r = score('pm-technician', {});
        expect(r.outcome).toBeNull();
        expect(r.incompleteReason).toMatch(/hasn't been scored/);
    });

    test('a partly scored level is incomplete', () => {
        const r = score('pm-technician', sectionAnswers('L1', [2, 2, 2, 2, 2, 2, 2, null, null, null]));
        expect(r.outcome).toBeNull();
        expect(r.incompleteReason).toMatch(/3 unscored questions/);
    });

    test('13 on Level 1 places below Level 1', () => {
        expect(score('pm-technician', levels(13)).outcome.label).toBe(P[0]);
    });

    test('exactly 14 on Level 1 passes it', () => {
        const r = score('pm-technician', levels(14, 0));
        expect(r.outcome.label).toBe(P[1]);
        expect(r.outcome.levelsPassed).toBe(1);
    });

    test('passing Level 1 without asking Level 2 places at Level 1 and says so', () => {
        const r = score('pm-technician', levels(20));
        expect(r.outcome.label).toBe(P[1]);
        expect(r.notes.join(' ')).toMatch(/not asked/);
    });

    test('14 on L1, 14 on L2, 13 on L3 places at Level 2', () => {
        expect(score('pm-technician', levels(14, 14, 13)).outcome.label).toBe(P[2]);
    });

    test('a perfect score places at Level 3', () => {
        expect(score('pm-technician', levels(20, 20, 20)).outcome.label).toBe(P[3]);
    });

    test('levels above a failed level do not count', () => {
        const r = score('pm-technician', levels(13, 20, 20));
        expect(r.outcome.label).toBe(P[0]);
        expect(r.notes.join(' ')).toMatch(/aren't counted/);
        expect(r.sections.find(s => s.key === 'L2').counted).toBe(false);
    });

    test('scores outside the 0-2 scale are ignored, not counted', () => {
        const answers = sectionAnswers('L1', [3, 2, 2, 2, 2, 2, 2, 2, 2, 2]);
        const r = score('pm-technician', answers);
        expect(r.outcome).toBeNull();
        expect(r.incompleteReason).toMatch(/1 unscored question/);
    });
});

describe('BS-detector red flags are guidance only', () => {
    test.each([
        [0, 'Place as scored.'],
        [1, 'Place as scored, but confirm on the ride-along before final pay.'],
        [2, 'Drop one level, or hold the offer until a ride-along confirms the higher level.'],
        [4, 'Drop one level, or hold the offer until a ride-along confirms the higher level.'],
    ])('%i red flags on PM', (n, text) => {
        const r = score('pm-technician', { ...levels(20, 20, 20), ...redFlags(n) });
        expect(r.redFlags.count).toBe(n);
        expect(r.redFlags.guidance).toBe(text);
        // Never applied: placement stays as scored.
        expect(r.outcome.label).toBe(getDefinition('pm-technician').scoring.placements[3]);
    });

    test('installer has no wording for zero flags', () => {
        expect(score('residential-installer', levels(20)).redFlags.guidance).toBeNull();
    });
});

describe('skill profile', () => {
    test('sums only answered questions in each area', () => {
        const r = score('residential-installer', levels(20));
        const electrical = r.skillProfile.find(g => g.area === 'Electrical'); // L2 Q5 only
        expect(electrical).toMatchObject({ answered: 0, score: 0, max: 0 });
        const safety = r.skillProfile.find(g => g.area === 'Safety and job-site basics'); // L1 Q1-3, Q8-9
        expect(safety).toMatchObject({ answered: 5, score: 10, max: 10 });
    });

    test('kits without a defined profile return null', () => {
        expect(score('pm-technician', levels(20)).skillProfile).toBeNull();
    });
});

describe('gated lead assessments', () => {
    const parts = (p1, p2) => ({
        ...(p1 !== undefined && sectionAnswers('P1', Array.isArray(p1) ? p1 : tenTotalling(p1))),
        ...(p2 !== undefined && sectionAnswers('P2', Array.isArray(p2) ? p2 : tenTotalling(p2))),
    });
    const O = getDefinition('lead-technician').scoring.outcomes;
    const CO = getDefinition('commercial-lead-technician').scoring.outcomes;

    test('under 14 on Part 1 is not ready, and Part 2 is not counted', () => {
        const r = score('lead-technician', parts(13, 20));
        expect(r.outcome.label).toBe(O.notReady);
        expect(r.notes.join(' ')).toMatch(/isn't counted/);
    });

    test('14 on Part 1 and 13 on Part 2 is ready with development', () => {
        expect(score('lead-technician', parts(14, 13)).outcome.label).toBe(O.development);
    });

    test('14 on both parts is ready now', () => {
        expect(score('lead-technician', parts(14, 14)).outcome.label).toBe(O.readyNow);
    });

    test('Part 1 incomplete gives no recommendation', () => {
        expect(score('lead-technician', parts([2, 2, 2, 2, 2, 2, 2, 2, 2, null])).outcome).toBeNull();
    });

    test('passed Part 1 with Part 2 unfinished gives no recommendation', () => {
        expect(score('lead-technician', parts(20, [2, 2, 2])).outcome).toBeNull();
    });

    test.each(['lead-technician', 'commercial-lead-technician'])('%s: a 0 on any single question does not override the total', (slug) => {
        const p2 = [2, 2, 0, 0, 2, 2, 2, 2, 2, 2]; // 16
        const r = score(slug, parts(20, p2));
        expect(r.outcome.label).toBe((slug === 'lead-technician' ? O : CO).readyNow);
        expect(r).not.toHaveProperty('critical');
    });
});

describe('results are recommendations only', () => {
    test('every result is flagged recommendation-only and never carries a pipeline status', () => {
        for (const d of DEFINITIONS) {
            const r = scoreInterview(d.scoring, syntheticContent(d.slug), {});
            expect(r.recommendationOnly).toBe(true);
            expect(JSON.stringify(r)).not.toMatch(/pipeline_status|rejected/);
        }
    });
});
