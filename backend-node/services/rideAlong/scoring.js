/**
 * Ride-along scorecard scoring. Pure functions, no database.
 *
 * Every number that shapes a result (part weights, category weights, bands,
 * the cap value, the safety flag type) comes from the template's config.
 *
 *   step / item:  2, 1, 0 or 'na'. N/A and unscored are left out.
 *   task:         sum / (2 x steps scored). A 0 on a safety step sets the task
 *                 to 0 and adds a red flag of config.safetyFlagType.
 *   Part 1:       average of the scored tasks.
 *   category:     sum / (2 x items scored).
 *   Part 2:       weighted average of the scored categories. An all-N/A
 *                 category's weight is spread over the rest in proportion to
 *                 their own weights (renormalised).
 *   total:        round(100 x weighted average of Part 1 and Part 2). With only
 *                 one part scored, the total is that part alone (partial).
 *   red flags:    applied last. Any FAIL makes the result Fail; any CAP limits
 *                 the total to config.capValue.
 */

const SCORE_VALUES = [0, 1, 2];
const NA = 'na';

const isPoints = (v) => SCORE_VALUES.includes(v);

/** 0..1 fraction to a whole-number percentage, immune to float noise like 79.49999999. */
const toPct = (x) => Math.round(Number((x * 100).toFixed(6)));

const stepKey = (taskCode, step) => `${taskCode}.${step.key}`;
const itemKey = (category, item) => `${category.key}.${item.key}`;

/** Sum / (2 x scored). null when nothing was scored. */
function fraction(entries) {
    const scored = entries.filter(isPoints);
    if (!scored.length) return null;
    return scored.reduce((a, b) => a + b, 0) / (2 * scored.length);
}

const scoreOf = (map, key) => map?.[key]?.score;

function scoreTask(task, stepScores) {
    const values = task.steps.map(s => scoreOf(stepScores, stepKey(task.code, s)));
    const safetyZeros = task.steps.filter((s, i) => s.safety && values[i] === 0);
    const scoredCount = values.filter(isPoints).length;
    const score = safetyZeros.length ? 0 : fraction(values);
    return {
        code: task.code,
        name: task.name,
        score,
        stepsScored: scoredCount,
        stepsNa: values.filter(v => v === NA).length,
        stepsTotal: task.steps.length,
        safetyZero: safetyZeros.length > 0,
        safetyZeroSteps: safetyZeros.map(s => s.key),
    };
}

function scoreCategories(categories, itemScores) {
    const raw = categories.map(c => {
        const values = c.items.map(it => scoreOf(itemScores, itemKey(c, it)));
        return {
            key: c.key,
            name: c.name,
            weight: c.weight,
            score: fraction(values),
            itemsScored: values.filter(isPoints).length,
            itemsTotal: c.items.length,
        };
    });
    const scoredWeight = raw.filter(c => c.score !== null).reduce((a, c) => a + c.weight, 0);
    const categoriesOut = raw.map(c => ({
        ...c,
        effectiveWeight: c.score !== null && scoredWeight > 0 ? c.weight / scoredWeight : 0,
    }));
    const part2 = scoredWeight > 0
        ? categoriesOut.reduce((a, c) => a + (c.score !== null ? c.score * c.effectiveWeight : 0), 0)
        : null;
    return { categories: categoriesOut, part2 };
}

function bandFor(total, bands) {
    const sorted = [...bands].sort((a, b) => b.min - a.min);
    const band = sorted.find(b => total >= b.min);
    return band ? { key: band.key, label: band.label } : null;
}

/**
 * @param {object}   args
 * @param {object[]} args.tasks       chosen task snapshots, in order
 * @param {object}   args.config      template version config
 * @param {object}   args.stepScores  { "T2.3": { score, note } }
 * @param {object}   args.itemScores  { "comm.1": { score, note } }
 * @param {object}   args.redFlags    { flagKey: { note } } ticked flags only
 */
function scoreEvaluation({ tasks, config, stepScores = {}, itemScores = {}, redFlags = {} }) {
    const taskResults = tasks.map(t => scoreTask(t, stepScores));
    const scoredTasks = taskResults.filter(t => t.score !== null);
    const part1 = scoredTasks.length
        ? scoredTasks.reduce((a, t) => a + t.score, 0) / scoredTasks.length
        : null;

    const { categories, part2 } = scoreCategories(config.categories, itemScores);

    const w1 = config.partWeights.part1;
    const w2 = config.partWeights.part2;
    let rawTotal = null;
    let partial = false;
    let partialPart = null;
    if (part1 !== null && part2 !== null) {
        rawTotal = toPct((w1 * part1 + w2 * part2) / (w1 + w2));
    } else if (part1 !== null) {
        rawTotal = toPct(part1); partial = true; partialPart = 'part1';
    } else if (part2 !== null) {
        rawTotal = toPct(part2); partial = true; partialPart = 'part2';
    }

    // Red flags: ticked ones from the template, plus one per safety step scored 0.
    const flags = config.redFlags
        .filter(f => redFlags[f.key])
        .map(f => ({ key: f.key, text: f.text, type: f.type, note: redFlags[f.key].note || '', auto: false }));
    for (const t of taskResults) {
        const task = tasks.find(x => x.code === t.code);
        for (const sk of t.safetyZeroSteps) {
            const step = task.steps.find(s => s.key === sk);
            flags.push({
                key: `safety:${t.code}.${sk}`,
                text: `Safety step scored 0 on ${t.code} ${t.name}: ${step.text}`,
                type: config.safetyFlagType,
                note: stepScores[`${t.code}.${sk}`]?.note || '',
                auto: true,
                taskCode: t.code,
                stepKey: sk,
            });
        }
    }

    const failed = flags.some(f => f.type === 'FAIL');
    const capFlag = flags.some(f => f.type === 'CAP');
    let total = rawTotal;
    let capped = false;
    if (capFlag && total !== null && total > config.capValue) {
        total = config.capValue;
        capped = true;
    }

    let band = null;
    if (failed) band = { key: 'fail', label: 'Fail' };
    else if (total !== null) band = bandFor(total, config.bands);

    const chosenSteps = tasks.reduce((n, t) => n + t.steps.length, 0);
    const scoredOrNaSteps = taskResults.reduce((n, t) => n + t.stepsScored + t.stepsNa, 0);
    const allItems = config.categories.reduce((n, c) => n + c.items.length, 0);
    const scoredOrNaItems = config.categories.reduce((n, c) => n + c.items.filter(it => {
        const v = scoreOf(itemScores, itemKey(c, it));
        return isPoints(v) || v === NA;
    }).length, 0);

    return {
        tasks: taskResults.map(({ safetyZeroSteps, ...t }) => t),
        part1,
        categories,
        part2,
        rawTotal,
        total,
        partial,
        partialPart,
        redFlags: flags,
        failed,
        capped,
        band,
        unscored: { steps: chosenSteps - scoredOrNaSteps, items: allItems - scoredOrNaItems },
    };
}

module.exports = { scoreEvaluation, toPct, stepKey, itemKey, SCORE_VALUES, NA };
