/**
 * Interview kit definitions: structure, scoring rules and role mapping for
 * each shared Talos kit. Every rule here is transcribed from the kit's source
 * document; nothing is invented.
 *
 * This file deliberately holds NO question content or answer keys (the repo is
 * public). Content is uploaded as .docx through the admin dashboard, parsed by
 * docxParser.js, checked against the `sections` spec below, and stored as an
 * immutable version in interview_kit_versions.
 */

// "Each question is worth 0 (wrong or no idea), 1 (partly right) or 2 (solid)."
// Used verbatim by all six technical documents.
const ZERO_TO_TWO = [
    { value: 0, label: '0', description: 'Wrong or no idea' },
    { value: 1, label: '1', description: 'Partly right' },
    { value: 2, label: '2', description: 'Solid' },
];

const levelSections = (count = 10) => [
    { key: 'L1', heading: /^Level 1\b/i, scoreOptions: ZERO_TO_TWO, questionCount: count },
    { key: 'L2', heading: /^Level 2\b/i, scoreOptions: ZERO_TO_TWO, questionCount: count },
    { key: 'L3', heading: /^Level 3\b/i, scoreOptions: ZERO_TO_TWO, questionCount: count },
];

// Character kits print their own 0-3 scale ("Score / What it means" table in
// "How to run and score it"); the parser reads it from the document.
const SCALE_FROM_DOC = 'fromDoc';

// Character kits number questions 1-9 straight through the three parts.
const traitSections = (counts) => {
    let first = 1;
    return counts.map((count, i) => {
        const spec = { key: `P${i + 1}`, heading: new RegExp(`^Part ${i + 1}\\b`, 'i'), scoreOptions: SCALE_FROM_DOC, questionCount: count, firstNumber: first };
        first += count;
        return spec;
    });
};

// Shared by the four character kits: "A candidate needs at least 22 of 27
// points [and] the minimum in each part ... to earn a Strong result."
// Check closely: "16-21, or 22+ with a part below its minimum". Not ready:
// "Under 16". The documents' critical-question rule is deliberately not used
// (critical questions were removed from every kit on 2026-11-12).
const traitScoring = (minimums, outcomes) => ({
    engine: 'trait',
    parts: minimums.map((min, i) => ({ section: `P${i + 1}`, min })),
    strongMark: 22,
    checkMark: 16,
    outcomes,
    redFlagSection: null,
    skillProfile: null,
});

const FIELD_ROLES = [
    'HVAC Service Technician', 'Preventative Maintenance Technician', 'HVAC Technician',
    'Lead HVAC Technician', 'HVAC Installer', 'Lead HVAC Installer', 'Maintenance Technician',
    'Commercial Service Technician', 'Commercial Lead Technician',
];
const OFFICE_ROLES = ['HVAC Dispatcher', 'Administrative Assistant', 'Customer Service Representative', 'Bookkeeper'];

// Apprentice Aptitude Assessment, Sections 1-3: "1 point each".
const ZERO_OR_ONE = [
    { value: 0, label: '0', description: 'Wrong' },
    { value: 1, label: '1', description: 'Right' },
];
// Section 2, Q1 (tape reading): "Half credit if they're off by 1/16."
const ZERO_HALF_ONE = [
    { value: 0, label: '0', description: "Can't read the fractions" },
    { value: 0.5, label: '½', description: 'Off by 1/16' },
    { value: 1, label: '1', description: 'Exact' },
];
// Section 4: "Score each 0 (red flag), 1 (partly there) or 2 (strong)".
const WORK_HABITS = [
    { value: 0, label: '0', description: 'Red flag' },
    { value: 1, label: '1', description: 'Partly there' },
    { value: 2, label: '2', description: 'Strong' },
];

const BS_SECTION = { key: 'BS', heading: /^BS-detector/i, scoreOptions: null, minQuestions: 1 };

// Expand "L1 Q1–3, Q8–9" style lists by hand into explicit keys.
const keys = (section, nums) => nums.map(n => `${section}.Q${n}`);

