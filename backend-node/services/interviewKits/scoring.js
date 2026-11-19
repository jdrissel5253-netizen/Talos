/**
 * Interview scoring. Pure functions: (scoring rules, kit content, answers) →
 * result. Every rule comes from the kit's definition, which is transcribed
 * from its source document.
 *
 * The result is a recommendation only. Nothing here changes a candidate's
 * pipeline status, and no outcome ever rejects anyone automatically.
 */

const RULES_VERSION = 1;

/** A question's score options: its own scale if it has one, else its section's. */
function optionsFor(section, question) {
    if (!section.scoreOptions) return null;
    return (question && question.scoreOptions) || section.scoreOptions;
}

const maxOf = options => (options ? Math.max(...options.map(o => o.value)) : 0);

/** A score counts only if it's one of the question's allowed values. */
function validScore(section, answer, question) {
    const options = optionsFor(section, question);
    if (!options || !answer || answer.score === null || answer.score === undefined) return null;
    return options.some(o => o.value === answer.score) ? answer.score : null;
}

function sectionStats(section, answers) {
    let score = 0;
    let answered = 0;
    let max = 0;
    for (const q of section.questions) {
        const s = validScore(section, answers[q.key], q);
        if (s !== null) { score += s; answered += 1; }
        max += maxOf(optionsFor(section, q));
    }
    return {
        key: section.key,
        title: section.title,
        score,
        answered,
        total: section.questions.length,
        max,
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
            const q = section.questions.find(x => x.key === key);
            const s = validScore(section, answers[key], q);
            if (s !== null) { score += s; answered += 1; max += maxOf(optionsFor(section, q)); }
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

// ─── character (trait) assessments ───────────────────────────────────────────
// Every question is scored 0-3. "Strong: 22-27, every part at its minimum."
// "Check closely: 16-21, or 22+ with a part below its minimum." "Not ready:
// Under 16." Critical questions are not used.

function scoreTrait(rules, content, answers) {
    const notes = [];
    const sections = rules.parts.map(part => {
        const section = content.sections.find(s => s.key === part.section);
        if (!section) return null;
        const st = sectionStats(section, answers);
        return { ...st, passMark: part.min, passed: st.answered === st.total ? st.score >= part.min : null, counted: true };
    }).filter(Boolean);

    const score = sections.reduce((n, s) => n + s.score, 0);
    const max = sections.reduce((n, s) => n + s.max, 0);
    const answered = sections.reduce((n, s) => n + s.answered, 0);
    const scorable = sections.reduce((n, s) => n + s.total, 0);
    const total = { score, max, answered, scorable };

    if (sections.length !== rules.parts.length) {
        return { outcome: null, incompleteReason: 'This kit version is missing a scored part.', sections, notes, total };
    }
    if (answered < scorable) {
        const left = scorable - answered;
        return { outcome: null, incompleteReason: `${left} question${left === 1 ? '' : 's'} still to score.`, sections, notes, total };
    }

    const belowMin = sections.filter(s => s.score < s.passMark);
    let key;
    if (score < rules.checkMark) key = 'notReady';
    else if (score >= rules.strongMark && belowMin.length === 0) key = 'strong';
    else key = 'check';

    if (key !== 'notReady') {
        belowMin.forEach(s => notes.push(`${s.title} is below its minimum (${s.score} of ${s.max}; needs ${s.passMark}).`));
    }
    return { outcome: { key, label: rules.outcomes[key] }, incompleteReason: null, sections, notes, total };
}

// ─── apprentice aptitude ─────────────────────────────────────────────────────
// "Written score (Sections 1-3): out of 15. Work habits score (Section 4): out
// of 10." Strong: "Work habits 8+ and written 10+". Worth a shot: "Work habits
// 6+ and written 6+". Not a fit: "Work habits under 6, or written under 6".
// When the application has a completed apprentice character interview, its
// result supplies the work habits score instead of Section 4 (8 / 6 / 0).

function scoreAptitude(rules, content, answers, context = {}) {
    const notes = [];
    const find = key => content.sections.find(s => s.key === key);
    const written = rules.written.map(find).filter(Boolean).map(s => ({ ...sectionStats(s, answers), counted: true }));
    const habitsSection = find(rules.habits);
    const habits = habitsSection ? { ...sectionStats(habitsSection, answers), counted: true } : null;

    const character = context.habitsFromKit || null;
    const fromCharacter = !!(character && rules.habitsFromKit && character.outcomeKey in rules.habitsFromKit.scores);
    if (fromCharacter && habits) habits.counted = false;

    const sections = [...written, ...(habits ? [habits] : [])].map(s => ({ ...s, passMark: 0, passed: null }));
    const writtenScore = written.reduce((n, s) => n + s.score, 0);
    const writtenMax = written.reduce((n, s) => n + s.max, 0);
    const habitsScore = fromCharacter ? rules.habitsFromKit.scores[character.outcomeKey] : habits ? habits.score : 0;
    const aptitude = {
        written: { score: writtenScore, max: writtenMax },
        habits: {
            score: habitsScore,
            max: habits ? habits.max : 10,
            source: fromCharacter ? 'character' : 'section',
            ...(fromCharacter && { interviewId: character.interviewId }),
        },
    };
    if (fromCharacter) {
        const label = character.outcomeLabel ? ` (${character.outcomeLabel.split('.')[0]})` : '';
        notes.push(`Work habits score of ${habitsScore} comes from the completed ${character.title || 'character interview'}${label}. ${habits ? habits.title : 'Section 4'} isn't counted.`);
    }

    const result = (outcomeKey, incompleteReason) => ({
        outcome: outcomeKey ? { key: outcomeKey, label: rules.outcomes[outcomeKey] } : null,
        incompleteReason, sections, notes, aptitude,
    });

    if (written.length !== rules.written.length || (!habits && !fromCharacter)) {
        return result(null, 'This kit version is missing a scored section.');
    }
    const required = fromCharacter ? written : [...written, habits];
    const left = required.reduce((n, s) => n + (s.total - s.answered), 0);
    if (left > 0) return result(null, `${left} question${left === 1 ? '' : 's'} still to score.`);

    let key = 'notFit';
    if (habitsScore >= rules.strong.habits && writtenScore >= rules.strong.written) key = 'strong';
    else if (habitsScore >= rules.shot.habits && writtenScore >= rules.shot.written) key = 'shot';
    return result(key, null);
}

// ─── entry point ─────────────────────────────────────────────────────────────

const ENGINES = { leveled: scoreLeveled, gated: scoreGated, trait: scoreTrait, aptitude: scoreAptitude };

/**
 * context: optional facts from outside this interview, e.g.
 *   { habitsFromKit: { interviewId, title, outcomeKey, outcomeLabel } }
 */
function scoreInterview(rules, content, answers = {}, context = {}) {
    const engine = ENGINES[rules.engine];
    if (!engine) throw new Error(`Unknown scoring engine "${rules.engine}"`);
    const core = engine(rules, content, answers, context);
    const redFlags = rules.redFlagSection ? countRedFlags(content, rules.redFlagSection, answers) : 0;
    const allScored = content.sections
        .filter(s => s.scoreOptions)
        .every(s => s.questions.every(q => validScore(s, answers[q.key], q) !== null));

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
        ...(core.total && { total: core.total }),
        ...(core.aptitude && { aptitude: core.aptitude }),
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
        .filter(q => validScore(s, answers[q.key], q) !== null)
        .reduce((m, q) => m + maxOf(optionsFor(s, q)), 0), 0);
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

module.exports = { scoreInterview, scoreCustom, sectionStats, optionsFor, RULES_VERSION };
