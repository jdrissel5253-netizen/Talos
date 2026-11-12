/**
 * Interview scoring. Pure functions: (scoring rules, kit content, answers) →
 * result. Every rule comes from the kit's definition, which is transcribed
 * from its source document.
 *
 * The result is a recommendation only. Nothing here changes a candidate's
 * pipeline status, and no outcome ever rejects anyone automatically.
 */

const RULES_VERSION = 1;

function maxOption(section) {
    return section.scoreOptions ? Math.max(...section.scoreOptions.map(o => o.value)) : 0;
}

/** A score counts only if it's one of the section's allowed values. */
function validScore(section, answer) {
    if (!section.scoreOptions || !answer || answer.score === null || answer.score === undefined) return null;
    return section.scoreOptions.some(o => o.value === answer.score) ? answer.score : null;
}

function sectionStats(section, answers) {
    let score = 0;
    let answered = 0;
    for (const q of section.questions) {
        const s = validScore(section, answers[q.key]);
        if (s !== null) { score += s; answered += 1; }
    }
    return {
        key: section.key,
        title: section.title,
        score,
        answered,
        total: section.questions.length,
        max: section.questions.length * maxOption(section),
    };
}

function countRedFlags(content, sectionKey, answers) {
    const section = content.sections.find(s => s.key === sectionKey);
    if (!section) return 0;
    return section.questions.filter(q => answers[q.key]?.redFlag === true).length;
}

function redFlagGuidance(rules, count) {
    const a = rules.redFlagAdjustments || {};
    const text = count === 0 ? a.none : count === 1 ? a.one : a.twoPlus;
    return text || null;
}

function skillProfile(rules, content, answers) {
    if (!rules.skillProfile) return null;
    const sectionOf = new Map();
    content.sections.forEach(s => s.questions.forEach(q => sectionOf.set(q.key, s)));
    return rules.skillProfile.map(group => {
        let score = 0, answered = 0, max = 0;
        for (const key of group.questions) {
            const section = sectionOf.get(key);
            if (!section) continue;
            const s = validScore(section, answers[key]);
            if (s !== null) { score += s; answered += 1; max += maxOption(section); }
        }
        return { area: group.area, score, max, answered, total: group.questions.length };
    });
}

// ─── leveled banks ───────────────────────────────────────────────────────────
// "Start everyone at Level 1. Move up only after scoring 14 or more on the
// current level." "A candidate is placed at the highest level where they score
// 14 or more out of 20."

function scoreLeveled(rules, content, answers) {
    const stats = rules.levels.map(key => {
        const section = content.sections.find(s => s.key === key);
        return section ? sectionStats(section, answers) : null;
    });
    const notes = [];
    let placed = -1;
    let stoppedAt = rules.levels.length; // index of the level where evaluation stopped
    let incomplete = null;

    for (let i = 0; i < stats.length; i++) {
        const st = stats[i];
        if (!st) { incomplete = `Section ${rules.levels[i]} is missing from this kit version.`; stoppedAt = i; break; }
        if (st.answered === 0) {
            if (i === 0) incomplete = `${st.title} hasn't been scored yet.`;
            else notes.push(`${st.title} was not asked.`);
            stoppedAt = i;
            break;
        }
        if (st.answered < st.total) {
            incomplete = `${st.title} has ${st.total - st.answered} unscored question${st.total - st.answered === 1 ? '' : 's'}.`;
            stoppedAt = i;
            break;
        }
        if (st.score >= rules.passMark) { placed = i; continue; }
        stoppedAt = i;
        break;
    }

    // Levels after the stopping point don't count toward placement.
    for (let i = stoppedAt + 1; i < stats.length; i++) {
        if (stats[i] && stats[i].answered > 0 && !incomplete) {
            notes.push(`${stats[i].title} answers aren't counted: the kit only moves up after ${rules.passMark} or more on the level before it.`);
        }
    }

    const sections = stats.filter(Boolean).map((st, i) => ({
        ...st,
        passMark: rules.passMark,
        passed: st.answered === st.total ? st.score >= rules.passMark : null,
        counted: i <= stoppedAt,
    }));

    return {
        outcome: incomplete ? null : { label: rules.placements[placed + 1], levelsPassed: placed + 1 },
        incompleteReason: incomplete,
        sections,
        notes,
    };
}

// ─── gated two-part assessments ──────────────────────────────────────────────
// "The candidate must score 14 or more out of 20 to move on to Part 2."
// Outcomes: under 14 on Part 1 → not ready; 14+ on Part 1 and under 14 on
// Part 2 → ready with development; 14+ on both → ready now.

