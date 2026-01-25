const fs = require('fs');

const outFile = 'extracted_env_regex.txt';
fs.writeFileSync(outFile, '--- START REGEX SEARCH ---\n');

function searchFile(file, encoding) {
    try {
        fs.appendFileSync(outFile, `Reading ${file} with ${encoding}...\n`);
        const content = fs.readFileSync(file, encoding);

        // Search for OptionName and Value pairs in JSON-like structure
        // "OptionName": "RDS_PASSWORD", "Value": "..."

        const regex = /"OptionName"\s*:\s*"([a-z0-9_]+)"\s*,\s*"ResourceName".*?"Value"\s*:\s*"(.*?)"/gis;
        // Simplified regex just for OptionName and Value which are close
        // In eb config output, they might be:
        // {
        //   "Namespace": "aws:elasticbeanstalk:application:environment",
        //   "OptionName": "RDS_PASSWORD",
        //   "Value": "..."
        // }

        let match;
        const simpleRegex = /"OptionName"\s*:\s*"([a-z0-9_]+)".*?"Value"\s*:\s*"(.*?)"/gis;

        while ((match = simpleRegex.exec(content)) !== null) {
            // Check if it looks like an environment variable (uppercase)
            if (match[1] === 'RDS_PASSWORD' || match[1] === 'DB_PASSWORD' || match[1] === 'RDS_USERNAME') {
                fs.appendFileSync(outFile, `${match[1]}=${match[2]}\n`);
            }
        }

    } catch (e) {
        fs.appendFileSync(outFile, `Error: ${e.message}\n`);
    }
}

searchFile('eb_config.json', 'utf16le');
searchFile('eb_config.json', 'utf8');
