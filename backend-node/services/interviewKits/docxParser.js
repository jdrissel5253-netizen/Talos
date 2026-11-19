/**
 * Turns an uploaded kit document (.docx) into structured kit content and
 * validates it against the kit's definition. Uploads that don't match the
 * expected structure are rejected with specific errors instead of being
 * stored half-right.
 */
const crypto = require('crypto');
const mammoth = require('mammoth');
const { SCALE_FROM_DOC } = require('./definitions');

// ─── HTML → blocks ───────────────────────────────────────────────────────────

const decode = (s) => s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

/** Inline HTML → plain text. Paragraph breaks inside a cell become newlines. */
function toText(html) {
    const withBreaks = html
        .replace(/<\/p>\s*<p[^>]*>/g, '\n')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<\/li>\s*<li[^>]*>/g, '\n');
    return decode(withBreaks.replace(/<[^>]+>/g, ''))
        .split('\n')
        .map(l => l.replace(/[ \t ]+/g, ' ').trim())
        .filter(Boolean)
        .join('\n');
}

function htmlToBlocks(html) {
    const blocks = [];
    const re = /<(h[1-6]|p|table|ul|ol)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g;
    let m;
    while ((m = re.exec(html))) {
        const [, tag, inner] = m;
        if (tag === 'table') {
            const rows = (inner.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || []).map(row =>
                (row.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/g) || []).map(toText));
            blocks.push({ type: 'table', rows });
        } else if (tag === 'ul' || tag === 'ol') {
            for (const li of inner.match(/<li[^>]*>[\s\S]*?<\/li>/g) || []) {
                const text = toText(li);
                if (text) blocks.push({ type: 'li', text });
            }
        } else if (tag[0] === 'h') {
            blocks.push({ type: 'h', level: Number(tag[1]), text: toText(inner) });
        } else {
            const text = toText(inner);
            if (text) blocks.push({ type: 'p', text });
        }
    }
    return blocks;
}

/** Splits blocks into the H1 title, preamble and H2 sections. */
function groupSections(blocks) {
    let title = null;
    const preamble = [];
    const sections = [];
    for (const b of blocks) {
        if (b.type === 'h' && b.level === 1 && title === null) { title = b.text; continue; }
        if (b.type === 'h' && b.level === 2) { sections.push({ heading: b.text, blocks: [] }); continue; }
        if (sections.length === 0) preamble.push(b);
        else sections[sections.length - 1].blocks.push(b);
    }
    return { title, preamble, sections };
}

// ─── blocks → kit content ────────────────────────────────────────────────────

const SOURCE_NOTE = /^(Verified|Second pass|Full-document pass|Sourcing)\b/i;
// Some source docs still carry ⚠/(critical) markers. Critical questions are
// not used, so the marker is only stripped from the prompt text.
const CRITICAL_MARK = /^\s*(⚠️?|\(critical\))\s*/i;

const COLUMN_ALIASES = {
    number: ['#'],
    prompt: ['question'],
    answerKey: ['strong answer includes', 'strong answer', 'honest answer'],
    redFlags: ['red flags', 'red flag'],
};

function mapColumns(header, extra = {}) {
    const norm = header.map(h => h.toLowerCase().trim());
    const map = {};
    for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
        const all = [...aliases, ...(extra[field] || [])];
        const idx = norm.findIndex(h => all.includes(h));
        if (idx >= 0) map[field] = idx;
    }
    // Any other column becomes a labelled detail (e.g. "What it catches").
    const known = new Set(Object.values(map));
    map.details = header.map((h, i) => ({ label: h.trim(), idx: i })).filter(c => !known.has(c.idx) && c.label);
    return map;
}

function lineText(b) {
    if (b.type === 'table') return b.rows.map(r => r.join(' | ')).join('\n');
    return b.text;
}

