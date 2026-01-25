const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testBatchEndpoint() {
    console.log('Testing batch resume upload endpoint...\n');

    // Get a test resume
    const testFile = path.join(__dirname, 'uploads', 'resume-1759591914241-462604613.pdf');

    if (!fs.existsSync(testFile)) {
        console.error('❌ Test file not found:', testFile);
        return;
    }

    console.log('✓ Test file found:', testFile);

    // Create FormData
    const form = new FormData();
    form.append('resumes', fs.createReadStream(testFile));
    form.append('position', 'HVAC Service Technician');
    form.append('requiredYearsExperience', '2');
    form.append('flexibleOnTitle', 'true');

    console.log('\nSending request to http://localhost:8082/api/resume/upload-batch\n');

    try {
        const response = await fetch('http://localhost:8082/api/resume/upload-batch', {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ SUCCESS! Batch upload endpoint is working!');
            console.log('\nResponse:');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log('❌ ERROR! Server responded with error:');
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('❌ ERROR! Failed to test endpoint:');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('\nFull error:', error);
    }
}

testBatchEndpoint();
