const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { userService, sanitize } = require('../services/databaseService');
const logger = require('../services/logger');
const gmailService = require('../services/gmailService');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

/**
 * Register a new user
 */
router.post('/register', async (req, res) => {
    try {
        const email = sanitize.email(req.body.email);
        const password = req.body.password;
        const companyName = sanitize.trimString(req.body.companyName, 255);

        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'A valid email address is required'
            });
        }

        if (!password || password.length < 8) {
            return res.status(400).json({
                status: 'error',
                message: 'Password must be at least 8 characters'
            });
        }

        // Check if user already exists
        const existingUser = await userService.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Determine role — bootstrap admin if email matches ADMIN_EMAIL
        const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase() : null;
        const role = (adminEmail && email === adminEmail) ? 'admin' : 'user';

        // Create user
        const user = await userService.create(email, passwordHash, companyName, role);

        // Notify owner of new signup (fire-and-forget — never block registration)
        if (role !== 'admin') {
            const notifyEmail = process.env.NOTIFY_EMAIL || process.env.ADMIN_EMAIL;
            if (notifyEmail) {
                gmailService.sendEmail({
                    to: notifyEmail,
                    subject: `New Talos signup: ${companyName || email}`,
                    html: `<p>A new company just signed up for Talos.</p>
<ul>
  <li><strong>Company:</strong> ${companyName || '(not provided)'}</li>
  <li><strong>Email:</strong> ${email}</li>
  <li><strong>User ID:</strong> ${user.id}</li>
  <li><strong>Time:</strong> ${new Date().toUTCString()}</li>
</ul>`
                }).catch(err => logger.warn('Signup notification email failed', { error: err.message }));
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    companyName: user.company_name,
                    role: user.role
                }
            }
        });

    } catch (error) {
        logger.error('Registration error', { error: error.message, stack: error.stack });
        res.status(500).json({
            status: 'error',
            message: 'Failed to register user'
        });
    }
});

/**
 * Login user
 */
router.post('/login', async (req, res) => {
    try {
        const email = sanitize.email(req.body.email);
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Valid email and password are required'
            });
        }

        // Find user
        const user = await userService.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        // Determine effective role — re-apply admin bootstrap in case account predates it
        const loginAdminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase() : null;
        const effectiveRole = (loginAdminEmail && user.email === loginAdminEmail) ? 'admin' : (user.role || 'user');

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: effectiveRole },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            status: 'success',
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    companyName: user.company_name,
                    role: effectiveRole
                }
            }
        });

    } catch (error) {
        logger.error('Login error', { error: error.message, stack: error.stack });
        res.status(500).json({
            status: 'error',
            message: 'Failed to login'
        });
    }
});

/**
 * Middleware to verify JWT token
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Access token required'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
};

/**
 * Middleware to require admin role
 */
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({
            status: 'error',
            message: 'Admin access required'
        });
    }
    next();
};

/**
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', async (req, res) => {
    // Always return success to avoid revealing whether an email exists
    const genericOk = () => res.json({ status: 'success', message: 'If that email exists, a reset link has been sent.' });

    try {
        const email = sanitize.email(req.body.email);
        if (!email) return genericOk();

        const user = await userService.findByEmail(email);
        if (!user) return genericOk();

        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await userService.setResetToken(user.id, tokenHash, expiresAt);

        const frontendUrl = process.env.FRONTEND_URL || 'https://gotalos.io';
        const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;

        gmailService.sendEmail({
            to: email,
            subject: 'Reset your Talos password',
            html: `<p>You requested a password reset for your Talos account.</p>
<p><a href="${resetLink}">Click here to reset your password</a></p>
<p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`
        }).catch(err => logger.warn('Password reset email failed', { error: err.message }));

        logger.info('Password reset requested', { userId: user.id });
        genericOk();
    } catch (error) {
        logger.error('Forgot password error', { error: error.message });
        genericOk(); // never reveal errors
    }
});

/**
 * POST /api/auth/reset-password
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password || password.length < 8) {
            return res.status(400).json({ status: 'error', message: 'Token and a password of at least 8 characters are required.' });
        }

        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const user = await userService.findByResetToken(tokenHash);

        if (!user) {
            return res.status(400).json({ status: 'error', message: 'This reset link is invalid or has expired.' });
        }

        const newHash = await bcrypt.hash(password, 10);
        await userService.consumeResetToken(user.id, newHash);

        logger.info('Password reset completed', { userId: user.id });
        res.json({ status: 'success', message: 'Password updated. You can now log in.' });
    } catch (error) {
        logger.error('Reset password error', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to reset password.' });
    }
});

module.exports = {
    router,
    authenticateToken,
    requireAdmin
};