function buildQuestionSection(spec, docSection, errors) {
    const tables = docSection.blocks.filter(b => b.type === 'table');
    if (tables.length !== 1) {
        errors.push(`"${docSection.heading}" should contain exactly one question table (found ${tables.length}).`);
        return null;
    }
    const tableIdx = docSection.blocks.indexOf(tables[0]);
    const before = docSection.blocks.slice(0, tableIdx).filter(b => b.type !== 'h').map(lineText);
    // After the table: usage notes, then source-check notes. Once a source
    // paragraph ("Verified…", "Second pass…") starts, everything after it in
    // the section (including its bullet lists) is source material.
    const notes = [];
    const sourceNotes = [];
    let inSources = false;
    for (const b of docSection.blocks.slice(tableIdx + 1)) {
        if (b.type === 'h') continue;
        const text = lineText(b);
        if (SOURCE_NOTE.test(text)) inSources = true;
        (inSources ? sourceNotes : notes).push(text);
    }

    const [header, ...rows] = tables[0].rows;
    const cols = mapColumns(header || [], spec.columns);
    // Some tables have no "#" column (e.g. a job reality checklist): number rows in order.
    if ((cols.number === undefined && !spec.autoNumber) || cols.prompt === undefined) {
        errors.push(`"${docSection.heading}" table needs "#" and "Question" columns.`);
        return null;
    }

    const questions = [];
    rows.forEach((cells, i) => {
        const rawNum = cols.number === undefined ? String(i + 1) : (cells[cols.number] || '').trim();
        const numMatch = rawNum.match(/^(\d+)/);
        let prompt = (cells[cols.prompt] || '').trim();
        prompt = prompt.replace(CRITICAL_MARK, '').trim();
        if (!numMatch) {
            errors.push(`"${docSection.heading}" row ${i + 1} has no question number.`);
            return;
        }
        if (!prompt) errors.push(`"${docSection.heading}" Q${numMatch[1]} has no question text.`);
        const answerKey = cols.answerKey !== undefined ? (cells[cols.answerKey] || '').trim() : '';
        const redFlags = cols.redFlags !== undefined ? (cells[cols.redFlags] || '').trim() : '';
        if (spec.scoreOptions && !answerKey) {
            errors.push(`"${docSection.heading}" Q${numMatch[1]} has no answer key.`);
        }
        const details = cols.details
            .map(c => ({ label: c.label, text: (cells[c.idx] || '').trim() }))
            .filter(d => d.text);
        const ownOptions = spec.questionScoreOptions && spec.questionScoreOptions[Number(numMatch[1])];
        questions.push({
            key: `${spec.key}.Q${numMatch[1]}`,
            number: numMatch[1],
            // A question can use its own scale (e.g. half credit on one question).
            ...(ownOptions && { scoreOptions: ownOptions }),
            prompt,
            ...(answerKey && { answerKey }),
            ...(redFlags && { redFlags }),
            ...(details.length && { details }),
        });
    });

    // Numbering must run first..n with no gaps or repeats. Most kits restart
    // at 1 in each section; character kits number straight through (1-9).
    const first = spec.firstNumber || 1;
    questions.forEach((q, i) => {
        if (Number(q.number) !== first + i) {
            errors.push(`"${docSection.heading}" questions should be numbered ${first} to ${first + questions.length - 1}; found ${q.number} in position ${i + 1}.`);
        }
    });
    if (spec.questionCount && questions.length !== spec.questionCount) {
        errors.push(`"${docSection.heading}" should have ${spec.questionCount} questions (found ${questions.length}).`);
    }
    if (spec.minQuestions && questions.length < spec.minQuestions) {
        errors.push(`"${docSection.heading}" should have at least ${spec.minQuestions} question.`);
    }

    return {
        key: spec.key,
        title: docSection.heading,
        ...(before.length && { description: before.join('\n\n') }),
        scoreOptions: spec.scoreOptions || null,
        ...(spec.flag !== undefined && { flag: spec.flag }),
        questions,
        notes,
        sourceNotes,
    };
}

// ─── character kits ──────────────────────────────────────────────────────────
// Layout: "How to use this", "How to run and score it" (scale + result tables),
// "Part 1..3" question tables, "Scorecard and guardrails", and an internal
// "Sources and open items" section that is never shown to companies.

const isTable = b => b.type === 'table';
const headerIs = (b, ...names) => isTable(b) && b.rows[0] &&
    names.every((n, i) => (b.rows[0][i] || '').trim().toLowerCase() === n);

/** Critical questions are not used, so any sentence about them is dropped. */
function withoutCritical(text) {
    if (/^Critical questions?\b/i.test(text)) return '';
    return text.split(/(?<=[.!?])\s+/).filter(sentence => !/critical/i.test(sentence)).join(' ').trim();
}

/** Reads the 0-3 "Score / What it means" table into score options. */
function readScoreScale(section, errors) {
    const table = section && section.blocks.find(b => headerIs(b, 'score', 'what it means'));
    if (!table) {
        errors.push('"How to run and score it" needs a "Score / What it means" table.');
        return null;
    }
    const options = table.rows.slice(1).map(([value, description]) => ({
        value: Number((value || '').trim()),
        label: (value || '').trim(),
        description: withoutCritical((description || '').trim()),
    })).sort((a, b) => a.value - b.value);
    const values = options.map(o => o.value).join(',');
    if (values !== '0,1,2,3') {
        errors.push(`The score table should list scores 0, 1, 2 and 3 (found ${values || 'none'}).`);
        return null;
    }
    return options;
}

/** The document's scorecard table must agree with the kit's scoring rules. */
function checkScorecard(section, definition, errors) {
    const table = section && section.blocks.find(b => headerIs(b, 'part', 'questions', 'max', 'minimum'));
    if (!table) {
        errors.push('"Scorecard and guardrails" needs a "Part / Questions / Max / Minimum" table.');
        return;
    }
    const partRows = table.rows.slice(1).filter(r => !/^total$/i.test((r[0] || '').trim()));
    definition.scoring.parts.forEach((part, i) => {
        const docMin = Number((partRows[i]?.[3] || '').trim());
        if (docMin !== part.min) {
            errors.push(`The scorecard lists a minimum of ${partRows[i]?.[3] || 'nothing'} for part ${i + 1}; Talos scores this kit with ${part.min}. Ask for the scoring rules to be updated before uploading.`);
        }
    });
}

