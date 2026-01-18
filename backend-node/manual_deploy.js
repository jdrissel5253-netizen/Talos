const { execSync } = require('child_process');
const fs = require('fs');

// Configuration - Updated bucket
const BUCKET = 'elasticbeanstalk-us-east-1-387904338435';
const APP_NAME = 'talos-hvac-backend';
const ENV_NAME = 'talos-hvac-backend-env';
const ZIP_FILE = 'talos-backend.zip';
const VERSION_LABEL = `v-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`;

try {
    console.log(`Starting deployment to ${ENV_NAME} (${APP_NAME})...`);

    // 1. Upload to S3
    const s3Key = `${VERSION_LABEL}-${ZIP_FILE}`; // Simplified key for this bucket
    console.log(`Uploading ${ZIP_FILE} to s3://${BUCKET}/${s3Key} ...`);
    // Removing --no-cli-pager for s3 cp just in case
    execSync(`aws s3 cp ${ZIP_FILE} s3://${BUCKET}/${s3Key}`, { stdio: 'inherit' });

    // 2. Create Application Version
    console.log(`Creating application version ${VERSION_LABEL}...`);
    execSync(`aws elasticbeanstalk create-application-version --application-name ${APP_NAME} --version-label ${VERSION_LABEL} --source-bundle S3Bucket=${BUCKET},S3Key=${s3Key} --no-cli-pager`, { stdio: 'inherit' });

    // 3. Update Environment
    console.log(`Updating environment ${ENV_NAME} to version ${VERSION_LABEL}...`);
    execSync(`aws elasticbeanstalk update-environment --environment-name ${ENV_NAME} --version-label ${VERSION_LABEL} --no-cli-pager`, { stdio: 'inherit' });

    console.log('Deployment initiated successfully! Monitor status via AWS Console or CLI.');
} catch (error) {
    console.error('Deployment script failed:', error.message);
    process.exit(1);
}
