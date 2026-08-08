const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const { S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');
const logger = require('./logger');

const REGION = process.env.AWS_REGION || 'us-east-1';
const QUEUE_URL = process.env.INDEED_INGEST_QUEUE_URL
    || 'https://sqs.us-east-1.amazonaws.com/387904338435/talos-indeed-ingest-queue';

const sqs = new SQSClient({ region: REGION });
const s3 = new S3Client({ region: REGION });

let stopped = false;

// Phase 1 scope: log that a message arrived, its size, and its recipient.
// No parsing, no database writes — those come in later phases.
async function handleMessage(message) {
    const envelope = JSON.parse(message.Body);

    // SNS sends a one-time SubscriptionConfirmation message when a new
    // subscription is created — nothing to log, just skip it.
    if (envelope.Type !== 'Notification') {
        logger.info('Indeed ingest: non-notification SNS message received', { type: envelope.Type });
        return;
    }

    const notification = JSON.parse(envelope.Message);
    // Envelope recipients (SMTP RCPT TO), not the To: header — a forwarding
    // rule on the customer's side can make those diverge.
    const recipients = notification.receipt?.recipients || notification.mail?.destination || [];
    const action = notification.receipt?.action;

    let sizeBytes = null;
    if (action?.bucketName && action?.objectKey) {
        try {
            const head = await s3.send(new HeadObjectCommand({ Bucket: action.bucketName, Key: action.objectKey }));
            sizeBytes = head.ContentLength;
        } catch (err) {
            logger.warn('Indeed ingest: could not read raw message size from S3', { error: err.message, key: action.objectKey });
        }
    }

    logger.info('Indeed ingest: message received', {
        receivedAt: new Date().toISOString(),
        recipients,
        sizeBytes,
        s3Key: action?.objectKey,
    });
}

async function pollLoop() {
    while (!stopped) {
        try {
            const result = await sqs.send(new ReceiveMessageCommand({
                QueueUrl: QUEUE_URL,
                MaxNumberOfMessages: 10,
                WaitTimeSeconds: 20,
            }));

            for (const message of result.Messages || []) {
                try {
                    await handleMessage(message);
                    await sqs.send(new DeleteMessageCommand({ QueueUrl: QUEUE_URL, ReceiptHandle: message.ReceiptHandle }));
                } catch (err) {
                    logger.error('Indeed ingest: failed to handle message, leaving on queue', { error: err.message });
                    // Not deleted — redrive policy sends it to the DLQ after 5 receives.
                }
            }
        } catch (err) {
            logger.error('Indeed ingest: poll loop error', { error: err.message });
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

function startIndeedIngestListener() {
    pollLoop().catch(err => logger.error('Indeed ingest: poll loop crashed', { error: err.message }));
    logger.info('Indeed ingest listener started', { queueUrl: QUEUE_URL });
}

module.exports = { startIndeedIngestListener };
