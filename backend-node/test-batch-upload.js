require('dotenv').config();
const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function testBatchUpload() {
    const formData = new FormData();

    // Add a test resume file
    const resumePath = 'uploads/resume-1762638999435-344101455.pdf';
    formData.append('resumes', fs.createReadStream(resumePath));
    formData.append('position', 'HVAC Service Technician');
    formData.append('requiredYearsExperience', '2');

    console.log('Testing batch upload endpoint...');

    try {
        const response = await fetch('http://localhost:8080/api/resume/upload-batch', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(data, null, 2));

        if (data.status === 'success') {
            console.log('\n✅ Batch upload test PASSED');
        } else {
            console.log('\n❌ Batch upload test FAILED');
            console.log('Error:', data.message);
        }
    } catch (error) {
        console.error('\n❌ Batch upload test FAILED with exception');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testBatchUpload();
