const fs = require('fs');

try {
    // Read as utf16le
    const content = fs.readFileSync('eb_config.json', 'utf16le');
    // Write as utf8
    fs.writeFileSync('eb_config_utf8.json', content, 'utf8');
    console.log('Converted eb_config.json to eb_config_utf8.json');
} catch (e) {
    console.log('Failed to convert: ' + e.message);
    // Try reading as utf8
    try {
        const content = fs.readFileSync('eb_config.json', 'utf8');
        fs.writeFileSync('eb_config_utf8.json', content, 'utf8');
        console.log('Copied eb_config.json (was likely utf8) to eb_config_utf8.json');
    } catch (e2) {
        console.log('Failed to read as utf8 too: ' + e2.message);
    }
}
