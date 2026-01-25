process.env.USE_POSTGRES = 'true';
// Mock other env vars needed for config
process.env.RDS_HOSTNAME = 'awseb-e-wsmmcq2zc3-stack-awsebrdsdatabase-ehqy2gn0naaf.ckj8wi4e4l42.us-east-1.rds.amazonaws.com';
process.env.RDS_PORT = '5432';
process.env.RDS_DB_NAME = 'ebdb';
process.env.RDS_USERNAME = 'talosuser';
process.env.RDS_PASSWORD = 'TalosAdmin2024!New';
process.env.DB_SSL = 'true'; // SSL required for RDS

const { candidatePipelineService } = require('./services/databaseService');
const { pool } = require('./config/database');

async function test() {
    try {
        console.log('Testing getTalentPool...');
        const result = await candidatePipelineService.getTalentPool();
        console.log('Success!', result.length + ' records found');
    } catch (error) {
        console.error('FAILED TO GET TALENT POOL:');
        console.error(error);
    } finally {
        pool.end();
    }
}

test();
