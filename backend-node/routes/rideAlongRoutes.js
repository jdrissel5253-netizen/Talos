/**
 * Ride-along scorecards. Every route here is mounted behind authenticateToken
 * in server.js; none is reachable by candidates.
 *
 *   /api/scorecards               scorecards + per-company task settings
 *   /api/scorecard-tasks          the company's own tasks
 *   /api/evaluations              ride-along evaluations
 *   /api/admin/scorecards         content uploads (platform admin only)
 */
const express = require('express');
const multer = require('multer');
const logger = require('../services/logger');
const svc = require('../services/rideAlong/rideAlongService');

// Scorecard content and scores: never let a CDN or shared cache keep them.
function noStore(req, res, next) {
    res.set('Cache-Control', 'private, no-store');
    res.set('Vary', 'Authorization');
    next();
}

const wrap = (fn) => async (req, res) => {
    try {
        await fn(req, res);
    } catch (err) {
        if (err instanceof svc.HttpError) {
            return res.status(err.status).json({ status: 'error', message: err.message, ...(err.details && { errors: err.details }) });
        }
        logger.error('Ride-along route error', { path: req.path, error: err.message, stack: err.stack });
        res.status(500).json({ status: 'error', message: 'Something went wrong' });
    }
};

const positiveInt = (v) => {
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
};
const slugParam = (req) => String(req.params.slug).slice(0, 100);

// ─── scorecards ──────────────────────────────────────────────────────────────

const scorecardRouter = express.Router();
scorecardRouter.use(noStore);

scorecardRouter.get('/', wrap(async (req, res) => {
    res.json({ status: 'success', data: { scorecards: await svc.listScorecards() } });
}));

scorecardRouter.get('/:slug', wrap(async (req, res) => {
    res.json({ status: 'success', data: { scorecard: await svc.getScorecard(slugParam(req), req.user) } });
}));

scorecardRouter.put('/:slug/settings', wrap(async (req, res) => {
    res.json({ status: 'success', data: { scorecard: await svc.updateSettings(slugParam(req), req.user, req.body) } });
}));

// ─── company tasks ───────────────────────────────────────────────────────────

const taskRouter = express.Router();
taskRouter.use(noStore);

taskRouter.get('/', wrap(async (req, res) => {
    res.json({ status: 'success', data: { tasks: await svc.listCompanyTasks(req.user.accountId) } });
}));

taskRouter.post('/', wrap(async (req, res) => {
    res.status(201).json({ status: 'success', data: { task: await svc.createCompanyTask(req.user, req.body) } });
}));

taskRouter.put('/:id', wrap(async (req, res) => {
    const id = positiveInt(req.params.id);
    if (!id) return res.status(404).json({ status: 'error', message: 'Task not found' });
    res.json({ status: 'success', data: { task: await svc.updateCompanyTask(id, req.user, req.body) } });
}));

taskRouter.delete('/:id', wrap(async (req, res) => {
    const id = positiveInt(req.params.id);
    if (!id) return res.status(404).json({ status: 'error', message: 'Task not found' });
    await svc.deleteCompanyTask(id, req.user);
    res.json({ status: 'success' });
}));

// ─── evaluations ─────────────────────────────────────────────────────────────

const evaluationRouter = express.Router();
evaluationRouter.use(noStore);

// ?pipelineId=  one application's evaluations
// ?mine=drafts  the signed-in scorer's open drafts
evaluationRouter.get('/', wrap(async (req, res) => {
    if (req.query.mine === 'drafts') {
        return res.json({ status: 'success', data: { evaluations: await svc.listMyDrafts(req.user) } });
    }
    const pipelineId = positiveInt(req.query.pipelineId);
    if (!pipelineId) return res.status(400).json({ status: 'error', message: 'pipelineId is required' });
    res.json({ status: 'success', data: { evaluations: await svc.listForPipeline(pipelineId, req.user.accountId) } });
}));

evaluationRouter.get('/candidates', wrap(async (req, res) => {
    res.json({ status: 'success', data: { candidates: await svc.listScorableCandidates(req.user.accountId) } });
}));

evaluationRouter.get('/compare', wrap(async (req, res) => {
    const jobId = positiveInt(req.query.jobId);
    if (!jobId) return res.status(400).json({ status: 'error', message: 'jobId is required' });
    res.json({ status: 'success', data: await svc.compareForJob(jobId, req.user.accountId) });
}));

evaluationRouter.post('/', wrap(async (req, res) => {
    const pipelineId = positiveInt(req.body?.pipelineId);
    const slug = typeof req.body?.scorecard === 'string' ? req.body.scorecard.slice(0, 100) : null;
    if (!pipelineId || !slug) return res.status(400).json({ status: 'error', message: 'pipelineId and scorecard are required' });
    const evaluation = await svc.createEvaluation({ pipelineId, slug, user: req.user });
    res.status(201).json({ status: 'success', data: { evaluation } });
}));

evaluationRouter.get('/:id', wrap(async (req, res) => {
    const id = positiveInt(req.params.id);
    if (!id) return res.status(404).json({ status: 'error', message: 'Evaluation not found' });
    res.json({ status: 'success', data: { evaluation: await svc.getEvaluation(id, req.user.accountId) } });
}));

evaluationRouter.patch('/:id', wrap(async (req, res) => {
    const id = positiveInt(req.params.id);
    if (!id) return res.status(404).json({ status: 'error', message: 'Evaluation not found' });
    res.json({ status: 'success', data: { evaluation: await svc.saveProgress(id, req.user.accountId, req.body) } });
}));

evaluationRouter.post('/:id/submit', wrap(async (req, res) => {
    const id = positiveInt(req.params.id);
    if (!id) return res.status(404).json({ status: 'error', message: 'Evaluation not found' });
    res.json({ status: 'success', data: { evaluation: await svc.submitEvaluation(id, req.user.accountId) } });
}));

evaluationRouter.delete('/:id', wrap(async (req, res) => {
    const id = positiveInt(req.params.id);
    if (!id) return res.status(404).json({ status: 'error', message: 'Evaluation not found' });
    await svc.discardEvaluation(id, req.user.accountId);
    res.json({ status: 'success' });
}));

// ─── admin: content uploads ──────────────────────────────────────────────────

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        const ok = /\.json$/i.test(file.originalname) || file.mimetype === 'application/json';
        cb(ok ? null : new svc.HttpError(400, 'Upload a .json file'), ok);
    },
});

const adminRouter = express.Router();
adminRouter.use(noStore);

adminRouter.get('/', wrap(async (req, res) => {
    res.json({ status: 'success', data: await svc.adminStatus() });
}));

adminRouter.post('/upload', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (!err) return next();
        const status = err instanceof svc.HttpError ? err.status : 400;
        res.status(status).json({ status: 'error', message: err.message || 'Upload failed' });
    });
}, wrap(async (req, res) => {
    if (!req.file) return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    let bundle;
    try {
        bundle = JSON.parse(req.file.buffer.toString('utf8').replace(/^﻿/, ''));
    } catch (err) {
        return res.status(422).json({ status: 'error', message: 'This file isn\'t valid JSON.', errors: [err.message] });
    }
    const summary = await svc.importBundle(bundle, {
        sourceFilename: String(req.file.originalname).slice(0, 255),
        uploadedBy: req.user.userId,
    });
    logger.info('Scorecard upload', { ...summary, by: req.user.userId });
    res.json({ status: 'success', data: summary });
}));

module.exports = { scorecardRouter, taskRouter, evaluationRouter, adminRouter };
