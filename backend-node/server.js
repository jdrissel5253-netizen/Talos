if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
const logger = require('./services/logger');

// Require critical environment variables at startup
const REQUIRED_ENV = ['JWT_SECRET', 'ANTHROPIC_API_KEY'];
if (process.env.NODE_ENV === 'production') {
    REQUIRED_ENV.push('DB_HOST', 'DB_PASSWORD');
}
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length > 0) {
    logger.error('Missing required environment variables', { missing });
    process.exit(1);
}

const app = express();
const PORT = 8080; // Hardcoded to fix AWS EB stuck env var mismatch

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Verify database connection on startup
const db = require('./config/database');
const USE_POSTGRES = process.env.USE_POSTGRES === 'true' || process.env.NODE_ENV === 'production';
(async () => {
    try {
        if (USE_POSTGRES) {
            // Verify core tables exist (schema managed by run-all-migrations.js)
            const result = await db.query(`
                SELECT table_name FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name IN ('users', 'jobs', 'candidates', 'analyses', 'candidate_pipeline', 'communication_log')
            `);
            const tables = result.rows.map(r => r.table_name);
            logger.info('Database connected', { tables: tables.join(', ') });
            if (tables.length < 6) {
                logger.warn('Some tables are missing. Run: node database/migrations/run-all-migrations.js');
            }
        } else {
            // SQLite — apply schema directly for local dev
            const fs_schema = require('fs');
            const path_schema = require('path');
            const schemaPath = path_schema.join(__dirname, 'database', 'schema-jobs-talent-pool.sql');
            if (fs_schema.existsSync(schemaPath)) {
                const schema = fs_schema.readFileSync(schemaPath, 'utf8');
                const statements = schema.split(';').filter(s => s.trim());
                for (const stmt of statements) {
                    try { await db.query(stmt); } catch (e) { /* table exists */ }
                }
            }
            logger.info('SQLite database schema verified');
        }
    } catch (err) {
        logger.error('Database startup warning', { error: err.message });
    }
})();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Enforce HTTPS in production (behind AWS ALB/ELB)
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            return res.redirect(301, `https://${req.header('host')}${req.url}`);
        }
        next();
    });
}

// Compression middleware - gzip responses over 1KB
app.use(compression({ level: 6, threshold: 1024 }));

// Request ID middleware — must come before routes
app.use((req, res, next) => {
    req.requestId = crypto.randomUUID();
    res.setHeader('X-Request-Id', req.requestId);
    req._startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - req._startTime;
        logger.info('request_end', {
            requestId: req.requestId,
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            durationMs: duration
        });
    });

    next();
});

// Rate limiting - general (100 requests per 15 minutes per IP)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many requests, please try again later.' }
});

// Strict rate limiting for public endpoints (10 per 15 minutes per IP)
const publicApplyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many applications submitted. Please try again later.' }
});

// Auth rate limiting (20 per 15 minutes per IP) - prevents brute force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many login attempts. Please try again later.' }
});

app.use(generalLimiter);

// CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? [
            'https://talos-hvac-frontend-1759612745.s3-website-us-east-1.amazonaws.com',
            'https://gotalos.io',
            'https://www.gotalos.io'
        ]
        : 'http://localhost:3000'
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Routes
const resumeRoutes = require('./routes/resumeRoutes');
const { router: authRoutes, authenticateToken } = require('./routes/authRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');
const jobRoutes = require('./routes/jobRoutes');
const candidatePipelineRoutes = require('./routes/candidatePipelineRoutes');
const applyRoutes = require('./routes/applyRoutes');

// Root route
app.get('/', (req, res) => {
    res.json({
        service: 'Talos Backend API',
        version: '1.0.0',
        status: 'running'
    });
});

// Protected routes (require authentication)
app.use('/api/resume', authenticateToken, resumeRoutes);
app.use('/api/jobs', authenticateToken, jobRoutes);
app.use('/api/pipeline', authenticateToken, candidatePipelineRoutes);

// Public routes (no auth required, stricter rate limits)
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/auth/google', authLimiter, googleAuthRoutes);
app.use('/api/apply', publicApplyLimiter, applyRoutes);
app.get('/api/health', async (req, res) => {
    let dbStatus = 'unknown';
    try {
        await db.query('SELECT 1');
        dbStatus = 'connected';
    } catch {
        dbStatus = 'disconnected';
    }
    const status = dbStatus === 'connected' ? 'healthy' : 'degraded';
    res.status(status === 'healthy' ? 200 : 503).json({
        status,
        service: 'Talos Backend (Node.js)',
        database: dbStatus,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Metrics endpoint for basic observability
app.get('/api/metrics', (req, res) => {
    const mem = process.memoryUsage();
    res.json({
        uptime: process.uptime(),
        memory: {
            rss: mem.rss,
            heapTotal: mem.heapTotal,
            heapUsed: mem.heapUsed
        },
        pid: process.pid,
        nodeVersion: process.version
    });
});

app.post('/api/demo-request', (req, res) => {
    logger.info('Demo request received', { timestamp: new Date().toISOString() });

    // Simulate processing delay
    setTimeout(() => {
        res.json({
            message: 'Demo request submitted successfully',
            status: 'success',
            id: Math.random().toString(36).substr(2, 9)
        });
    }, 500);
});

// Error handling middleware
app.use((error, req, res, next) => {
    logger.error('Unhandled route error', { error: error.message, stack: error.stack, requestId: req.requestId });
    res.status(500).json({
        message: 'Internal server error',
        status: 'error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Route not found',
        status: 'error'
    });
});

// Process-level error handlers
process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { error: err.message, stack: err.stack });
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason: String(reason) });
});

// Start server
app.listen(PORT, () => {
    logger.info('Talos Backend Server started', { port: PORT });
    logger.info('Endpoints available', {
        health: `/api/health`,
        demo: `/api/demo-request`,
        resume: `/api/resume/upload`,
        jobs: `/api/jobs`,
        pipeline: `/api/pipeline`
    });
});
