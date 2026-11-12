// Synthetic kit content for tests. Built from the definitions' structure only:
// every question/answer string is a placeholder. Real kit content never goes
// in this repo (it's public).
const { getDefinition } = require('../../services/interviewKits/definitions');

function syntheticContent(slug, { bsCount = 5 } = {}) {
    const def = getDefinition(slug);
    return {
        title: def.title,
        sections: def.sections.map(spec => {
            const count = spec.questionCount || bsCount;
            return {
                key: spec.key,
                title: `${spec.key} section`,
                scoreOptions: spec.scoreOptions || null,
                questions: Array.from({ length: count }, (_, i) => {
                    const key = `${spec.key}.Q${i + 1}`;
                    return {
                        key,
                        number: String(i + 1),
                        prompt: `placeholder prompt ${key}`,
                        answerKey: `placeholder key ${key}`,
                    };
                }),
            };
        }),
    };
}

/** Answers giving `scores[i]` to question i+1 of a section (null = unscored). */
function sectionAnswers(sectionKey, scores) {
    const out = {};
    scores.forEach((s, i) => {
        if (s !== null && s !== undefined) out[`${sectionKey}.Q${i + 1}`] = { score: s, notes: '', redFlag: false };
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
