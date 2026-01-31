const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { candidateService, analysisService } = require('../services/databaseService');
const { analyzeResume } = require('../services/resumeAnalyzer');

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
router.post('/', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No resume file uploaded'
            });
        }

        const { name, email, phone, jobId, jobTitle } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide name, email, and phone number'
            });
        }

        console.log('New application received:', {
            name,
            email,
            phone,
            jobTitle,
            jobId,
            filename: req.file.filename
        });

        // HARDCODED FOR INITIAL TEST: Always evaluate as Service Technician with 2 years required
        // TODO: Make this configurable based on job posting later
        const positionType = 'HVAC Technician';
        const requiredYearsExperience = 2;

        // Analyze the resume
        let analysisResult;
        try {
            analysisResult = await analyzeResume(req.file.path, positionType, requiredYearsExperience, true);
            console.log('Resume analyzed for:', name, '| Score:', analysisResult?.overallScore, '| Recommendation:', analysisResult?.hiringRecommendation);
        } catch (analyzeError) {
            console.error('Error analyzing resume:', analyzeError);
            // Continue without analysis - we still want to save the application
            analysisResult = null;
        }

        // Create candidate record using existing service (null batch_id for public applications)
        const candidate = await candidateService.create(null, req.file.originalname, req.file.path);

        // If we have analysis results, save them with contact info in the summary
        if (analysisResult && candidate) {
            // Include contact info in the summary for visibility
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

        res.json({
            status: 'success',
            message: 'Application submitted successfully',
            data: {
                candidateId: candidate?.id,
                analyzed: !!analysisResult
            }
        });
    } catch (error) {
        console.error('Error processing application:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process application'
        });
    }
});

module.exports = router;
