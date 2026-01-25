require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { analyzeResume } = require('./services/resumeAnalyzer');

async function testAnalysis() {
    const originalFile = path.join(__dirname, 'uploads', 'resume-1759591914241-462604613.pdf');
    const testFile = path.join(__dirname, 'test-resume.pdf');

    // Copy file to avoid deletion of original
    fs.copyFileSync(originalFile, testFile);
    console.log(`Copied ${originalFile} to ${testFile}`);

    try {
        console.log('Starting analysis...');
        const position = 'HVAC Technician';
        const requiredYears = 2;
        const flexible = true;

        const result = await analyzeResume(testFile, position, requiredYears, flexible);
        console.log('Analysis successful!');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Test failed:');
        console.error(error);
        fs.writeFileSync('error_details.txt', JSON.stringify(error, null, 2));
    }
}

testAnalysis();
