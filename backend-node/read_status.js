const fs = require('fs');

function readJsonFile(filename) {
    try {
        let content = fs.readFileSync(filename, 'utf16le');
        if (!content.trim().startsWith('{')) {
            content = fs.readFileSync(filename, 'utf8');
        }
        content = content.trim();
        if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
        return JSON.parse(content);
    } catch (e) {
        return null;
    }
}

const status = readJsonFile('env_status.json');
if (status && status.Environments && status.Environments.length > 0) {
    const env = status.Environments[0];
    console.log(`Environment: ${env.EnvironmentName}`);
    console.log(`Status: ${env.Status}`);
    console.log(`Health: ${env.Health}`);
    console.log(`VersionLabel: ${env.VersionLabel}`);
} else {
    console.log("Could not read environment status.");
}

const events = readJsonFile('env_events.json');
if (events && events.Events) {
    console.log("\nRecent Events:");
    events.Events.forEach(e => {
        console.log(`[${e.EventDate}] ${e.Severity}: ${e.Message}`);
    });
}
