/**
 * Turns an uploaded kit document (.docx) into structured kit content and
 * validates it against the kit's definition. Uploads that don't match the
 * expected structure are rejected with specific errors instead of being
 * stored half-right.
 */
const crypto = require('crypto');
const mammoth = require('mammoth');

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

function mapColumns(header) {
    const norm = header.map(h => h.toLowerCase().trim());
    const map = {};
    for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
        const idx = norm.findIndex(h => aliases.includes(h));
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
    const cols = mapColumns(header || []);
    if (cols.number === undefined || cols.prompt === undefined) {
        errors.push(`"${docSection.heading}" table needs "#" and "Question" columns.`);
        return null;
    }

    const questions = [];
    rows.forEach((cells, i) => {
        const rawNum = (cells[cols.number] || '').trim();
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
        questions.push({
            key: `${spec.key}.Q${numMatch[1]}`,
            number: numMatch[1],
            prompt,
            ...(answerKey && { answerKey }),
            ...(redFlags && { redFlags }),
            ...(details.length && { details }),
        });
    });

    // Numbering must run 1..n with no gaps or repeats.
    questions.forEach((q, i) => {
        if (Number(q.number) !== i + 1) {
            errors.push(`"${docSection.heading}" questions should be numbered 1 to ${questions.length}; found ${q.number} in position ${i + 1}.`);
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
        questions,
        notes,
        sourceNotes,
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

    const usedHeadings = new Set(howTo ? [howTo.heading] : []);
    const outSections = [];
    for (const spec of definition.sections) {
        const docSection = sections.find(s => spec.heading.test(s.heading));
        if (!docSection) {
            errors.push(`Missing section matching "${spec.heading.source.replace(/^\^|\\b$/g, '')}".`);
            continue;
        }
        usedHeadings.add(docSection.heading);
        const built = buildQuestionSection(spec, docSection, errors);
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
        summary: howToLines[0] || null,
        howToUse: howToLines.slice(1),
        guardrails: [],
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
