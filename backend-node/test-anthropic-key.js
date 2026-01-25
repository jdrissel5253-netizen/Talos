require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

async function testAnthropicKey() {
    console.log('Testing Anthropic API Key...\n');

    // Check if key exists
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('❌ ERROR: ANTHROPIC_API_KEY not found in environment variables');
        return;
    }

    console.log('✓ API Key found in environment');
    console.log(`Key starts with: ${process.env.ANTHROPIC_API_KEY.substring(0, 20)}...`);

    // Initialize client
    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
    });

    try {
        console.log('\nSending test message to Anthropic API...');

        const message = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 100,
            messages: [{
                role: 'user',
                content: 'Say "API key is working!" if you can read this.'
            }]
        });

        console.log('\n✅ SUCCESS! Anthropic API is working!');
        console.log('Response:', message.content[0].text);
        console.log('\nAPI Details:');
        console.log('- Model:', message.model);
        console.log('- Tokens used:', message.usage.input_tokens + message.usage.output_tokens);

    } catch (error) {
        console.error('\n❌ ERROR: Failed to connect to Anthropic API');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);

        if (error.status) {
            console.error('HTTP Status:', error.status);
        }

        if (error.status === 401) {
            console.error('\n⚠️  This is an authentication error. Your API key may be:');
            console.error('   - Invalid or expired');
            console.error('   - Not properly set in the .env file');
            console.error('   - Corrupted (check for extra spaces/characters)');
        }

        console.error('\nFull error:', error);
    }
}

testAnthropicKey();
