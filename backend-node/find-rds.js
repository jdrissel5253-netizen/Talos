const fs = require('fs');

const outFile = 'password_matches.txt';
fs.writeFileSync(outFile, '--- START SEARCH PASSWORD ---\n');

function searchFile(file, encoding) {
    try {
        fs.appendFileSync(outFile, `Reading ${file} with ${encoding}...\n`);
        if (!fs.existsSync(file)) {
            // fs.appendFileSync(outFile, `File not found: ${file}\n`);
            return;
        }
        const content = fs.readFileSync(file, encoding);

        // Search for password patterns
        // Look for RDS_PASSWORD value
        const matches = content.match(/RDS_PASSWORD.*?Value.*?["'](.*?)["']/s) ||
            content.match(/RDS_PASSWORD.*?Value"\s*:\s*"(.*?)"/s) ||
            content.match(/DB_PASSWORD.*?Value.*?["'](.*?)["']/s) ||
            content.match(/password.*?["'](.*?)["']/i);

        // Also simple grep for "rds_password" nearby context
        const regex = /RDS_PASSWORD.{0,50}/gi;
        const allMatches = content.match(regex);

        if (allMatches) {
            fs.appendFileSync(outFile, `MATCHES in ${file}:\n`);
            allMatches.forEach(m => {
                // Try to grab a bit more context
                const idx = content.indexOf(m);
                const context = content.substring(idx, idx + 200).replace(/\r/g, '').replace(/\n/g, ' ');
                fs.appendFileSync(outFile, ' - ' + context + '\n');
            });
        }
    } catch (e) {
        fs.appendFileSync(outFile, `Failed to read ${file}: ${e.message}\n`);
    }
}

searchFile('config_settings.json', 'utf16le');
searchFile('config_settings.json', 'utf8');
searchFile('backend_logs.txt', 'utf8');
searchFile('backend_logs.txt', 'utf16le'); // just in case
searchFile('backend_logs_new.txt', 'utf8');
searchFile('final_env.json', 'utf16le');
searchFile('env_utf8.json', 'utf8');
