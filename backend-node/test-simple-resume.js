require('dotenv').config();
const path = require('path');
const { analyzeResume } = require('./services/resumeAnalyzer');

async function testResumeAnalysis() {
    console.log('Testing resume analysis function...\n');

    // Get a test resume
    const testFile = path.join(__dirname, 'uploads', 'resume-1759591914241-462604613.pdf');

    console.log('Test file:', testFile);
    console.log('Position: HVAC Service Technician');
    console.log('Required years: 2');
    console.log('Flexible: true\n');

    console.log('Starting analysis (this may take 10-15 seconds)...\n');

    try {
        const result = await analyzeResume(testFile, 'HVAC Service Technician', 2, true);

        console.log('✅ SUCCESS! Resume analysis is working!\n');
        console.log('Results:');
        console.log('- Overall Score:', result.overallScore);
        console.log('- Summary:', result.summary);
        console.log('\nFull analysis:');
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('❌ ERROR! Resume analysis failed:');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);

        if (error.status) {
            console.error('HTTP Status:', error.status);
        }

        console.error('\nFull error:', error);
    }
}

testResumeAnalysis();
