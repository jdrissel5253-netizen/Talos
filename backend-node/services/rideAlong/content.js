/**
 * Validates ride-along scorecard content: the JSON bundle an admin uploads
 * (shared tasks + scorecard templates) and the tasks a company writes itself.
 *
 * Bundle shape:
 * {
 *   "tasks": [{ "code": "T2", "name": "...", "level": "Level 2", "time": "45 min",
 *               "equipment": ["..."], "roleTags": ["..."],
 *               "steps": [{ "text": "...", "twoLooksLike": "...", "safety": false }] }],
 *   "scorecards": [{ "slug": "residential-service-tech", "title": "...", "role": "...",
 *                    "tasks": ["T1", "T2"],
 *                    "partWeights": { "part1": 0.5, "part2": 0.5 },
 *                    "categories": [{ "key": "communication", "name": "...", "weight": 0.25,
 *                                     "items": [{ "text": "...", "twoLooksLike": "..." }] }],
 *                    "redFlags": [{ "key": "...", "text": "...", "type": "FAIL" | "CAP" }],
 *                    "bands": [{ "key": "confirms", "label": "...", "min": 80 }],
 *                    "capValue": 64,
 *                    "safetyFlagType": "FAIL" }]
 * }
 *
 * Step and item keys are assigned by position ("1", "2", ...). Every error is
 * collected and returned, so the admin sees them all at once.
 */

const CODE_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,39}$/;
const KEY_RE = /^[a-z0-9][a-z0-9_-]{0,59}$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,99}$/;
const FLAG_TYPES = ['FAIL', 'CAP'];

const LIMITS = {
    name: 200, text: 1000, twoLooksLike: 2000, short: 100, listItem: 200, listLength: 50,
    steps: 60, items: 60, categories: 20, redFlags: 60, bands: 10, tasks: 500, scorecards: 50,
};

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function str(errors, where, value, max, { required }) {
    if (value === undefined || value === null || value === '') {
        if (required) errors.push(`${where} is required`);
        return null;
    }
    if (typeof value !== 'string') { errors.push(`${where} must be text`); return null; }
    const t = value.trim();
    if (!t && required) { errors.push(`${where} is required`); return null; }
    if (t.length > max) errors.push(`${where} must be ${max} characters or fewer`);
    return t || null;
}

function strList(errors, where, value) {
    if (value === undefined || value === null) return [];
    if (!Array.isArray(value)) { errors.push(`${where} must be a list`); return []; }
    if (value.length > LIMITS.listLength) errors.push(`${where} has too many entries`);
    return value.map((v, i) => str(errors, `${where}[${i + 1}]`, v, LIMITS.listItem, { required: true })).filter(Boolean);
}

/** One task (shared or company). Returns normalised content without the code. */
function validateTask(raw, where, errors) {
    if (!isObj(raw)) { errors.push(`${where} must be an object`); return null; }
    const out = {
        name: str(errors, `${where} name`, raw.name, LIMITS.name, { required: true }),
        level: str(errors, `${where} level`, raw.level, LIMITS.short, { required: false }),
        time: str(errors, `${where} time`, raw.time, LIMITS.short, { required: false }),
        equipment: strList(errors, `${where} equipment`, raw.equipment),
        roleTags: strList(errors, `${where} roleTags`, raw.roleTags),
        steps: [],
    };
    if (!Array.isArray(raw.steps) || !raw.steps.length) {
        errors.push(`${where} needs at least one step`);
    } else if (raw.steps.length > LIMITS.steps) {
        errors.push(`${where} has more than ${LIMITS.steps} steps`);
    } else {
        out.steps = raw.steps.map((s, i) => {
            const sw = `${where} step ${i + 1}`;
            if (!isObj(s)) { errors.push(`${sw} must be an object`); return null; }
            if (s.safety !== undefined && typeof s.safety !== 'boolean') errors.push(`${sw} safety must be true or false`);
            return {
                key: String(i + 1),
                text: str(errors, `${sw} text`, s.text, LIMITS.text, { required: true }),
                twoLooksLike: str(errors, `${sw} twoLooksLike`, s.twoLooksLike, LIMITS.twoLooksLike, { required: false }),
                safety: s.safety === true,
            };
        });
    }
    return out;
}

