const express = require('express');
const multer = require('multer');
const path = require('path');
const { analyzeResume } = require('../services/resumeAnalyzer');
const { batchService, candidateService, analysisService, jobService, candidatePipelineService } = require('../services/databaseService');

const router = express.Router();

// Helper function to get or create the default "General Talent Pool" job
async function getOrCreateGeneralTalentPoolJob(userId) {
    try {
        // Try to find existing General Talent Pool job
        const jobs = await jobService.findByUserId(userId);
        let generalJob = jobs.find(job => job.title === 'General Talent Pool');

        if (!generalJob) {
            // Create the General Talent Pool job if it doesn't exist
            generalJob = await jobService.create(userId, {
                title: 'General Talent Pool',
                description: 'Default talent pool for all uploaded resumes',
                location: 'All Locations',
                required_years_experience: 0,
                vehicle_required: false,
                position_type: 'General',
                flexible_on_title: true
            });
            console.log('Created General Talent Pool job:', generalJob.id);
        }

        return generalJob;
    } catch (error) {
        console.error('Error getting/creating General Talent Pool job:', error);
        throw error;
    }
}

// Helper function to add candidate to General Talent Pool
async function addCandidateToTalentPool(candidateId, analysis, evaluatedPosition) {
    try {
        const userId = 1; // Default user ID
        const generalJob = await getOrCreateGeneralTalentPoolJob(userId);

        // Calculate tier based on score (with NaN protection)
        const score = Number(analysis.overallScore) || 0;
        let tier, star_rating;

        if (score >= 80) {
            tier = 'green';
            star_rating = 4.0 + (score - 80) / 20; // 4.0 to 5.0
        } else if (score >= 50) {
            tier = 'yellow';
            star_rating = 2.0 + (score - 50) / 30 * 1.9; // 2.0 to 3.9
        } else {
            tier = 'red';
            star_rating = Math.max(0, score / 50 * 1.5); // 0 to 1.5
        }

        const pipelineData = {
            tier,
            tier_score: Math.round(score) || 0,
            star_rating: Math.round(star_rating * 10) / 10 || 0,
            give_them_a_chance: score >= 70 && score < 80,
            vehicle_status: 'unknown',
            ai_summary: analysis.summary || 'Resume analyzed and added to talent pool',
            internal_notes: 'Auto-added to talent pool',
            tags: [],
            evaluated_position: evaluatedPosition || 'General'
        };

        await candidatePipelineService.addToJob(candidateId, generalJob.id, pipelineData);
        console.log(`Added candidate ${candidateId} to General Talent Pool (evaluated for: ${evaluatedPosition})`);
    } catch (error) {
        console.error('Error adding candidate to talent pool:', error);
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
        const allowedTypes = /pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
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

        // For now, use a default user ID (we'll add real auth later)
        const userId = 1;

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
        console.error('Resume analysis error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to analyze resume',
            error: error.message
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

        // For now, use a default user ID (we'll add real auth later)
        // In production, this would come from the authenticated session
        const userId = 1;

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
                console.log(`Analyzing resume ${i + 1}/${req.files.length}: ${file.originalname} for position: ${position}`);

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
                console.error(`Error analyzing ${file.originalname}:`, error);

                // Update candidate status to error if it was created
                if (candidate) {
                    await candidateService.updateStatus(candidate.id, 'error');
                }

                errors.push({
                    filename: file.originalname,
                    error: error.message
                });

                results.push({
                    id: candidate?.id || i,
                    filename: file.originalname,
                    status: 'error',
                    error: error.message
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
        console.error('Batch resume analysis error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to analyze resumes',
            error: error.message
        });
    }
});

module.exports = router;
