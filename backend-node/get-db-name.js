const fs = require('fs');

try {
    const content = fs.readFileSync('rds_instances.json', 'utf16le');
    const match = content.match(/"DBName"\s*:\s*"(.*?)"/);
    if (match) {
        console.log('DB_NAME: ' + match[1]);
    } else {
        console.log('DBName not found (value might be null or missing).');
    }
} catch (e) {
    console.error(e.message);
}