function uniqueKey(errors, where, key, seen) {
    if (typeof key !== 'string' || !KEY_RE.test(key)) {
        errors.push(`${where} key must be lowercase letters, numbers, - or _`);
        return false;
    }
    if (seen.has(key)) { errors.push(`${where} key "${key}" is used twice`); return false; }
    seen.add(key);
    return true;
}

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

/** One scorecard template. Task codes are checked by the caller against the library. */
function validateScorecard(raw, where, errors) {
    if (!isObj(raw)) { errors.push(`${where} must be an object`); return null; }
    const slug = typeof raw.slug === 'string' && SLUG_RE.test(raw.slug) ? raw.slug : null;
    if (!slug) errors.push(`${where} slug must be lowercase letters, numbers and dashes`);
    const w = where.replace(/^scorecard \d+$/, `scorecard "${slug || '?'}"`);

    const out = {
        slug,
        title: str(errors, `${w} title`, raw.title, LIMITS.name, { required: true }),
        role: str(errors, `${w} role`, raw.role, LIMITS.name, { required: true }),
        tasks: [],
        config: {},
    };

    if (!Array.isArray(raw.tasks) || !raw.tasks.length) {
        errors.push(`${w} needs at least one task code`);
    } else {
        const seen = new Set();
        for (const code of raw.tasks) {
            if (typeof code !== 'string' || !CODE_RE.test(code)) { errors.push(`${w} has an invalid task code ${JSON.stringify(code)}`); continue; }
            if (seen.has(code)) { errors.push(`${w} lists task ${code} twice`); continue; }
            seen.add(code);
            out.tasks.push(code);
        }
    }

    const pw = raw.partWeights;
    if (!isObj(pw) || !isNum(pw.part1) || !isNum(pw.part2) || pw.part1 <= 0 || pw.part2 <= 0) {
        errors.push(`${w} partWeights needs positive part1 and part2`);
    }

    const categories = [];
    if (!Array.isArray(raw.categories) || !raw.categories.length) {
        errors.push(`${w} needs at least one observation category`);
    } else if (raw.categories.length > LIMITS.categories) {
        errors.push(`${w} has too many categories`);
    } else {
        const seen = new Set();
        raw.categories.forEach((c, i) => {
            const cw = `${w} category ${i + 1}`;
            if (!isObj(c)) { errors.push(`${cw} must be an object`); return; }
            uniqueKey(errors, cw, c.key, seen);
            if (!isNum(c.weight) || c.weight <= 0) errors.push(`${cw} weight must be a positive number`);
            const items = [];
            if (!Array.isArray(c.items) || !c.items.length) errors.push(`${cw} needs at least one item`);
            else if (c.items.length > LIMITS.items) errors.push(`${cw} has too many items`);
            else c.items.forEach((it, j) => {
                const iw = `${cw} item ${j + 1}`;
                if (!isObj(it)) { errors.push(`${iw} must be an object`); return; }
                items.push({
                    key: String(j + 1),
                    text: str(errors, `${iw} text`, it.text, LIMITS.text, { required: true }),
                    twoLooksLike: str(errors, `${iw} twoLooksLike`, it.twoLooksLike, LIMITS.twoLooksLike, { required: false }),
                });
            });
            categories.push({ key: c.key, name: str(errors, `${cw} name`, c.name, LIMITS.name, { required: true }), weight: c.weight, items });
        });
    }

    const redFlags = [];
    if (raw.redFlags !== undefined && !Array.isArray(raw.redFlags)) errors.push(`${w} redFlags must be a list`);
    else if ((raw.redFlags || []).length > LIMITS.redFlags) errors.push(`${w} has too many red flags`);
    else {
        const seen = new Set();
        (raw.redFlags || []).forEach((f, i) => {
            const fw = `${w} red flag ${i + 1}`;
            if (!isObj(f)) { errors.push(`${fw} must be an object`); return; }
            uniqueKey(errors, fw, f.key, seen);
            if (!FLAG_TYPES.includes(f.type)) errors.push(`${fw} type must be FAIL or CAP`);
            redFlags.push({ key: f.key, text: str(errors, `${fw} text`, f.text, LIMITS.text, { required: true }), type: f.type });
        });
    }

    const bands = [];
    if (!Array.isArray(raw.bands) || !raw.bands.length) {
        errors.push(`${w} needs result bands`);
    } else if (raw.bands.length > LIMITS.bands) {
        errors.push(`${w} has too many bands`);
    } else {
        const seen = new Set();
        const mins = new Set();
        raw.bands.forEach((b, i) => {
            const bw = `${w} band ${i + 1}`;
            if (!isObj(b)) { errors.push(`${bw} must be an object`); return; }
            uniqueKey(errors, bw, b.key, seen);
            if (b.key === 'fail') errors.push(`${bw} key "fail" is reserved for red flags`);
            if (!Number.isInteger(b.min) || b.min < 0 || b.min > 100) errors.push(`${bw} min must be a whole number from 0 to 100`);
            else if (mins.has(b.min)) errors.push(`${bw} has the same min as another band`);
            else mins.add(b.min);
            bands.push({ key: b.key, label: str(errors, `${bw} label`, b.label, LIMITS.short, { required: true }), min: b.min });
        });
        if (!mins.has(0)) errors.push(`${w} needs a band starting at 0 so every total has a band`);
    }

    if (!Number.isInteger(raw.capValue) || raw.capValue < 0 || raw.capValue > 100) {
        errors.push(`${w} capValue must be a whole number from 0 to 100`);
    }
    if (!FLAG_TYPES.includes(raw.safetyFlagType)) errors.push(`${w} safetyFlagType must be FAIL or CAP`);

    out.config = {
        partWeights: isObj(pw) ? { part1: pw.part1, part2: pw.part2 } : null,
        categories,
        redFlags,
        bands: bands.sort((a, b) => b.min - a.min),
        capValue: raw.capValue,
        safetyFlagType: raw.safetyFlagType,
    };
    return out;
}

