require('dotenv').config();
try {
    console.log('Attempting to load resumeAnalyzer...');
    require('./services/resumeAnalyzer');
    console.log('resumeAnalyzer loaded successfully');
} catch (e) {
    console.error('FAILED to load resumeAnalyzer:');
    console.error(e);
}
