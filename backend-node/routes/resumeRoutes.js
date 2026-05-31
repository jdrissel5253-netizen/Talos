const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth');
const { analyzeResume } = require('../services/resumeAnalyzer');
const { batchService, candidateService, analysisService, jobService, candidatePipelineService, sanitize } = require('../services/databaseService');
const { calculateTier, calculateStarRating } = require('../services/scoringService');
const { uploadResume, downloadResumeToTemp, streamResumeTo, isS3Key } = require('../config/s3');
const logger = require('../services/logger');

const router = express.Router();

// Helper function to add candidate to General Talent Pool
// Matches the working pattern from applyRoutes.js
async function addCandidateToTalentPool(candidateId, analysis, evaluatedPosition, userId) {
    try {
        // Use findByTitle (direct SQL query) instead of findByUserId + JS filter
        let generalJob = await jobService.findByTitle(userId, 'General Talent Pool');

        if (!generalJob) {
            generalJob = await jobService.create(userId, {
                title: 'General Talent Pool',
                description: 'Default talent pool for all candidates including batch uploads',
                location: 'All Locations',
                required_years_experience: 0,
                vehicle_required: false,
                position_type: 'General',
                status: 'active'
            });
            logger.info('Created General Talent Pool job', { jobId: generalJob.id });
        }

        // Calculate tier based on score (with NaN protection)
        const score = Number(analysis.overallScore) || 0;
        let tier, star_rating;

        if (score >= 80) {
            tier = 'green';
            star_rating = 4.0 + (score - 80) / 20;
        } else if (score >= 50) {
            tier = 'yellow';
            star_rating = 2.0 + (score - 50) / 30 * 1.9;
        } else {
            tier = 'red';
            star_rating = score / 50 * 1.5;
        }

        const pipelineData = {
            tier,
            tier_score: Math.round(score),
            star_rating: Math.round(star_rating * 10) / 10,
            give_them_a_chance: score >= 70 && score < 80,
            vehicle_status: 'unknown',
            ai_summary: `Batch upload. Score: ${score}/100. ${analysis.hiringRecommendation || 'Pending review'}. ${analysis.summary || ''}`.trim(),
            internal_notes: 'Source: Batch Resume Upload',
            tags: ['batch-upload'],
            evaluated_position: evaluatedPosition || 'General'
        };

        await candidatePipelineService.addToJob(candidateId, generalJob.id, pipelineData);
        logger.info('Added candidate to General Talent Pool', { candidateId, jobId: generalJob.id, evaluatedPosition });
    } catch (error) {
        logger.error('Talent pool error', { candidateId, error: error.message, stack: error.stack });
        // Don't throw - we don't want to fail the upload if talent pool addition fails
    }
}

// Map frontend position values to backend position names
function mapPositionValue(positionValue) {
    const positionMap = {
        'lead-hvac-technician': 'Lead HVAC Technician',
        'hvac-service-technician': 'HVAC Service Technician',
        'hvac-dispatcher': 'HVAC Dispatcher',
        'administrative-assistant': 'Administrative Assistant',
        'admin-assistant': 'Administrative Assistant', // Legacy support
        'customer-service-representative': 'Customer Service Representative',
        'hvac-installer': 'HVAC Installer',
        'lead-hvac-installer': 'Lead HVAC Installer',
        'maintenance-technician': 'Maintenance Technician',
        'warehouse-associate': 'Warehouse Associate',
        'bookkeeper': 'Bookkeeper',
        'hvac-sales-representative': 'HVAC Sales Representative',
        'hvac-service-manager': 'HVAC Service Manager',
        'apprentice': 'Apprentice',
        'hvac-project-manager': 'HVAC Project Manager',
        'hvac-sales-engineer': 'HVAC Sales Engineer',
        'refrigeration-technician': 'Refrigeration Technician',
        'hvac-apprentice': 'HVAC Apprentice',
        'commercial-hvac-tech': 'Commercial HVAC Technician',
        'residential-hvac-tech': 'Residential HVAC Technician'
    };

    return positionMap[positionValue] || positionValue || 'HVAC Service Technician';
}

// Use memory storage — files go to S3, not local disk
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        const allowedExtensions = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
            return cb(null, true);
        }
        cb(new Error('Only PDF and DOC/DOCX files are allowed'));
    }
});

