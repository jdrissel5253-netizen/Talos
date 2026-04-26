const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { userService, sanitize } = require('../services/databaseService');
const logger = require('../services/logger');

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
            return res.status(403).json({
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

module.exports = {
    router,
    authenticateToken,
    requireAdmin
};
