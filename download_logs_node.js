const fs = require('fs');
const https = require('https');
const { exec } = require('child_process');

try {
    // Try reading as UTF-16LE first (common powershell output)
    let jsonRaw = fs.readFileSync('eb_logs_url.json', 'utf16le').trim();

    // If it looks like garbage (e.g. lots of nulls or weird chars), try utf8
    if (!jsonRaw.startsWith('{')) {
        console.log("UTF-16LE read result didn't start with {, trying utf8...");
        jsonRaw = fs.readFileSync('eb_logs_url.json', 'utf8').trim();
    }

    // Clean up any BOM or weird start
    if (jsonRaw.charCodeAt(0) === 0xFEFF) {
        jsonRaw = jsonRaw.slice(1);
    }

    // Sometimes powershell output adds extra lines or non-json text at start/end if not careful
    // Find the first { and last }
    const startIndex = jsonRaw.indexOf('{');
    const endIndex = jsonRaw.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
        jsonRaw = jsonRaw.substring(startIndex, endIndex + 1);
    }

    const json = JSON.parse(jsonRaw);
    const url = json.EnvironmentInfo[0].Message;

    console.log('Downloading from:', url.substring(0, 50) + '...');

    const file = fs.createWriteStream("logs_node.zip");
    https.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(() => {
                console.log("Download completed: logs_node.zip");
            });
        });
    });

} catch (e) {
    console.error("Script Error:", e);
}
