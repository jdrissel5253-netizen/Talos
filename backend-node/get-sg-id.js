const fs = require('fs');

try {
    // Read utf16le as binary/string properly
    const content = fs.readFileSync('rds_instances.json', 'utf16le');

    // Regex for VpcSecurityGroupId
    const matches = content.match(/"VpcSecurityGroupId"\s*:\s*"(sg-[a-z0-9]+)"/);

    if (matches) {
        console.log('SECURITY_GROUP_ID: ' + matches[1]);
        fs.writeFileSync('sg_id.txt', matches[1]);
    } else {
        console.log('No Security Group ID found.');
    }
} catch (e) {
    console.error(e.message);
}
