const fs = require('fs');

try {
    let raw = fs.readFileSync('dist_info.json', 'utf16le');
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.substr(1);

    let data;
    try {
        data = JSON.parse(raw);
    } catch {
        raw = fs.readFileSync('dist_info.json', 'utf8');
        data = JSON.parse(raw);
    }

    const items = data.Distribution.DistributionConfig.Origins.Items;
    const backend = items.find(o => o.Id === 'TalosBackend');
    if (backend) {
        fs.writeFileSync('backend_domain.txt', backend.DomainName);
        console.log('Written to backend_domain.txt');
    } else {
        console.log('BACKEND_NOT_FOUND');
    }
} catch (e) {
    console.error(e.message);
}
