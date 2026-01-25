const fs = require('fs');

try {
    // Try utf-16le first as that's what PowerShell often outputs
    let content = fs.readFileSync('eb_apps.json', 'utf16le');
    if (!content.trim().startsWith('{')) {
        content = fs.readFileSync('eb_apps.json', 'utf8');
    }

    // Clean up
    content = content.trim();
    if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);

    const json = JSON.parse(content);
    console.log("Found Applications:");
    json.Applications.forEach(app => {
        console.log(`- "${app.ApplicationName}"`);
    });
} catch (e) {
    console.error("Error:", e.message);
}
