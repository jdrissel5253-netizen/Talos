const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { candidateService, analysisService, candidatePipelineService, jobService, sanitize } = require('../services/databaseService');
const { analyzeResume } = require('../services/resumeAnalyzer');
const { calculateTier, calculateStarRating } = require('../services/scoringService');
const db = require('../config/database');
const logger = require('../services/logger');

const router = express.Router();

// Create applications directory if it doesn't exist
const applicationsDir = path.join(__dirname, '../applications');
if (!fs.existsSync(applicationsDir)) {
    fs.mkdirSync(applicationsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, applicationsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'application-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Please upload a PDF or Word document.'));
        }
    }
});

/**
 * POST /api/apply
 * Public endpoint for job applications
 */
router.post('/', (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
        if (err) {
            logger.warn('File upload error', { error: err.message });
            return res.status(400).json({
                status: 'error',
                message: err.message || 'File upload failed'
            });
        }
        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No resume file uploaded'
            });
        }

        const name = sanitize.trimString(req.body.name, 255);
        const email = sanitize.email(req.body.email);
        const phone = sanitize.phone(req.body.phone);
        const jobId = req.body.jobId ? sanitize.positiveInt(req.body.jobId) : null;
        const jobTitle = sanitize.trimString(req.body.jobTitle, 255);

        if (!name) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide your name'
            });
        }

        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide a valid email address'
            });
        }

        if (!phone) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide a valid phone number'
            });
        }

        // Check for duplicate application (same email + same job within 24 hours)
        if (jobId) {
            const isDuplicate = await candidateService.hasRecentApplication(email, jobId);
            if (isDuplicate) {
                return res.status(409).json({
                    status: 'error',
                    message: "You've already applied for this position."
                });
            }
        }

        logger.info('New application received', { jobId, jobTitle, filename: req.file.filename });

        // Create candidate record immediately (null batch_id for public applications)
        const candidate = await candidateService.create(null, req.file.originalname, req.file.path, email);
        logger.info('Candidate record created', { candidateId: candidate.id });

        // Return success immediately - don't wait for analysis
        res.json({
            status: 'success',
            message: 'Application submitted successfully! We will review your resume shortly.',
            data: {
                candidateId: candidate?.id
            }
        });

        // Process resume analysis in the background (after response is sent)
        processResumeInBackground(candidate, req.file.path, name, email, phone, jobId, jobTitle);

    } catch (error) {
        logger.error('Error processing application', { error: error.message, stack: error.stack });
        res.status(500).json({
            status: 'error',
            message: 'Failed to process application'
        });
    }
});

/**
 * Background processing function - runs after response is sent to user
 */
