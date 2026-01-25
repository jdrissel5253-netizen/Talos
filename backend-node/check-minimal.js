const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'talos.db'));
try {
    const c = db.prepare('SELECT count(*) as count FROM candidates').get();
    const j = db.prepare('SELECT count(*) as count FROM jobs').get();
    console.log(`DATA_CHECK_RESULT: Candidates=${c.count}, Jobs=${j.count}`);
} catch (e) { console.log(e.message); }
