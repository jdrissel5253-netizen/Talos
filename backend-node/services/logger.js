const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

const isProduction = process.env.NODE_ENV === 'production';
const configuredLevel = (process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug')).toLowerCase();
const minLevel = LOG_LEVELS[configuredLevel] ?? LOG_LEVELS.info;

/**
 * Replace values of specified keys with '[REDACTED]'.
 * Works on a shallow copy — does not mutate the original.
 */
function redact(obj, keys) {
    if (!obj || typeof obj !== 'object') return obj;
    const copy = { ...obj };
    for (const key of keys) {
        if (key in copy) {
            copy[key] = '[REDACTED]';
        }
    }
    return copy;
}

function formatMessage(level, message, meta) {
    if (isProduction) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...meta
        };
        return JSON.stringify(entry);
    }
    // Dev: human-readable
    if (meta && Object.keys(meta).length > 0) {
        return `[${level.toUpperCase()}] ${message} ${JSON.stringify(meta)}`;
    }
    return `[${level.toUpperCase()}] ${message}`;
}

function log(level, message, meta = {}) {
    if (LOG_LEVELS[level] < minLevel) return;

    const formatted = formatMessage(level, message, meta);

    switch (level) {
        case 'error':
            console.error(formatted);
            break;
        case 'warn':
            console.warn(formatted);
            break;
        default:
            console.log(formatted);
            break;
    }
}

const logger = {
    debug: (message, meta) => log('debug', message, meta),
    info: (message, meta) => log('info', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    error: (message, meta) => log('error', message, meta),
    redact
};

module.exports = logger;
