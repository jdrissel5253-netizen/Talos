const { execSync } = require('child_process');
const fs = require('fs');

const CONFIG = {
    appName: 'talos-hvac-backend',
    envName: 'talos-hvac-backend-env',
    bucket: 'elasticbeanstalk-us-east-1-387904338435',
    region: 'us-east-1',
    solutionStack: '64bit Amazon Linux 2023 v6.4.2 running Node.js 20', // Updated stack
    zipFile: 'talos-backend.zip'
};

// Env Vars to set
const ENV_VARS = [
    { Namespace: 'aws:elasticbeanstalk:application:environment', OptionName: 'NODE_ENV', Value: 'production' },
    { Namespace: 'aws:elasticbeanstalk:application:environment', OptionName: 'PORT', Value: '8080' },
    // Database
    { Namespace: 'aws:elasticbeanstalk:application:environment', OptionName: 'USE_POSTGRES', Value: 'true' },
    { Namespace: 'aws:elasticbeanstalk:application:environment', OptionName: 'DB_HOST', Value: 'talos-db.cktooy4kca01.us-east-1.rds.amazonaws.com' },
    { Namespace: 'aws:elasticbeanstalk:application:environment', OptionName: 'DB_PORT', Value: '5432' },
    { Namespace: 'aws:elasticbeanstalk:application:environment', OptionName: 'DB_NAME', Value: 'talos' }, // Changed to talos matching .env
    { Namespace: 'aws:elasticbeanstalk:application:environment', OptionName: 'DB_USER', Value: 'talos_admin' },
    { Namespace: 'aws:elasticbeanstalk:application:environment', OptionName: 'DB_PASSWORD', Value: 'Perseus1998!gracie' },
    { Namespace: 'aws:elasticbeanstalk:application:environment', OptionName: 'DB_SSL', Value: 'true' },
    // API Keys
    { Namespace: 'aws:elasticbeanstalk:application:environment', OptionName: 'ANTHROPIC_API_KEY', Value: 'REPLACE_WITH_REAL_KEY' },
];

function run() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const versionLabel = `v-restore-${timestamp}`;
        const s3Key = `${versionLabel}-${CONFIG.zipFile}`;

        console.log('1. Uploading code to S3...');
        execSync(`aws s3 cp ${CONFIG.zipFile} s3://${CONFIG.bucket}/${s3Key} --no-cli-pager`, { stdio: 'inherit' });

        console.log('2. Creating Application Version...');
        execSync(`aws elasticbeanstalk create-application-version --application-name ${CONFIG.appName} --version-label ${versionLabel} --source-bundle S3Bucket=${CONFIG.bucket},S3Key=${s3Key} --no-cli-pager`, { stdio: 'inherit' });

        console.log('3. Creating Environment (this may take 10+ minutes)...');

        // Construct Option Settings string
        const options = ENV_VARS.map(opt => `Namespace=${opt.Namespace},OptionName=${opt.OptionName},Value=${opt.Value}`).join(' ');

        // IAM Instance Profile is crucial. Assuming 'aws-elasticbeanstalk-ec2-role' exists.
        const command = `aws elasticbeanstalk create-environment --application-name ${CONFIG.appName} --environment-name ${CONFIG.envName} --solution-stack-name "${CONFIG.solutionStack}" --version-label ${versionLabel} --option-settings ${options} Namespace=aws:autoscaling:launchconfiguration,OptionName=IamInstanceProfile,Value=aws-elasticbeanstalk-ec2-role --no-cli-pager`;

        console.log('Executing create-environment command...');
        execSync(command, { stdio: 'inherit' });

        console.log('✅ Environment creation initiated successfully!');
    } catch (error) {
        console.error('❌ Failed:', error.message);
        if (error.stdout) console.log('STDOUT:', error.stdout.toString());
        if (error.stderr) console.error('STDERR:', error.stderr.toString());
    }
}


run();