function scoreGated(rules, content, answers) {
    const find = key => content.sections.find(s => s.key === key);
    const p1Section = find(rules.gate.section);
    const p2Section = find(rules.second.section);
    const p1 = p1Section ? sectionStats(p1Section, answers) : null;
    const p2 = p2Section ? sectionStats(p2Section, answers) : null;
    const notes = [];

    const sections = [p1, p2].filter(Boolean).map(st => ({
        ...st,
        passMark: st.key === rules.gate.section ? rules.gate.passMark : rules.second.passMark,
        passed: st.answered === st.total ? st.score >= (st.key === rules.gate.section ? rules.gate.passMark : rules.second.passMark) : null,
        counted: true,
    }));

    const result = (outcomeKey, extra = {}) => ({
        outcome: outcomeKey ? { key: outcomeKey, label: rules.outcomes[outcomeKey] } : null,
        sections,
        notes,
        ...extra,
    });

    if (!p1 || !p2) return result(null, { incompleteReason: 'This kit version is missing a scored part.' });

    if (p1.answered < p1.total) {
        return result(null, { incompleteReason: `${p1.title} has ${p1.total - p1.answered} unscored question${p1.total - p1.answered === 1 ? '' : 's'}.` });
    }
    if (p1.score < rules.gate.passMark) {
        if (p2.answered > 0) notes.push(`${p2.title} isn't counted: ${p1.title} was under ${rules.gate.passMark}.`);
        sections.forEach(s => { if (s.key === p2.key) s.counted = false; });
        return result('notReady', { incompleteReason: null });
    }
    if (p2.answered < p2.total) {
        return result(null, { incompleteReason: `${p2.title} has ${p2.total - p2.answered} unscored question${p2.total - p2.answered === 1 ? '' : 's'}.` });
    }
    return result(p2.score < rules.second.passMark ? 'development' : 'readyNow', { incompleteReason: null });
}

// ─── entry point ─────────────────────────────────────────────────────────────

const ENGINES = { leveled: scoreLeveled, gated: scoreGated };

function scoreInterview(rules, content, answers = {}) {
    const engine = ENGINES[rules.engine];
    if (!engine) throw new Error(`Unknown scoring engine "${rules.engine}"`);
    const core = engine(rules, content, answers);
    const redFlags = rules.redFlagSection ? countRedFlags(content, rules.redFlagSection, answers) : 0;
    const allScored = content.sections
        .filter(s => s.scoreOptions)
        .every(s => s.questions.every(q => validScore(s, answers[q.key]) !== null));

    return {
        rulesVersion: RULES_VERSION,
        engine: rules.engine,
        recommendationOnly: true,
        outcome: core.outcome,
        incompleteReason: core.incompleteReason ?? null,
        allScored,
        sections: core.sections,
        redFlags: {
            count: redFlags,
            // Shown as guidance from the kit. Never applied automatically.
            guidance: redFlagGuidance(rules, redFlags),
        },
        skillProfile: skillProfile(rules, content, answers),
        notes: core.notes,
    };
}

/**
 * Custom interviews (hand-picked questions): scores are optional, and the
 * result is a plain total. No level placement, because the kits' placement
 * rules only hold when every question in a level is asked.
 */
function scoreCustom(content, answers = {}) {
    const sections = content.sections.map(s => ({
        ...sectionStats(s, answers), passMark: 0, passed: null, counted: true,
    }));
    const scorable = content.sections.filter(s => s.scoreOptions);
    const scorableCount = scorable.reduce((n, s) => n + s.questions.length, 0);
    const answered = sections.reduce((n, s) => n + s.answered, 0);
    const score = sections.reduce((n, s) => n + s.score, 0);
    const maxAnswered = scorable.reduce((n, s) => n + s.questions
        .filter(q => validScore(s, answers[q.key]) !== null).length * maxOption(s), 0);
    const redFlags = content.sections
        .reduce((n, s) => n + s.questions.filter(q => answers[q.key]?.redFlag === true).length, 0);

    return {
        rulesVersion: RULES_VERSION,
        engine: 'custom',
        recommendationOnly: true,
        outcome: null,
        incompleteReason: null,
        allScored: answered === scorableCount,
        sections,
        redFlags: { count: redFlags, guidance: null },
        skillProfile: null,
        notes: [],
        // score out of the max for the questions actually scored (scores are optional).
        total: { score, max: maxAnswered, answered, scorable: scorableCount },
    };
}

module.exports = { scoreInterview, scoreCustom, sectionStats, RULES_VERSION };
