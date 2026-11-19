// Synthetic kit content for tests. Built from the definitions' structure only:
// every question/answer string is a placeholder. Real kit content never goes
// in this repo (it's public).
const { getDefinition, SCALE_FROM_DOC } = require('../../services/interviewKits/definitions');

// Character kits read their 0-3 scale from the document.
const ZERO_TO_THREE = [0, 1, 2, 3].map(value => ({ value, label: String(value), description: `placeholder ${value}` }));

function syntheticContent(slug, { bsCount = 5 } = {}) {
    const def = getDefinition(slug);
    return {
        title: def.title,
        sections: def.sections.map(spec => {
            const count = spec.questionCount || bsCount;
            return {
                key: spec.key,
                title: `${spec.key} section`,
                scoreOptions: spec.scoreOptions === SCALE_FROM_DOC ? ZERO_TO_THREE : spec.scoreOptions || null,
                questions: Array.from({ length: count }, (_, i) => {
                    const n = (spec.firstNumber || 1) + i;
                    const key = `${spec.key}.Q${n}`;
                    return {
                        key,
                        number: String(n),
                        prompt: `placeholder prompt ${key}`,
                        answerKey: `placeholder key ${key}`,
                    };
                }),
            };
        }),
    };
}

/** Answers giving `scores[i]` to question first+i of a section (null = unscored). */
function sectionAnswers(sectionKey, scores, first = 1) {
    const out = {};
    scores.forEach((s, i) => {
        if (s !== null && s !== undefined) out[`${sectionKey}.Q${first + i}`] = { score: s, notes: '', redFlag: false };
    });
    return out;
}

/** Ten questions totalling `total` points (0-2 each). */
function tenTotalling(total) {
    const scores = Array(10).fill(0);
    let left = total;
    for (let i = 0; i < 10 && left > 0; i++) { scores[i] = Math.min(2, left); left -= scores[i]; }
    return scores;
}

function redFlags(n, sectionKey = 'BS') {
    const out = {};
    for (let i = 1; i <= n; i++) out[`${sectionKey}.Q${i}`] = { score: null, notes: '', redFlag: true };
    return out;
}

module.exports = { syntheticContent, sectionAnswers, tenTotalling, redFlags };
