const { buildKitContent, htmlToBlocks } = require('../services/interviewKits/docxParser');
const { getDefinition } = require('../services/interviewKits/definitions');

// Synthetic documents shaped like the real kit .docx files (as mammoth renders
// them). All text is placeholder.
const row = (...cells) => `<tr>${cells.map(c => `<td><p>${c}</p></td>`).join('')}</tr>`;
const qTable = (n, { mark = () => '' } = {}) =>
    `<table>${row('#', 'Question', 'Strong answer includes', 'Red flags')}${
        Array.from({ length: n }, (_, i) => row(String(i + 1), `${mark(i + 1)}Prompt ${i + 1}`, `Key ${i + 1}`, `Flag ${i + 1}`)).join('')
    }</table>`;
const bsTable = (n) =>
    `<table>${row('#', 'Question', 'What it catches', 'Honest answer', 'Red flag')}${
        Array.from({ length: n }, (_, i) => row(String(i + 1), `BS ${i + 1}`, `Catches ${i + 1}`, `Honest ${i + 1}`, `Red ${i + 1}`)).join('')
    }</table>`;

function leveledDoc({ title = 'PM Technician Question Bank (Residential)', l1Count = 10 } = {}) {
    return `<h1>${title}</h1><p>Oct 26, 2026 · @Someone</p>
<h2>How to use this</h2><p>Summary line.</p><ul><li>Bullet one</li><li>Bullet two</li></ul>
<h2>Level 1: Entry</h2><p>L1 description</p>${qTable(l1Count)}<p>Verified Oct 26, 2026: source note.</p>
<h2>Level 2: Experienced</h2>${qTable(10)}
<h2>Level 3: Senior</h2>${qTable(10)}
<h2>BS-detector questions</h2><p>BS description</p>${bsTable(5)}<p>Use question 1 sparingly.</p>
<h2>Scoring: level and starting pay</h2><table>${row('Result', 'Placement', 'Starting pay (owner sets)')}${row('Under 14', 'Helper', '$ ___ /hr')}</table>
<h2>Where to validate</h2><ul><li>Ask techs</li></ul>`;
}

function leadDoc({ title, criticalMarks = [] }) {
    const mark = (n) => (criticalMarks.includes(n) ? '⚠ ' : '');
    return `<h1>${title}</h1><p>Oct 27, 2026 · @Someone</p>
<h2>How to use this</h2><p>Summary.</p>
<h2>Part 1: Technical gate</h2>${qTable(10)}
<h2>Part 2: Lead questions</h2>${qTable(10, { mark })}<p>Second pass, Oct 27, 2026 (full documents opened):</p><ul><li>Q1: checked.</li></ul><p>Vendor caveat paragraph.</p>
<h2>BS-detector questions</h2>${bsTable(5)}
<h2>Scoring: three outcomes</h2><p>Pay guidance (optional, off by default).</p>`;
}

const parse = (html, slug) => buildKitContent(htmlToBlocks(html), getDefinition(slug));

describe('docx parser: structure', () => {
    test('a well-formed leveled bank parses into keyed sections', () => {
        const { content, errors, sha256 } = parse(leveledDoc(), 'pm-technician');
        expect(errors).toEqual([]);
        expect(sha256).toMatch(/^[0-9a-f]{64}$/);
        expect(content.sections.map(s => s.key)).toEqual(['L1', 'L2', 'L3', 'BS']);
        const q = content.sections[0].questions[2];
        expect(q).toMatchObject({ key: 'L1.Q3', number: '3', prompt: 'Prompt 3', answerKey: 'Key 3', redFlags: 'Flag 3' });
        expect(content.versionDate).toBe('Oct 26, 2026');
        expect(content.summary).toBe('Summary line.');
        expect(content.howToUse).toEqual(['Bullet one', 'Bullet two']);
    });

    test('BS-detector questions are unscored and keep their extra columns', () => {
        const bs = parse(leveledDoc(), 'pm-technician').content.sections[3];
        expect(bs.scoreOptions).toBeNull();
        expect(bs.questions[0]).toMatchObject({ answerKey: 'Honest 1', redFlags: 'Red 1', details: [{ label: 'What it catches', text: 'Catches 1' }] });
        expect(bs.notes).toEqual(['Use question 1 sparingly.']);
    });

    test('source-check paragraphs (and lists after them) are separated from usage notes', () => {
        const { content } = parse(leadDoc({ title: 'Lead Technician Assessment' }), 'lead-technician');
        const p2 = content.sections.find(s => s.key === 'P2');
        expect(p2.notes).toEqual([]);
        expect(p2.sourceNotes).toHaveLength(3);
    });

    test('the scoring section, including any pay table, is never stored as content', () => {
        const { content } = parse(leveledDoc(), 'pm-technician');
        const json = JSON.stringify(content);
        expect(json).not.toMatch(/Starting pay|\/hr|\$ _/);
        expect(content.extraSections.map(s => s.title)).toEqual(['Where to validate']);
    });

    test('identical documents hash identically; a changed answer key changes the hash', () => {
        const a = parse(leveledDoc(), 'pm-technician').sha256;
        const b = parse(leveledDoc(), 'pm-technician').sha256;
        const c = parse(leveledDoc().replace('Key 3', 'Key three'), 'pm-technician').sha256;
        expect(a).toBe(b);
        expect(c).not.toBe(a);
    });
});

describe('docx parser: rejects documents that do not match the kit', () => {
    test('wrong document for the kit', () => {
        const { errors } = parse(leveledDoc({ title: 'Residential Installer Question Bank' }), 'pm-technician');
        expect(errors[0]).toMatch(/This looks like "Residential Installer Question Bank"/);
    });

    test('wrong question count', () => {
        const { errors, content } = parse(leveledDoc({ l1Count: 9 }), 'pm-technician');
        expect(content).toBeNull();
        expect(errors.join(' ')).toMatch(/should have 10 questions \(found 9\)/);
    });

    test('missing section', () => {
        const html = leveledDoc().replace(/<h2>Level 3[\s\S]*?(?=<h2>BS)/, '');
        expect(parse(html, 'pm-technician').errors.join(' ')).toMatch(/Missing section/);
    });

    test('a scored question with no answer key', () => {
        const html = leveledDoc().replace('<td><p>Key 4</p></td>', '<td><p></p></td>');
        expect(parse(html, 'pm-technician').errors.join(' ')).toMatch(/L1 Q4|Q4 has no answer key/);
    });

    test('critical markers in a document are stripped and ignored', () => {
        for (const [title, slug] of [['Commercial Lead Technician Assessment', 'commercial-lead-technician'], ['Lead Technician Assessment', 'lead-technician']]) {
            const r = parse(leadDoc({ title, criticalMarks: [3, 4, 7] }), slug);
            expect(r.errors).toEqual([]);
            const p2 = r.content.sections.find(s => s.key === 'P2');
            expect(p2.questions[2].prompt).toBe('Prompt 3'); // marker stripped
            expect(p2.questions.some(q => 'critical' in q)).toBe(false);
        }
    });
});
