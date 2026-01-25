const fs = require('fs');

try {
    const content = fs.readFileSync('rds_instances.json', 'utf16le');
    const match = content.match(/"MasterUsername"\s*:\s*"(.*?)"/);
    if (match) {
        console.log('MASTER_USERNAME: ' + match[1]);
    } else {
        console.log('MasterUsername not found via regex.');
    }
} catch (e) {
    console.error(e.message);
}
