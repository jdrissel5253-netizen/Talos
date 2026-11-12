/**
 * Interview kits and interviews. Every route here is mounted behind
 * authenticateToken in server.js; none is reachable by candidates.
 *
 *   /api/interview-kits                 kit list + kit content (answer keys)
 *   /api/interviews                     interviews on an application
 *   /api/admin/interview-kits           content uploads (platform admin only)
 */
const express = require('express');
const multer = require('multer');
const logger = require('../services/logger');
const kits = require('../services/interviewKits/kitService');
const { getDefinition } = require('../services/interviewKits/definitions');
const { parseKitDocx } = require('../services/interviewKits/docxParser');

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// Kit content includes answer keys: never let a CDN or shared cache keep it.
function noStore(req, res, next) {
    res.set('Cache-Control', 'private, no-store');
    res.set('Vary', 'Authorization');
    next();
}

const wrap = (fn) => async (req, res) => {
    try {
        await fn(req, res);
    } catch (err) {
        if (err instanceof kits.HttpError) {
            return res.status(err.status).json({ status: 'error', message: err.message });
        }
        logger.error('Interview kit route error', { path: req.path, error: err.message, stack: err.stack });
        res.status(500).json({ status: 'error', message: 'Something went wrong' });
    }
};

const positiveInt = (v) => {
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
};

// ─── kits ────────────────────────────────────────────────────────────────────

const kitRouter = express.Router();
kitRouter.use(noStore);

kitRouter.get('/', wrap(async (req, res) => {
    res.json({ status: 'success', data: { kits: await kits.listKits(req.user.accountId) } });
}));

kitRouter.get('/:slug', wrap(async (req, res) => {
    const kit = await kits.getLatestKit(String(req.params.slug).slice(0, 100), req.user.accountId);
    if (!kit) return res.status(404).json({ status: 'error', message: 'Kit not found' });
    const { versionId, ...publicKit } = kit;
    res.json({ status: 'success', data: { kit: publicKit } });
}));

// ─── interviews ──────────────────────────────────────────────────────────────

const interviewRouter = express.Router();
interviewRouter.use(noStore);

interviewRouter.get('/', wrap(async (req, res) => {
    const pipelineId = positiveInt(req.query.pipelineId);
    if (!pipelineId) return res.status(400).json({ status: 'error', message: 'pipelineId is required' });
    res.json({ status: 'success', data: { interviews: await kits.listForPipeline(pipelineId, req.user.accountId) } });
}));

interviewRouter.post('/', wrap(async (req, res) => {
    const pipelineId = positiveInt(req.body?.pipelineId);
    const kitSlug = typeof req.body?.kitId === 'string' ? req.body.kitId.slice(0, 100) : null;
    if (!pipelineId || !kitSlug) return res.status(400).json({ status: 'error', message: 'pipelineId and kitId are required' });
    const interview = await kits.createInterview({ pipelineId, kitSlug, mode: req.body.mode, user: req.user });
    res.status(201).json({ status: 'success', data: { interview } });
}));

interviewRouter.get('/:id', wrap(async (req, res) => {
    const id = positiveInt(req.params.id);
    if (!id) return res.status(404).json({ status: 'error', message: 'Interview not found' });
    res.json({ status: 'success', data: { interview: await kits.getInterview(id, req.user.accountId) } });
}));

// Autosave. Body: { key?, answer?: { score, notes, redFlag }, currentIndex? }
interviewRouter.patch('/:id', wrap(async (req, res) => {
    const id = positiveInt(req.params.id);
    if (!id) return res.status(404).json({ status: 'error', message: 'Interview not found' });
    const { key, answer, currentIndex } = req.body || {};
    if (key !== undefined && typeof key !== 'string') return res.status(400).json({ status: 'error', message: 'Invalid question key' });
    const interview = await kits.saveProgress(id, req.user.accountId, { key, answer, currentIndex });
    res.json({ status: 'success', data: { interview } });
}));

interviewRouter.post('/:id/complete', wrap(async (req, res) => {
    const id = positiveInt(req.params.id);
    if (!id) return res.status(404).json({ status: 'error', message: 'Interview not found' });
    res.json({ status: 'success', data: { interview: await kits.completeInterview(id, req.user.accountId) } });
}));

interviewRouter.delete('/:id', wrap(async (req, res) => {
    const id = positiveInt(req.params.id);
    if (!id) return res.status(404).json({ status: 'error', message: 'Interview not found' });
    await kits.discardInterview(id, req.user.accountId);
    res.json({ status: 'success' });
}));

// ─── admin: content uploads ──────────────────────────────────────────────────

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        const ok = file.mimetype === DOCX_MIME || /\.docx$/i.test(file.originalname);
        cb(ok ? null : new kits.HttpError(400, 'Upload a .docx file'), ok);
    },
});

const adminRouter = express.Router();
adminRouter.use(noStore);

adminRouter.get('/', wrap(async (req, res) => {
    res.json({ status: 'success', data: { kits: await kits.adminKitStatus() } });
}));

adminRouter.post('/:slug/upload', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (!err) return next();
        const status = err instanceof kits.HttpError ? err.status : 400;
        res.status(status).json({ status: 'error', message: err.message || 'Upload failed' });
    });
}, wrap(async (req, res) => {
    const definition = getDefinition(req.params.slug);
    if (!definition) return res.status(404).json({ status: 'error', message: 'Unknown kit' });
    if (!req.file) return res.status(400).json({ status: 'error', message: 'No file uploaded' });

    const parsed = await parseKitDocx(req.file.buffer, definition);
    if (parsed.errors.length) {
        return res.status(422).json({ status: 'error', message: 'This document doesn\'t match the kit\'s expected structure.', errors: parsed.errors });
    }
    const result = await kits.createSharedVersion(definition.slug, {
        content: parsed.content,
        sha256: parsed.sha256,
        sourceFilename: String(req.file.originalname).slice(0, 255),
        uploadedBy: req.user.userId,
    });
    logger.info('Interview kit upload', { slug: definition.slug, ...result, by: req.user.userId });
    res.status(result.created ? 201 : 200).json({
        status: 'success',
        data: {
            ...result,
            message: result.created
                ? `Saved as version ${result.version}.`
                : `No changes: this matches version ${result.version}.`,
            questionCount: parsed.content.sections.reduce((n, s) => n + s.questions.length, 0),
        },
    });
}));

module.exports = { kitRouter, interviewRouter, adminRouter };
