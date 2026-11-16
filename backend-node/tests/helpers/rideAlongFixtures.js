// Synthetic ride-along content for tests. Placeholder text only: real
// scorecard content never goes in this repo (it's public).

const steps = (n, safetyAt = []) => Array.from({ length: n }, (_, i) => ({
    text: `placeholder step ${i + 1}`,
    twoLooksLike: `placeholder two ${i + 1}`,
    safety: safetyAt.includes(i + 1),
}));

function syntheticBundle({ t1Steps = 3, extraScorecardTask = null } = {}) {
    return {
        tasks: [
            { code: 'T1', name: 'Task one', level: 'Level 1', time: '30 min', equipment: ['gauges'], roleTags: ['residential'], steps: steps(t1Steps, [2]) },
            { code: 'T2', name: 'Task two', level: 'Level 2', time: '45 min', equipment: [], roleTags: ['residential', 'commercial'], steps: steps(2) },
            { code: 'C1', name: 'Commercial one', level: 'Level 2', time: '60 min', equipment: [], roleTags: ['commercial'], steps: steps(2) },
        ],
        scorecards: [
            {
                slug: 'residential-service-tech',
                title: 'Residential Service Tech',
                role: 'HVAC Service Technician',
                tasks: ['T1', 'T2', ...(extraScorecardTask ? [extraScorecardTask] : [])],
                partWeights: { part1: 0.5, part2: 0.5 },
                categories: [
                    { key: 'communication', name: 'Communication', weight: 0.6, items: [{ text: 'placeholder item a' }, { text: 'placeholder item b' }] },
                    { key: 'cleanliness', name: 'Cleanliness', weight: 0.4, items: [{ text: 'placeholder item c' }] },
                ],
                redFlags: [
                    { key: 'dishonest', text: 'placeholder fail flag', type: 'FAIL' },
                    { key: 'rude', text: 'placeholder cap flag', type: 'CAP' },
                ],
                bands: [
                    { key: 'confirms', label: 'Confirms level', min: 80 },
                    { key: 'gaps', label: 'Confirms with gaps', min: 65 },
                    { key: 'does_not_confirm', label: 'Does not confirm', min: 50 },
                    { key: 'not_ready', label: 'Not ready', min: 0 },
                ],
                capValue: 64,
                safetyFlagType: 'FAIL',
            },
            {
                slug: 'commercial-service-tech',
                title: 'Commercial Service Tech',
                role: 'Commercial HVAC Service Technician',
                tasks: ['T2', 'C1'],
                partWeights: { part1: 0.5, part2: 0.5 },
                categories: [{ key: 'communication', name: 'Communication', weight: 1, items: [{ text: 'placeholder item' }] }],
                redFlags: [],
                bands: [{ key: 'confirms', label: 'Confirms level', min: 80 }, { key: 'not_ready', label: 'Not ready', min: 0 }],
                capValue: 64,
                safetyFlagType: 'FAIL',
            },
        ],
    };
}

module.exports = { syntheticBundle, steps };
