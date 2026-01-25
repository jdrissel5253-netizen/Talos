require('dotenv').config();
const { batchService, candidateService, analysisService } = require('./services/databaseService');
const { analyzeResume } = require('./services/resumeAnalyzer');
const path = require('path');
const fs = require('fs');

async function testFullFlow() {
    console.log('Starting Full Flow Test...');
    console.log('Environment:', {
        USE_POSTGRES: process.env.USE_POSTGRES,
        NODE_ENV: process.env.NODE_ENV
    });

    const testFile = path.join(__dirname, 'test-resume-full.pdf');
    // Ensure we have a file
    if (!fs.existsSync(testFile)) {
        // Create a dummy PDF if none exists or copy one
        const originalFile = path.join(__dirname, 'uploads', 'resume-1759591914241-462604613.pdf');
        if (fs.existsSync(originalFile)) {
            fs.copyFileSync(originalFile, testFile);
        } else {
            console.error('No test PDF found to copy.');
            process.exit(1);
        }
    }

    try {
        // 1. Test DB Connection by creating a batch
        console.log('1. Creating Batch...');
        const batch = await batchService.create(1, 'Test Batch ' + Date.now(), 1);
        console.log('   Batch Created:', batch.id);

        // 2. Create Candidate
        console.log('2. Creating Candidate...');
        const candidate = await candidateService.create(batch.id, 'test-resume.pdf', testFile);
        console.log('   Candidate Created:', candidate.id);

        // 3. Analyze Resume
        console.log('3. Analyzing Resume...');
        const analysis = await analyzeResume(testFile, 'HVAC Technician', 2, true);
        console.log('   Analysis Complete');

        // 4. Save Analysis
        console.log('4. Saving Analysis...');
        await analysisService.create(candidate.id, analysis);
        console.log('   Analysis Saved');

        console.log('SUCCESS: Full flow completed without error.');

    } catch (error) {
        console.error('FAILURE: Test failed with error:');
        console.error(error);
        if (error.code) console.error('Error Code:', error.code); // Postgres error codes
    }
}

testFullFlow();
