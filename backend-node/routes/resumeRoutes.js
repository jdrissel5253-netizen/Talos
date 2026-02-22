const express = require('express');
const multer = require('multer');
const path = require('path');
const { analyzeResume } = require('../services/resumeAnalyzer');
const { batchService, candidateService, analysisService, jobService, candidatePipelineService } = require('../services/databaseService');
const logger = require('../services/logger');

const router = express.Router();

// Helper function to add candidate to General Talent Pool
// Matches the working pattern from applyRoutes.js
async function addCandidateToTalentPool(candidateId, analysis, evaluatedPosition) {
    const ADMIN_USER_ID = 1;

    try {
        // Use findByTitle (direct SQL query) instead of findByUserId + JS filter
        let generalJob = await jobService.findByTitle(ADMIN_USER_ID, 'General Talent Pool');

        if (!generalJob) {
            generalJob = await jobService.create(ADMIN_USER_ID, {
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

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit per file
        // Note: files limit is specified in the route handler with .array('resumes', 10)
    },
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
        } else {
            cb(new Error('Only PDF and DOC/DOCX files are allowed'));
        }
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

        // Get the position from the request (defaults to "HVAC Technician" if not provided)
        const positionValue = req.body.position || 'hvac-technician';
        const position = mapPositionValue(positionValue);
        const requiredYearsExperience = parseFloat(req.body.requiredYearsExperience) || 2;
        const flexibleOnTitle = req.body.flexibleOnTitle !== 'false'; // Default to true

        const userId = req.user.userId;

        // Create a batch record for tracking
        const batchName = `Single Upload ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
        const batch = await batchService.create(userId, batchName, 1);

        // Create candidate record
        const candidate = await candidateService.create(batch.id, req.file.originalname, req.file.path);

        // Analyze the resume using AI with the selected position
        const analysis = await analyzeResume(req.file.path, position, requiredYearsExperience, flexibleOnTitle);

        // Save analysis to database
        await analysisService.create(candidate.id, analysis);

        // Update candidate status to completed
        await candidateService.updateStatus(candidate.id, 'completed');

        // Automatically add to General Talent Pool
        await addCandidateToTalentPool(candidate.id, analysis, position);

        res.json({
            status: 'success',
            message: 'Resume analyzed successfully',
            data: {
                candidateId: candidate.id,
                filename: req.file.originalname,
                analysis: analysis
            }
        });

    } catch (error) {
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

                // Create candidate record
                candidate = await candidateService.create(batch.id, file.originalname, file.path);

                // Analyze the resume using AI with the selected position
                const analysis = await analyzeResume(file.path, position, requiredYearsExperience, flexibleOnTitle);

                // Save analysis to database
                await analysisService.create(candidate.id, analysis);

                // Update candidate status to completed
                await candidateService.updateStatus(candidate.id, 'completed');

                // Automatically add to General Talent Pool
                await addCandidateToTalentPool(candidate.id, analysis, position);

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
