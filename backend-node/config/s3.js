const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const fs = require('fs');
const os = require('os');

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

const BUCKET = process.env.S3_RESUME_BUCKET || 'elasticbeanstalk-us-east-1-387904338435';
const PREFIX = 'resumes/';

const isS3Key = (filePath) => filePath && !filePath.startsWith('/') && !filePath.startsWith('C:') && !filePath.startsWith('\\');

async function uploadResume(buffer, originalFilename) {
    const ext = path.extname(originalFilename).toLowerCase() || '.pdf';
    const key = `${PREFIX}application-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const contentType = ext === '.pdf' ? 'application/pdf'
        : ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/msword';

    await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType
    }));
    return key;
}

async function downloadResumeToTemp(s3Key) {
    const response = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: s3Key }));
    const tmpPath = path.join(os.tmpdir(), path.basename(s3Key));
    await new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(tmpPath);
        response.Body.pipe(writeStream);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
        response.Body.on('error', reject);
    });
    return tmpPath;
}

async function streamResumeTo(s3Key, res) {
    const response = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: s3Key }));
    const ext = path.extname(s3Key).toLowerCase();
    const contentType = ext === '.pdf' ? 'application/pdf'
        : ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/msword';
    res.setHeader('Content-Type', contentType);
    if (response.ContentLength) res.setHeader('Content-Length', response.ContentLength);
    response.Body.pipe(res);
}

async function deleteResume(s3Key) {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: s3Key }));
}

module.exports = { uploadResume, downloadResumeToTemp, streamResumeTo, deleteResume, isS3Key };