const DEFINITIONS = [
    {
        slug: 'pm-technician',
        title: 'PM Technician Question Bank',
        docTitle: /^PM Technician Question Bank/i,
        type: 'technical',
        roles: ['Preventative Maintenance Technician'],
        levels: ['Level 1', 'Level 2', 'Level 3'],
        sections: [...levelSections(), BS_SECTION],
        scoring: {
            engine: 'leveled',
            levels: ['L1', 'L2', 'L3'],
            passMark: 14,
            // "A candidate is placed at the highest level where they score 14 or more out of 20."
            placements: [
                'Helper / trainee, not yet a PM tech',
                'Level 1 PM tech',
                'Level 2 PM tech',
                'Level 3 PM tech',
            ],
            redFlagSection: 'BS',
            redFlagAdjustments: {
                none: 'Place as scored.',
                one: 'Place as scored, but confirm on the ride-along before final pay.',
                twoPlus: 'Drop one level, or hold the offer until a ride-along confirms the higher level.',
            },
            skillProfile: null,
        },
    },
    {
        slug: 'service-technician',
        title: 'Residential Service Technician Question Bank',
        docTitle: /^(Residential )?Service Technician Question Bank/i,
        type: 'technical',
        roles: ['HVAC Service Technician', 'HVAC Technician'],
        levels: ['Level 1', 'Level 2', 'Level 3'],
        sections: [...levelSections(), BS_SECTION],
        scoring: {
            engine: 'leveled',
            levels: ['L1', 'L2', 'L3'],
            passMark: 14,
            placements: [
                'Not ready for service; consider a PM or helper role',
                'Level 1 service tech',
                'Level 2 service tech',
                'Level 3 service tech',
            ],
            redFlagSection: 'BS',
            redFlagAdjustments: {
                none: 'Place as scored.',
                one: 'Place as scored, but confirm on the ride-along before final pay.',
                twoPlus: 'Drop one level, or hold the offer until a ride-along confirms the higher level.',
            },
            skillProfile: null,
        },
    },
    {
        slug: 'residential-installer',
        title: 'Residential Installer Question Bank',
        docTitle: /^Residential Installer Question Bank/i,
        type: 'technical',
        roles: ['HVAC Installer', 'Lead HVAC Installer'],
        levels: ['Level 1', 'Level 2', 'Level 3'],
        sections: [...levelSections(), BS_SECTION],
        scoring: {
            engine: 'leveled',
            levels: ['L1', 'L2', 'L3'],
            passMark: 14,
            placements: [
                'Not ready for install work yet, or a very green helper. Hire on attitude and reliability if the owner wants to train from scratch.',
                'Level 1: helper or apprentice.',
                'Level 2: installer.',
                'Level 3: senior installer. Candidate for the Lead Installer assessment.',
            ],
            redFlagSection: 'BS',
            // The document gives no wording for zero red flags.
            redFlagAdjustments: {
                none: null,
                one: 'Confirm on a supervised install.',
                twoPlus: 'Place them one level lower until a supervised install confirms.',
            },
            skillProfile: [
                { area: 'Safety and job-site basics', questions: keys('L1', [1, 2, 3, 8, 9]) },
                { area: 'Refrigeration piping (brazing, evacuation, line sets, flares)', questions: [...keys('L1', [5]), ...keys('L2', [1, 2, 3]), ...keys('L3', [3, 9])] },
                { area: 'Charging and commissioning', questions: [...keys('L2', [4, 9]), ...keys('L3', [7])] },
                { area: 'Electrical', questions: keys('L2', [5]) },
                { area: 'Gas, venting and combustion safety', questions: [...keys('L1', [7]), ...keys('L2', [6, 7]), ...keys('L3', [1])] },
                { area: 'Condensate', questions: [...keys('L1', [6]), ...keys('L2', [8])] },
                { area: 'System design (matching, sizing, ducts, heat pumps, A2L)', questions: keys('L3', [2, 4, 5, 6, 8]) },
                { area: 'Customer and training', questions: [...keys('L1', [10]), ...keys('L2', [10]), ...keys('L3', [10])] },
            ],
        },
    },
    {
        slug: 'commercial-service-technician',
        title: 'Commercial Service Technician Question Bank',
        docTitle: /^Commercial Service Technician Question Bank/i,
        type: 'technical',
        // No commercial job title exists in the job form yet, so this kit is
        // browsable by role but never auto-suggested for a job.
        roles: ['Commercial Service Technician'],
        levels: ['Level 1', 'Level 2', 'Level 3'],
        sections: [...levelSections(), BS_SECTION],
        scoring: {
            engine: 'leveled',
            levels: ['L1', 'L2', 'L3'],
            passMark: 14,
            placements: [
                'Not ready for commercial service; consider a commercial helper or residential role',
                'Level 1 commercial service tech',
                'Level 2 commercial service tech',
                'Level 3 commercial service tech',
            ],
            redFlagSection: 'BS',
            redFlagAdjustments: {
                none: 'Place as scored.',
                one: 'Confirm on a ride-along.',
                twoPlus: 'Drop one level or hold until a ride-along confirms.',
            },
            skillProfile: [
                { area: 'Safety and electrical', questions: [...keys('L1', [1, 3, 5]), ...keys('L2', [3, 7]), ...keys('L3', [4, 10])] },
                { area: 'Refrigeration', questions: [...keys('L1', [6, 8]), ...keys('L2', [2, 6]), ...keys('L3', [3, 5])] },
                { area: 'Air side and controls', questions: [...keys('L1', [4, 7, 9]), ...keys('L2', [1, 4, 8, 9]), ...keys('L3', [6])] },
                { area: 'Heating and hydronics', questions: [...keys('L2', [5]), ...keys('L3', [2, 7])] },
                { area: 'Chillers', questions: keys('L3', [1, 8]) },
                { area: 'Customer and leadership', questions: [...keys('L1', [10]), ...keys('L2', [10]), ...keys('L3', [9, 10])] },
            ],
        },
    },
    {
        slug: 'lead-technician',
        title: 'Lead Residential Technician Assessment',
        docTitle: /^Lead (Residential )?Technician Assessment/i,
        type: 'technical',
        roles: ['Lead HVAC Technician'],
        levels: ['Lead'],
        sections: [
            { key: 'P1', heading: /^Part 1\b/i, scoreOptions: ZERO_TO_TWO, questionCount: 10 },
            { key: 'P2', heading: /^Part 2\b/i, scoreOptions: ZERO_TO_TWO, questionCount: 10 },
            BS_SECTION,
        ],
        scoring: {
            engine: 'gated',
            gate: { section: 'P1', passMark: 14 },
            second: { section: 'P2', passMark: 14 },
            outcomes: {
                notReady: 'Not ready. Strong tech candidate, maybe, but not a lead yet. Consider placing them as a Level 2 or 3 service tech instead.',
                development: 'Ready with development. Technically strong; needs leadership coaching before leading others.',
                readyNow: 'Ready now.',
            },
            redFlagSection: 'BS',
            redFlagAdjustments: {
                none: null,
                one: 'Confirm with a reference from someone they trained.',
                twoPlus: 'Move down one outcome until a reference confirms.',
            },
            skillProfile: [
                { area: 'Developing techs', questions: keys('P2', [2, 3, 4]) },
                { area: 'Quality and callbacks', questions: keys('P2', [1, 5]) },
                { area: 'Customers and ethics', questions: keys('P2', [6, 8]) },
                { area: 'Safety', questions: keys('P2', [7]) },
                { area: 'Operations', questions: keys('P2', [9, 10]) },
            ],
        },
    },
    {
        slug: 'commercial-lead-technician',
        title: 'Commercial Lead Technician Assessment',
        docTitle: /^Commercial Lead Technician Assessment/i,
        type: 'technical',
        roles: ['Commercial Lead Technician'],
        levels: ['Lead'],
        sections: [
            { key: 'P1', heading: /^Part 1\b/i, scoreOptions: ZERO_TO_TWO, questionCount: 10 },
            { key: 'P2', heading: /^Part 2\b/i, scoreOptions: ZERO_TO_TWO, questionCount: 10 },
            BS_SECTION,
        ],
        scoring: {
            engine: 'gated',
            gate: { section: 'P1', passMark: 14 },
            second: { section: 'P2', passMark: 14 },
            outcomes: {
                notReady: 'Not ready. Consider placing them as a Level 2 or 3 commercial service tech instead.',
                development: 'Ready with development. Technically strong; needs leadership and account-management coaching before running crews.',
                readyNow: 'Ready now.',
            },
            redFlagSection: 'BS',
            redFlagAdjustments: {
                none: null,
                one: 'Confirm with a reference.',
                twoPlus: 'Move down one outcome until references confirm.',
            },
            skillProfile: [
                { area: 'Customers and approvals', questions: keys('P2', [1, 9, 10]) },
                { area: 'Documentation and compliance', questions: keys('P2', [2, 4]) },
                { area: 'Crew safety and planning', questions: keys('P2', [3]) },
                { area: 'Quality and contracts', questions: keys('P2', [5, 7]) },
                { area: 'Developing techs', questions: keys('P2', [6]) },
                { area: 'Operations', questions: keys('P2', [8]) },
            ],
        },
    },
    {
        slug: 'field-character',
        title: 'Field Character & Self-Sufficiency Assessment',
        docTitle: /^Field Character (&|and) Self-Sufficiency Assessment/i,
        type: 'character',
        layout: 'character',
        // "Field finalists with at least one year of paid field experience."
        roles: FIELD_ROLES,
        levels: ['1+ years in the field'],
        sections: traitSections([2, 4, 3]),
        scoring: traitScoring([4, 7, 5], {
            strong: 'Strong. Move to the ride-along.',
            check: 'Check closely. Probe the weak part in reference checks and the ride-along.',
            notReady: 'Not ready. Do not advance.',
        }),
    },
    {
        slug: 'office-character',
        title: 'Office Character & Self-Sufficiency Assessment',
        docTitle: /^Office Character (&|and) Self-Sufficiency Assessment/i,
        type: 'character',
        layout: 'character',
        roles: OFFICE_ROLES,
        levels: ['Any experience'],
        sections: traitSections([2, 4, 3]),
        scoring: traitScoring([4, 7, 5], {
            strong: 'Strong. Move to reference checks.',
            check: 'Check closely. Probe the weak part in reference checks.',
            notReady: 'Not ready. Do not advance.',
        }),
    },
    {
        slug: 'experienced-office-character',
        title: 'Experienced Office Character & Self-Sufficiency Assessment',
        docTitle: /^Experienced Office Character (&|and)? ?Self-Sufficiency Assessment/i,
        type: 'character',
        layout: 'character',
        roles: OFFICE_ROLES,
        levels: ['Prior office experience'],
        sections: traitSections([2, 4, 3]),
        scoring: traitScoring([4, 7, 5], {
            strong: 'Strong. Move to reference checks.',
            check: 'Check closely. Probe the weak part in reference checks.',
            notReady: 'Not ready. Do not advance.',
        }),
    },
    {
        slug: 'apprentice-character',
        title: 'Apprentice & Green Candidate Character Assessment',
        docTitle: /^Apprentice (&|and) Green Candidate Character Assessment/i,
        type: 'character',
        layout: 'character',
        // "Apprentice candidates and anyone with under one year of paid field experience."
        roles: ['Apprentice'],
        levels: ['Under 1 year in the field'],
        sections: traitSections([3, 3, 3]),
        scoring: traitScoring([5, 5, 5], {
            strong: 'Strong. Move to a shadow day or working interview.',
            check: 'Check closely. Probe the weak part in reference checks and the shadow day.',
            notReady: 'Not ready. Do not advance.',
        }),
    },
    {
        slug: 'apprentice-aptitude',
        title: 'Apprentice Aptitude Assessment',
        docTitle: /^Apprentice Aptitude Assessment/i,
        type: 'aptitude',
        roles: ['Apprentice'],
        levels: ['Under 1 year in the field'],
        sections: [
            { key: 'S1', heading: /^Section 1\b/i, scoreOptions: ZERO_OR_ONE, questionCount: 5, columns: { answerKey: ['answer'] } },
            {
                key: 'S2', heading: /^Section 2\b/i, scoreOptions: ZERO_OR_ONE, questionCount: 5, columns: { answerKey: ['answer'] },
                questionScoreOptions: { 1: ZERO_HALF_ONE },
            },
            { key: 'S3', heading: /^Section 3\b/i, scoreOptions: ZERO_OR_ONE, questionCount: 5, columns: { answerKey: ['answer'] } },
            { key: 'S4', heading: /^Section 4\b/i, scoreOptions: WORK_HABITS, questionCount: 5 },
            // Not scored. The interviewer marks any "no" to discuss before deciding.
            {
                key: 'S5', heading: /^Section 5\b/i, scoreOptions: null, minQuestions: 1, autoNumber: true, flag: 'discuss',
                columns: { prompt: ['what to tell them'], answerKey: ["what you're listening for", 'what you’re listening for'] },
            },
            {
                key: 'S6', heading: /^Section 6\b/i, scoreOptions: null, minQuestions: 1, autoNumber: true, flag: false,
                columns: { answerKey: ['a curious candidate might say'] },
            },
        ],
        scoring: {
            engine: 'aptitude',
            written: ['S1', 'S2', 'S3'],
            habits: 'S4',
            // "Work habits 8+ and written 10+" / "Work habits 6+ and written 6+" / otherwise.
            strong: { habits: 8, written: 10 },
            shot: { habits: 6, written: 6 },
            outcomes: {
                strong: 'Strong apprentice candidate. Hire if the reality check went fine. Pair them with a patient lead from day one.',
                shot: 'Worth a shot with close supervision. The habits are there; the gaps can be taught.',
                notFit: 'Not a fit right now. Habits are hard to coach. A very low written score usually means the basics need work before the field.',
            },
            // The Apprentice & Green Candidate Character Assessment "replaces
            // Section 4. For that assessment's work habits score, use 8 for a
            // Strong result, 6 for Check closely and 0 for Not ready." Used when
            // the application already has a completed one.
            habitsFromKit: { slug: 'apprentice-character', scores: { strong: 8, check: 6, notReady: 0 } },
            redFlagSection: 'S5',
            redFlagAdjustments: {
                none: null,
                one: 'Discuss this answer with the candidate before you decide.',
                twoPlus: 'Discuss these answers with the candidate before you decide.',
            },
            skillProfile: null,
        },
    },
];

const BY_SLUG = new Map(DEFINITIONS.map(d => [d.slug, d]));

function getDefinition(slug) {
    return BY_SLUG.get(slug) || null;
}

module.exports = { DEFINITIONS, getDefinition, ZERO_TO_TWO, SCALE_FROM_DOC };