// Serve the actual resume PDF for a candidate
router.get('/file/:candidateId', async (req, res) => {
    try {
        const candidateId = parseInt(req.params.candidateId);
        if (!candidateId || isNaN(candidateId)) {
            return res.status(400).json({ status: 'error', message: 'Invalid candidate ID' });
        }

        const candidate = await candidateService.findById(candidateId);
        if (!candidate || !candidate.file_path) {
            return res.status(404).json({ status: 'error', message: 'Resume not found' });
        }

        if (!isS3Key(candidate.file_path)) {
            return res.status(404).json({ status: 'error', message: 'Resume file not available — please re-upload' });
        }

        res.setHeader('Content-Disposition', `inline; filename="${candidate.filename}"`);
        await streamResumeTo(candidate.file_path, res);
    } catch (error) {
        logger.error('Error serving resume file', { error: error.message, stack: error.stack });
        res.status(500).json({ status: 'error', message: 'Failed to retrieve resume' });
    }
});

// Serve a browser-renderable preview of any resume (PDF or DOCX)
router.get('/preview/:candidateId', async (req, res) => {
    let tempPath = null;
    try {
        const candidateId = parseInt(req.params.candidateId);
        if (!candidateId || isNaN(candidateId)) {
            return res.status(400).json({ status: 'error', message: 'Invalid candidate ID' });
        }

        const candidate = await candidateService.findById(candidateId);
        if (!candidate || !candidate.file_path) {
            return res.status(404).json({ status: 'error', message: 'Resume not found' });
        }

        if (!isS3Key(candidate.file_path)) {
            return res.status(404).json({ status: 'error', message: 'Resume file not available' });
        }

        const ext = path.extname(candidate.file_path).toLowerCase();

        if (ext === '.pdf') {
            res.setHeader('Content-Disposition', `inline; filename="${candidate.filename}"`);
            return await streamResumeTo(candidate.file_path, res);
        }

        if (ext === '.docx' || ext === '.doc') {
            tempPath = await downloadResumeToTemp(candidate.file_path);
            const { value: html } = await mammoth.convertToHtml({ path: tempPath });
            const page = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5;
         max-width: 820px; margin: 2rem auto; padding: 0 2rem; color: #1a1a1a;
         background: #ffffff; }
  h1 { font-size: 1.4em; } h2 { font-size: 1.15em; } h3 { font-size: 1em; }
  table { border-collapse: collapse; width: 100%; }
  td, th { padding: 4px 8px; border: 1px solid #ccc; }
  p { margin: 0.4em 0; }
</style>
</head>
<body>${html}</body>
</html>`;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.send(page);
        }

        res.status(415).json({ status: 'error', message: 'Preview not supported for this file type' });
    } catch (error) {
        logger.error('Error generating resume preview', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to generate preview' });
    } finally {
        if (tempPath) { try { fs.unlinkSync(tempPath); } catch (_) {} }
    }
});

// Upload and analyze resume (single)
router.post('/upload', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No resume file uploaded'
            });
        }

        const userId = req.user.userId;
        const jobId = req.body.job_id ? sanitize.positiveInt(req.body.job_id) : null;

        // If a specific job is selected, pull its details for the analysis
        let position, requiredYearsExperience, flexibleOnTitle, jobLocation, targetJob;
        if (jobId) {
            targetJob = await jobService.findById(jobId);
            if (!targetJob) {
                return res.status(404).json({ status: 'error', message: 'Selected job not found' });
            }
            position = targetJob.title;
            requiredYearsExperience = parseFloat(targetJob.required_years_experience) || 2;
            flexibleOnTitle = targetJob.flexible_on_title !== false;
            jobLocation = targetJob.city || targetJob.location || null;
        } else {
            const positionValue = req.body.position || 'hvac-technician';
            position = mapPositionValue(positionValue);
            requiredYearsExperience = parseFloat(req.body.requiredYearsExperience) || 2;
            flexibleOnTitle = req.body.flexibleOnTitle !== 'false';
            jobLocation = null;
        }

        // Create a batch record for tracking
        const batchName = `Single Upload ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
        const batch = await batchService.create(userId, batchName, 1);

        // Upload to S3 and create candidate record
        const s3Key = await uploadResume(req.file.buffer, req.file.originalname);
        const candidate = await candidateService.create(batch.id, req.file.originalname, s3Key);

        // Download to temp for analysis, then clean up
        const tempPath = await downloadResumeToTemp(s3Key);
        let analysis;
        try {
            analysis = await analyzeResume(tempPath, position, requiredYearsExperience, flexibleOnTitle, jobLocation);
        } finally {
            try { fs.unlinkSync(tempPath); } catch (_) {}
        }

        // Save analysis to database
        await candidateService.updateEmailIfMissing(candidate.id, analysis.extractedEmail);
        await analysisService.create(candidate.id, analysis);
        await candidateService.updateStatus(candidate.id, 'completed');

        if (jobId && targetJob) {
            // Add directly to the selected job's pipeline
            const score = Number(analysis.overallScore) || 0;
            const tier = calculateTier(score);
            const star_rating = calculateStarRating(score);
            await candidatePipelineService.addToJob(candidate.id, jobId, {
                tier,
                tier_score: Math.round(score),
                star_rating: Math.round(star_rating * 10) / 10,
                give_them_a_chance: score >= 70 && score < 80,
                vehicle_status: 'unknown',
                ai_summary: `Score: ${score}/100. ${analysis.hiringRecommendation || ''}. ${analysis.summary || ''}`.trim(),
                internal_notes: 'Source: Single Resume Upload',
                tags: ['single-upload'],
                evaluated_position: position
            });
            logger.info('Added candidate to specific job pipeline', { candidateId: candidate.id, jobId, position });
        } else {
            // Fall back to General Talent Pool
            await addCandidateToTalentPool(candidate.id, analysis, position, userId);
        }

        res.json({
            status: 'success',
            message: 'Resume analyzed successfully',
            data: {
                candidateId: candidate.id,
                filename: req.file.originalname,
                jobId: jobId || null,
                jobTitle: targetJob?.title || null,
                analysis: analysis
            }
        });

    } catch (error) {
        if (error.code === 'EMPTY_RESUME') {
            return res.status(422).json({ status: 'error', message: error.message });
        }
        logger.error('Resume analysis error', { error: error.message, stack: error.stack });
        res.status(500).json({
            status: 'error',
            message: 'Failed to analyze resume'
        });
    }
});

// Upload and analyze multiple resumes
router.post('/upload-batch', upload.array('resumes', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No resume files uploaded'
            });
        }

        // Get the position from the request (defaults to "HVAC Technician" if not provided)
        const positionValue = req.body.position || 'hvac-technician';
        const position = mapPositionValue(positionValue);
        const requiredYearsExperience = parseFloat(req.body.requiredYearsExperience) || 2;
        const flexibleOnTitle = req.body.flexibleOnTitle !== 'false'; // Default to true

        const userId = req.user.userId;

        // Create a batch record
        const batchName = `Batch ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
        const batch = await batchService.create(userId, batchName, req.files.length);

        // Analyze all resumes and save to database
        const results = [];
        const errors = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            let candidate = null;

            try {
                logger.info('Analyzing resume', { index: i + 1, total: req.files.length, filename: file.originalname, position });

                // Upload to S3 and create candidate record
                const s3Key = await uploadResume(file.buffer, file.originalname);
                candidate = await candidateService.create(batch.id, file.originalname, s3Key);

                // Download to temp for analysis, then clean up
                const tempPath = await downloadResumeToTemp(s3Key);
                let analysis;
                try {
                    analysis = await analyzeResume(tempPath, position, requiredYearsExperience, flexibleOnTitle);
                } finally {
                    try { fs.unlinkSync(tempPath); } catch (_) {}
                }

                // Save analysis to database
                await candidateService.updateEmailIfMissing(candidate.id, analysis.extractedEmail);
                await analysisService.create(candidate.id, analysis);

                // Update candidate status to completed
                await candidateService.updateStatus(candidate.id, 'completed');

                // Automatically add to General Talent Pool
                await addCandidateToTalentPool(candidate.id, analysis, position, userId);

                results.push({
                    id: candidate.id,
                    filename: file.originalname,
                    analysis: analysis,
                    status: 'success'
                });
            } catch (error) {
                logger.error('Error analyzing resume in batch', { filename: file.originalname, error: error.message });

                // Update candidate status to error if it was created
                if (candidate) {
                    await candidateService.updateStatus(candidate.id, 'error');
                }

                errors.push({
                    filename: file.originalname,
                    error: 'Processing failed'
                });

                results.push({
                    id: candidate?.id || i,
                    filename: file.originalname,
                    status: 'error',
                    error: 'Processing failed'
                });
            }
        }

        res.json({
            status: 'success',
            message: `Analyzed ${results.filter(r => r.status === 'success').length} out of ${req.files.length} resumes`,
            data: {
                batchId: batch.id,
                results: results,
                totalAnalyzed: results.filter(r => r.status === 'success').length,
                totalFiles: req.files.length,
                errors: errors
            }
        });

    } catch (error) {
        logger.error('Batch resume analysis error', { error: error.message, stack: error.stack });
        res.status(500).json({
            status: 'error',
            message: 'Failed to analyze resumes'
        });
    }
});

module.exports = router;
