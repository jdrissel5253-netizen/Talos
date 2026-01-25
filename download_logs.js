const fs = require('fs');
const https = require('https');
const path = require('path');

try {
    const data = fs.readFileSync('eb_logs_url.json', 'utf8');
    const json = JSON.parse(data);
    const url = json.EnvironmentInfo[0].Message;

    console.log('Downloading logs from:', url);

    const file = fs.createWriteStream("logs.zip");
    const request = https.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(() => {
                console.log("Download completed: logs.zip");
            });
        });
    });
} catch (e) {
    console.error("Error:", e);
}