/**
 * Validates a whole bundle. Returns { tasks: [{code, content}], scorecards, errors }.
 * Scorecard task codes not defined in this bundle are returned in
 * `externalCodes` for the caller to check against the shared library.
 */
function validateBundle(bundle) {
    const errors = [];
    if (!isObj(bundle)) return { tasks: [], scorecards: [], externalCodes: [], errors: ['The file must be a JSON object with "tasks" and "scorecards"'] };

    const tasks = [];
    const codes = new Set();
    if (bundle.tasks !== undefined && !Array.isArray(bundle.tasks)) errors.push('"tasks" must be a list');
    else if ((bundle.tasks || []).length > LIMITS.tasks) errors.push('Too many tasks in one file');
    else (bundle.tasks || []).forEach((t, i) => {
        const code = isObj(t) ? t.code : undefined;
        const where = `task ${typeof code === 'string' ? code : i + 1}`;
        if (typeof code !== 'string' || !CODE_RE.test(code)) { errors.push(`task ${i + 1} code must be letters, numbers, . - or _ (e.g. T2)`); return; }
        if (codes.has(code)) { errors.push(`task ${code} is defined twice`); return; }
        codes.add(code);
        const content = validateTask(t, where, errors);
        if (content) tasks.push({ code, content });
    });

    const scorecards = [];
    if (bundle.scorecards !== undefined && !Array.isArray(bundle.scorecards)) errors.push('"scorecards" must be a list');
    else if ((bundle.scorecards || []).length > LIMITS.scorecards) errors.push('Too many scorecards in one file');
    else {
        const slugs = new Set();
        (bundle.scorecards || []).forEach((s, i) => {
            const sc = validateScorecard(s, `scorecard ${i + 1}`, errors);
            if (!sc) return;
            if (sc.slug && slugs.has(sc.slug)) errors.push(`scorecard "${sc.slug}" is defined twice`);
            if (sc.slug) slugs.add(sc.slug);
            scorecards.push(sc);
        });
    }
    if (!tasks.length && !scorecards.length) errors.push('The file has no tasks and no scorecards');

    const externalCodes = [...new Set(scorecards.flatMap(s => s.tasks).filter(c => !codes.has(c)))];
    return { tasks, scorecards, externalCodes, errors };
}

module.exports = { validateBundle, validateTask, validateScorecard, CODE_RE, FLAG_TYPES };
