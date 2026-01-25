const fs = require('fs');

try {
    // Read raw file (utf-16le likely if PowerShell redirect, but try utf8 if small)
    // Actually, aws cli >> redirect creates utf16le on powershell
    let content;
    try {
        content = fs.readFileSync('eb_config.json', 'utf16le');
        JSON.parse(content); // Test if valid
    } catch (e) {
        content = fs.readFileSync('eb_config.json', 'utf8');
    }

    const json = JSON.parse(content);

    // Structure: ConfigurationSettings[0].OptionSettings
    const settings = json.ConfigurationSettings[0].OptionSettings;

    // Filter for environment variables
    const envVars = settings.filter(s => s.Namespace === 'aws:elasticbeanstalk:application:environment');

    console.log('--- ENV VARS ---');
    envVars.forEach(v => {
        console.log(`${v.OptionName}=${v.Value}`);
    });

} catch (e) {
    console.error('Error parsing config:', e.message);
}