async function processResumeInBackground(candidate, filePath, name, email, phone, jobId, jobTitle) {
    try {
        logger.info('Starting background analysis', { candidateId: candidate.id });

        // HARDCODED FOR INITIAL TEST: Always evaluate as Service Technician with 2 years required
        const positionType = 'HVAC Technician';
        const requiredYearsExperience = 2;

        // Analyze the resume
        let analysisResult;
        try {
            analysisResult = await analyzeResume(filePath, positionType, requiredYearsExperience, true);
            logger.info('Resume analyzed', {
                candidateId: candidate.id,
                score: analysisResult?.overallScore,
                recommendation: analysisResult?.hiringRecommendation
            });
        } catch (analyzeError) {
            logger.error('Error analyzing resume', { candidateId: candidate.id, error: analyzeError.message });
            analysisResult = null;
        }

        // Wrap DB operations in a transaction
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            // If we have analysis results, save them with contact info in the summary
            if (analysisResult && candidate) {
                const contactInfo = `Contact: ${name} | Email: ${email} | Phone: ${phone}`;
                const appliedFor = jobTitle ? ` | Applied for: ${jobTitle}` : '';
                const fullSummary = `${contactInfo}${appliedFor}\n\n${analysisResult.summary || ''}`;

                const analysisData = {
                    overallScore: analysisResult.overallScore || 0,
                    scoreOutOf10: Math.round((analysisResult.overallScore || 0) / 10),
                    summary: fullSummary,
                    technicalSkills: {
                        score: analysisResult.scores?.technicalSkills || 0,
                        found: analysisResult.skillsFound || [],
                        missing: [],
                        feedback: ''
                    },
                    certifications: {
                        score: analysisResult.scores?.certifications || 0,
                        found: analysisResult.certificationsFound || [],
                        recommended: [],
                        feedback: ''
                    },
                    experience: {
                        score: analysisResult.scores?.experience || 0,
                        yearsOfExperience: analysisResult.yearsOfExperience || 0,
                        relevantExperience: [],
                        feedback: ''
                    },
                    presentationQuality: {
                        score: analysisResult.scores?.presentation || 0,
                        strengths: [],
                        improvements: [],
                        feedback: ''
                    },
                    strengths: analysisResult.strengths || [],
                    weaknesses: analysisResult.weaknesses || [],
                    recommendations: analysisResult.recommendations || [],
                    hiringRecommendation: analysisResult.hiringRecommendation || 'MAYBE'
                };

                await analysisService.create(candidate.id, analysisData);
            }

            // Update candidate status to completed
            await candidateService.updateStatus(candidate.id, 'completed');

            // Calculate tier and star rating using shared scoring service
            const score = analysisResult?.overallScore || 0;
            const tier = calculateTier(score);
            const star_rating = calculateStarRating(score);

            // Add candidate to specific job pipeline if jobId is provided
            let addedToSpecificJob = false;
            if (jobId && candidate) {
                const job = await jobService.findById(parseInt(jobId));
                if (job) {
                    const pipelineData = {
                        tier,
                        tier_score: Math.round(score),
                        star_rating,
                        give_them_a_chance: false,
                        vehicle_status: 'unknown',
                        ai_summary: `Applied via public link. Score: ${score}/100. ${analysisResult?.hiringRecommendation || 'Pending review'}.`,
                        internal_notes: `Source: Public Apply Page`,
                        tags: ['public-application'],
                        evaluated_position: 'HVAC Technician'
                    };

                    await candidatePipelineService.addToJob(candidate.id, parseInt(jobId), pipelineData);
                    logger.info('Added candidate to job pipeline', { candidateId: candidate.id, jobId });
                    addedToSpecificJob = true;
                }
            }

            // Only add to General Talent Pool if NOT added to a specific job
            if (candidate && !addedToSpecificJob) {
                await addToGeneralTalentPool(candidate.id, name, email, phone, score, tier, star_rating, analysisResult);
                logger.info('Added candidate to General Talent Pool', { candidateId: candidate.id });
            }

            await client.query('COMMIT');
        } catch (txError) {
            await client.query('ROLLBACK');
            throw txError;
        } finally {
            client.release();
        }

        logger.info('Background processing completed', { candidateId: candidate.id });
    } catch (error) {
        logger.error('Error in background processing', { candidateId: candidate.id, error: error.message, stack: error.stack });
        // Update status to indicate error
        try {
            await candidateService.updateStatus(candidate.id, 'error');
        } catch (e) {
            logger.error('Failed to update candidate status to error', { candidateId: candidate.id, error: e.message });
        }
    }
}

/**
 * Add candidate to the General Talent Pool
 * Creates the pool if it doesn't exist (uses userId 1 as admin user)
 */
async function addToGeneralTalentPool(candidateId, name, email, phone, score, tier, star_rating, analysisResult) {
    const ADMIN_USER_ID = 1; // Default admin user

    // Find or create General Talent Pool job
    let generalJob = await jobService.findByTitle(ADMIN_USER_ID, 'General Talent Pool');

    if (!generalJob) {
        // Create the General Talent Pool job if it doesn't exist
        generalJob = await jobService.create(ADMIN_USER_ID, {
            title: 'General Talent Pool',
            description: 'Default talent pool for all candidates including public applications',
            location: 'All Locations',
            required_years_experience: 0,
            vehicle_required: false,
            position_type: 'General',
            status: 'active'
        });
        logger.info('Created General Talent Pool job', { jobId: generalJob.id });
    }

    const pipelineData = {
        tier,
        tier_score: Math.round(score),
        star_rating: Math.round(star_rating * 10) / 10,
        give_them_a_chance: score >= 40 && score < 50,
        vehicle_status: 'unknown',
        ai_summary: `Public application. Score: ${score}/100. ${analysisResult?.hiringRecommendation || 'Pending review'}.`,
        internal_notes: 'Source: Public Apply Page',
        tags: ['public-application'],
        evaluated_position: 'HVAC Technician'
    };

    await candidatePipelineService.addToJob(candidateId, generalJob.id, pipelineData);
}

module.exports = router;
