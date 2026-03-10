const fs = require('fs');
require('dotenv').config();

const prodConfig = JSON.parse(fs.readFileSync('prod_config.json', 'utf8'));
const envSettings = prodConfig.ConfigurationSettings[0].OptionSettings;
const prodKeySetting = envSettings.find(s => s.OptionName === 'ANTHROPIC_API_KEY');
const prodKey = prodKeySetting ? prodKeySetting.Value : null;
const localKey = process.env.ANTHROPIC_API_KEY;

console.log('--- Key Comparison ---');
if (!prodKey) {
    console.log('Production key missing in config dump.');
} else if (!localKey) {
    console.log('Local key missing in .env');
} else {
    // Check match
    if (prodKey.trim() === localKey.trim()) {
        console.log('✅ Keys MATCH.');
    } else {
        console.log('❌ Keys DO NOT MATCH.');
        console.log(`Local starts with: ${localKey.substring(0, 15)}...`);
        console.log(`Prod  starts with: ${prodKey.substring(0, 15)}...`);
    }
}
