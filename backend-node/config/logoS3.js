const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

const BUCKET = process.env.S3_LOGO_BUCKET || 'talos-company-logos-387904338435';
const PREFIX = 'logos/';

function publicUrlFor(key) {
    return `https://${BUCKET}.s3.amazonaws.com/${key}`;
}

async function uploadLogo(buffer, originalFilename, contentType, userId) {
    const ext = path.extname(originalFilename).toLowerCase() || '.png';
    const key = `${PREFIX}user-${userId}-${Date.now()}${ext}`;

    await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType
    }));

    return { key, url: publicUrlFor(key) };
}

async function deleteLogo(key) {
    if (!key) return;
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

// Extract the S3 key from a stored public logo URL, e.g. for cleanup on re-upload
function keyFromUrl(url) {
    if (!url) return null;
    const marker = `.s3.amazonaws.com/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return url.slice(idx + marker.length);
}

module.exports = { uploadLogo, deleteLogo, keyFromUrl };