function characterContent(definition, sections, errors) {
    const find = re => sections.find(s => re.test(s.heading));
    const howTo = find(/^How to use/i);
    const howToRun = find(/^How to run/i);
    const scorecard = find(/^Scorecard/i);

    const scale = readScoreScale(howToRun, errors);
    if (scorecard) checkScorecard(scorecard, definition, errors);
    else errors.push('Missing "Scorecard and guardrails" section.');

    const textLines = (section, skip) => (section ? section.blocks : [])
        .filter(b => b.type !== 'h' && !isTable(b))
        .map(lineText)
        .filter(t => !skip.test(t))
        .map(withoutCritical)
        .filter(Boolean);

    const { strongMark, checkMark, parts } = definition.scoring;
    const max = definition.sections.reduce((n, s) => n + s.questionCount * 3, 0);
    const resultLine = `Result: Strong is ${strongMark}-${max} with every part at its minimum. ` +
        `Check closely is ${checkMark}-${strongMark - 1}, or ${strongMark}+ with a part below its minimum. ` +
        `Not ready is under ${checkMark}. Part minimums: ${parts.map((p, i) => `Part ${i + 1}: ${p.min}`).join(', ')}.`;

    const howToLines = textLines(howTo, /^$/);
    return {
        scale,
        summary: howToLines[0] || null,
        howToUse: [...howToLines.slice(1), resultLine, ...textLines(howToRun, /^Part minimums\b/i)],
        // The scorecard itself is computed by Talos; keep only the rules.
        guardrails: textLines(scorecard, /^(☐|Result:|Complete one scorecard)/i),
        omit: [howTo, howToRun, scorecard, find(/^Sources\b/i)].filter(Boolean).map(s => s.heading),
    };
}

/**
 * @returns {{ content: object|null, errors: string[], sha256: string|null }}
 */
function buildKitContent(blocks, definition) {
    const errors = [];
    const { title, preamble, sections } = groupSections(blocks);

    if (!title) errors.push('The document has no title (Heading 1).');
    else if (!definition.docTitle.test(title)) {
        errors.push(`This looks like "${title}", not the ${definition.title}. Upload it to the matching kit.`);
    }

    const dateLine = preamble.find(b => b.type === 'p' && /\b\d{4}\b/.test(b.text));
    const versionDate = dateLine ? dateLine.text.split('·')[0].trim() : null;

    const howTo = sections.find(s => /^How to use/i.test(s.heading));
    const howToLines = howTo ? howTo.blocks.filter(b => b.type !== 'h').map(lineText) : [];
    const character = definition.layout === 'character' ? characterContent(definition, sections, errors) : null;

    const usedHeadings = new Set(character ? character.omit : howTo ? [howTo.heading] : []);
    const outSections = [];
    for (const rawSpec of definition.sections) {
        const spec = rawSpec.scoreOptions === SCALE_FROM_DOC
            ? { ...rawSpec, scoreOptions: character && character.scale }
            : rawSpec;
        if (rawSpec.scoreOptions === SCALE_FROM_DOC && !spec.scoreOptions) continue; // scale error already reported
        const docSection = sections.find(s => spec.heading.test(s.heading));
        if (!docSection) {
            errors.push(`Missing section matching "${spec.heading.source.replace(/^\^|\\b$/g, '')}".`);
            continue;
        }
        usedHeadings.add(docSection.heading);
        const built = buildQuestionSection(spec, docSection, errors);
        if (built && character) {
            built.notes = built.notes.map(withoutCritical).filter(Boolean);
            if (built.description) built.description = withoutCritical(built.description);
        }
        if (built) outSections.push(built);
    }


    // Scoring and pay sections are not shown as content: scoring is computed
    // from the definition, and pay guidance is off by default.
    const extraSections = sections
        .filter(s => !usedHeadings.has(s.heading) && !/^Scoring\b/i.test(s.heading))
        .map(s => ({ title: s.heading, lines: s.blocks.filter(b => b.type !== 'h').map(lineText) }))
        .filter(s => s.lines.length);

    if (errors.length) return { content: null, errors, sha256: null };

    const content = {
        title: title,
        versionDate,
        summary: character ? character.summary : howToLines[0] || null,
        howToUse: character ? character.howToUse : howToLines.slice(1),
        guardrails: character ? character.guardrails : [],
        sections: outSections,
        extraSections,
    };
    const sha256 = crypto.createHash('sha256').update(JSON.stringify(content)).digest('hex');
    return { content, errors: [], sha256 };
}

async function parseKitDocx(buffer, definition) {
    let html;
    try {
        ({ value: html } = await mammoth.convertToHtml({ buffer }));
    } catch (err) {
        return { content: null, errors: [`Could not read the document: ${err.message}`], sha256: null };
    }
    return buildKitContent(htmlToBlocks(html), definition);
}

module.exports = { parseKitDocx, buildKitContent, htmlToBlocks, groupSections };
