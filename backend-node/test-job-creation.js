const { jobService } = require('./services/databaseService');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

async function testJobCreation() {
    console.log('Testing job creation...');
    console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY);
    console.log('API Key starts with:', process.env.ANTHROPIC_API_KEY?.substring(0, 10));

    const testJobData = {
        title: 'Test HVAC Technician',
        company_name: 'Test Company',
        description: 'Test description',
        location: 'Test City, 12345',
        job_location_type: 'on-site',
        city: 'Test City',
        zip_code: '12345',
        job_type: 'full_time',
        required_years_experience: 2,
        vehicle_required: false,
        position_type: 'HVAC Technician',
        salary_min: null,
        salary_max: null,
        pay_range_min: 20,
        pay_range_max: 30,
        pay_type: 'hourly',
        expected_hours: '40',
        work_schedule: 'Monday-Friday',
        benefits: JSON.stringify(['Health Insurance', '401k']),
        key_responsibilities: JSON.stringify(['Install HVAC systems', 'Perform maintenance', 'Troubleshoot issues']),
        qualifications_years: 2,
        qualifications_certifications: JSON.stringify(['EPA Universal']),
        qualifications_other: null,
        education_requirements: 'technical_school',
        other_relevant_titles: JSON.stringify(['Service Technician']),
        advancement_opportunities: true,
        advancement_timeline: '1-2 years',
        company_culture: 'Team-oriented environment',
        ai_generated_description: null,
        flexible_on_title: true
    };

    try {
        console.log('Attempting to create job...');
        const job = await jobService.create(1, testJobData);
        console.log('✅ Job created successfully:', job.id);
    } catch (error) {
        console.error('❌ Error creating job:', error.message);
        console.error('Full error:', error);
    }

    console.log('\nTesting Anthropic API...');
    try {
        const message = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 100,
            messages: [{
                role: "user",
                content: "Say hello"
            }]
        });
        console.log('✅ Anthropic API working:', message.content[0].text);
    } catch (error) {
        console.error('❌ Anthropic API error:', error.message);
        console.error('Full error:', error);
    }
}

testJobCreation();
