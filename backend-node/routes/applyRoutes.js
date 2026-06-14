const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { candidateService, analysisService, candidatePipelineService, jobService, userService, sanitize } = require('../services/databaseService');
const { analyzeResume } = require('../services/resumeAnalyzer');
const { calculateTier, calculateStarRating, determineGiveThemAChance } = require('../services/scoringService');
const { uploadResume, downloadResumeToTemp, isS3Key } = require('../config/s3');
const db = require('../config/database');
const logger = require('../services/logger');
const gmailService = require('../services/gmailService');

const router = express.Router();

// Use memory storage — files go to S3, not local disk
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Please upload a PDF or Word document (.docx).'));
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

        logger.info('New application received', { jobId, jobTitle, filename: req.file.originalname });

        // Upload file to S3 and store the S3 key
        const s3Key = await uploadResume(req.file.buffer, req.file.originalname);

        // Create candidate record immediately (null batch_id for public applications)
        const candidate = await candidateService.create(null, req.file.originalname, s3Key, email);
        logger.info('Candidate record created', { candidateId: candidate.id });

        // Return success immediately - don't wait for analysis
        res.json({
            status: 'success',
            message: 'Application submitted successfully! We will review your resume shortly.',
            data: {
                candidateId: candidate?.id
            }
        });

        // Confirmation email to candidate (fire-and-forget)
        if (email) {
            gmailService.sendEmail({
                to: email,
                subject: `Application received${jobTitle ? ` — ${jobTitle}` : ''}`,
                html: `<p>Hi ${name || 'there'},</p>
<p>We received your application${jobTitle ? ` for <strong>${jobTitle}</strong>` : ''} and our team will review it shortly.</p>
<p>We'll be in touch if your experience is a match. Thanks for applying!</p>
<br>
<p>— The Hiring Team</p>`
            }).catch(err => logger.warn('Candidate confirmation email failed', { error: err.message }));
        }

        // Process resume analysis in the background (after response is sent)
        processResumeInBackground(candidate, s3Key, name, email, phone, jobId, jobTitle);

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
async function processResumeInBackground(candidate, s3KeyOrPath, name, email, phone, jobId, jobTitle) {
    let tempPath = null;
    try {
        logger.info('Starting background analysis', { candidateId: candidate.id });

        // Download from S3 to a temp file for analysis
        const filePath = isS3Key(s3KeyOrPath)
            ? (tempPath = await downloadResumeToTemp(s3KeyOrPath))
            : s3KeyOrPath;

        // Look up job to get the correct position type and requirements
        let positionType = 'HVAC Service Technician';
        let requiredYearsExperience = 2;
        let flexibleOnTitle = true;
        let jobLocation = null;
        let jobForAnalysis = null;
        if (jobId) {
            jobForAnalysis = await jobService.findById(parseInt(jobId));
            if (jobForAnalysis) {
                positionType = jobForAnalysis.position_type || jobForAnalysis.title || positionType;
                requiredYearsExperience = jobForAnalysis.required_years_experience || requiredYearsExperience;
                flexibleOnTitle = jobForAnalysis.flexible_on_title !== false;
                jobLocation = [jobForAnalysis.city, jobForAnalysis.zip_code].filter(Boolean).join(', ') || null;
            }
        }

        // Analyze the resume
        let analysisResult;
        try {
            analysisResult = await analyzeResume(filePath, positionType, requiredYearsExperience, flexibleOnTitle, jobLocation);
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
                    technicalSkills: analysisResult.technicalSkills || { score: 0, found: [], missing: [], feedback: '' },
                    certifications: analysisResult.certifications || { score: 0, found: [], recommended: [], feedback: '' },
                    experience: analysisResult.experience || { score: 0, yearsOfExperience: 0, relevantExperience: [], feedback: '' },
                    presentationQuality: analysisResult.presentationQuality || { score: 0, strengths: [], improvements: [], feedback: '' },
                    strengths: analysisResult.strengths || [],
                    weaknesses: analysisResult.weaknesses || [],
                    recommendations: analysisResult.recommendations || [],
                    hiringRecommendation: analysisResult.hiringRecommendation || 'MAYBE'
                };

                await analysisService.create(candidate.id, analysisData);
            }

            // Update candidate status to completed
            await candidateService.updateStatus(candidate.id, 'completed');

            // Store the candidate's display name (prefer what they typed on the form,
            // fall back to the name the AI extracted from the resume)
            await candidateService.updateFullName(candidate.id, name || analysisResult?.candidateName);

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
                        give_them_a_chance: determineGiveThemAChance({
                            score,
                            yearsOfExperience: analysisResult?.experience?.yearsOfExperience,
                            requiredYears: job.required_years_experience,
                            certificationsScore: analysisResult?.certifications?.score,
                            technicalSkillsScore: analysisResult?.technicalSkills?.score,
                            presentationScore: analysisResult?.presentationQuality?.score,
                            summary: analysisResult?.summary
                        }),
                        vehicle_status: 'unknown',
                        ai_summary: `Applied via public link. Score: ${score}/100. ${analysisResult?.hiringRecommendation || 'Pending review'}.`,
                        internal_notes: `Source: Public Apply Page`,
                        tags: ['public-application'],
                        evaluated_position: positionType
                    };

                    await candidatePipelineService.addToJob(candidate.id, parseInt(jobId), pipelineData);
                    logger.info('Added candidate to job pipeline', { candidateId: candidate.id, jobId });
                    addedToSpecificJob = true;

                    // Notify job owner immediately for green-tier candidates only
                    // All tiers appear in the daily digest regardless
                    if (tier === 'green') {
                        userService.findById(job.user_id).then(owner => {
                            if (!owner?.email) return;
                            const frontendUrl = process.env.FRONTEND_URL || 'https://gotalos.io';
                            return gmailService.sendEmail({
                                to: owner.email,
                                subject: `Strong applicant for ${jobTitle || 'your job'} — 🟢 ${score}/100`,
                                html: `<p>A top-scoring candidate just applied for <strong>${jobTitle || 'your open position'}</strong>.</p>
<ul>
  <li><strong>Name:</strong> ${name || '(not provided)'}</li>
  <li><strong>Email:</strong> ${email}</li>
  <li><strong>Phone:</strong> ${phone || '(not provided)'}</li>
  <li><strong>AI Score:</strong> ${score}/100 — Green tier</li>
  <li><strong>Recommendation:</strong> ${analysisResult?.hiringRecommendation || 'Pending'}</li>
</ul>
<p><a href="${frontendUrl}/jobs-management">View in your pipeline →</a></p>`
                            });
                        }).catch(err => logger.warn('Owner notification email failed', { error: err.message }));
                    }
                }
            }

            // Only add to General Talent Pool if NOT added to a specific job
            if (candidate && !addedToSpecificJob) {
                await addToGeneralTalentPool(candidate.id, name, email, phone, score, tier, star_rating, analysisResult, positionType);
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
        try {
            await candidateService.updateStatus(candidate.id, 'error');
        } catch (e) {
            logger.error('Failed to update candidate status to error', { candidateId: candidate.id, error: e.message });
        }
    } finally {
        if (tempPath) {
            try { fs.unlinkSync(tempPath); } catch (_) {}
        }
    }
}

/**
 * Add candidate to the General Talent Pool
 * Creates the pool if it doesn't exist (uses userId 1 as admin user)
 */
async function addToGeneralTalentPool(candidateId, name, email, phone, score, tier, star_rating, analysisResult, positionType = 'HVAC Service Technician') {
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
        give_them_a_chance: determineGiveThemAChance({
            score,
            yearsOfExperience: analysisResult?.experience?.yearsOfExperience,
            requiredYears: generalJob.required_years_experience,
            certificationsScore: analysisResult?.certifications?.score,
            technicalSkillsScore: analysisResult?.technicalSkills?.score,
            presentationScore: analysisResult?.presentationQuality?.score,
            summary: analysisResult?.summary
        }),
        vehicle_status: 'unknown',
        ai_summary: `Public application. Score: ${score}/100. ${analysisResult?.hiringRecommendation || 'Pending review'}.`,
        internal_notes: 'Source: Public Apply Page',
        tags: ['public-application'],
        evaluated_position: positionType
    };

    await candidatePipelineService.addToJob(candidateId, generalJob.id, pipelineData);
}

module.exports = router;
