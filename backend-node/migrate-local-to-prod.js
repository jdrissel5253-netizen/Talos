require('dotenv').config();
const Database = require('better-sqlite3');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

async function migrate() {
    console.log('🚀 Starting migration check...');

    // 1. Connect to SQLite
    const sqlitePath = path.join(__dirname, 'talos.db');
    if (!fs.existsSync(sqlitePath)) {
        console.error('❌ Local database not found at:', sqlitePath);
        process.exit(1);
    }
    const sqlite = new Database(sqlitePath);
    console.log('✅ Connected to local SQLite');

    // 2. Connect to Postgres
    const pgPool = new Pool({
        host: 'awseb-e-wsmmcq2zc3-stack-awsebrdsdatabase-ehqy2gn0naaf.ckj8wi4e4l42.us-east-1.rds.amazonaws.com',
        port: 5432,
        database: 'ebdb',
        user: 'talosuser',
        password: 'TalosAdmin2024!New',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
    });

    try {
        await pgPool.query('SELECT 1');
        console.log('✅ Connected to production PostgreSQL');
    } catch (err) {
        console.error('❌ Failed to connect to PostgreSQL:', err.message);
        console.log('Target Host:', 'talos-db.cktooy4kca01.us-east-1.rds.amazonaws.com');
        process.exit(1);
    }

    // Tables in dependency order
    const tables = [
        'users',
        'batches',
        'jobs',
        'candidates',
        'analyses',
        'candidate_pipeline',
        'communication_log'
    ];

    for (const tableName of tables) {
        console.log(`\n📦 Migrating table: ${tableName}`);

        try {
            // Get data from SQLite
            const rows = sqlite.prepare(`SELECT * FROM "${tableName}"`).all();
            console.log(`   Found ${rows.length} rows in local DB`);

            if (rows.length === 0) continue;

            // Get columns from first row
            // Note: We assume all rows have same columns, which is true for SQL
            // But we need to handle potential schema differences if any.
            // We'll rely on the SQLite columns matching PG columns.

            let migratedCount = 0;
            let errorCount = 0;

            for (const row of rows) {
                const keys = Object.keys(row);
                // Postgres parameter placeholders: $1, $2, ...
                const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
                const columns = keys.map(k => `"${k}"`).join(', '); // Quote identifiers
                const values = keys.map(k => {
                    let val = row[k];
                    // Handle specific data type conversions if needed
                    // SQLite stores booleans as 0/1, Postgres might fail if it strictly expects true/false or if mapped to specialized types
                    // But usually 0/1 works for integers. If PG column is boolean, we might need conversion?
                    // Let's assume schema compatibility for now.
                    return val;
                });

                const query = `
                    INSERT INTO "${tableName}" (${columns}) 
                    VALUES (${placeholders})
                    ON CONFLICT (id) DO NOTHING
                `;

                try {
                    await pgPool.query(query, values);
                    migratedCount++;
                } catch (err) {
                    // Ignore common errors? No, we want to know.
                    console.error(`   ❌ Error inserting ID ${row.id}:`, err.message);
                    errorCount++;
                }
            }

            console.log(`   ✅ Migrated ${migratedCount} rows (${errorCount} errors)`);

            // Fix sequence if needed (for auto-increment)
            // This is important because we inserted IDs manually.
            try {
                // Determine sequence name (usually table_id_seq)
                const seqResult = await pgPool.query(`
                    SELECT pg_get_serial_sequence('${tableName}', 'id') as seq
                `);
                const seqName = seqResult.rows[0]?.seq;
                if (seqName) {
                    await pgPool.query(`SELECT setval('${seqName}', (SELECT MAX(id) FROM "${tableName}"))`);
                    // console.log(`   🔄 Updated sequence ${seqName}`);
                }
            } catch (seqErr) {
                // Ignore sequence errors (e.g. if no sequence or not permitted)
            }

        } catch (err) {
            console.error(`   ❌ Failed to process table ${tableName}:`, err.message);
        }
    }

    console.log('\n✨ Migration completed');
    await pgPool.end();
}

migrate().catch(console.error);
