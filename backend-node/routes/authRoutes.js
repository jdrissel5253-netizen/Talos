const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const { userService, teamInviteService, sanitize } = require('../services/databaseService');
const logger = require('../services/logger');
const gmailService = require('../services/gmailService');
const { uploadLogo, deleteLogo, keyFromUrl } = require('../config/logoS3');

const router = express.Router();

const logoUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
        const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
            return cb(null, true);
        }
        cb(new Error('Only PNG, JPG, WEBP, or SVG images are allowed'));
    }
});

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

            // Welcome email to the new user (fire-and-forget)
            gmailService.sendEmail({
                to: email,
                subject: 'Welcome to Talos — here\'s how to get started',
                html: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
  <div style="background:#111318;padding:28px 32px;margin-bottom:24px">
    <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px">Talos</span>
    <span style="color:#4ade80;font-size:20px;font-weight:700">.</span>
  </div>

  <div style="padding:0 32px 32px">
    <h1 style="font-size:22px;font-weight:700;margin:0 0 8px">Welcome${companyName ? ', ' + companyName : ''}!</h1>
    <p style="color:#555;margin:0 0 24px">Your Talos account is ready. Here's how to get up and running in a few minutes:</p>

    <div style="border-left:3px solid #4ade80;padding-left:16px;margin-bottom:16px">
      <p style="margin:0 0 4px;font-weight:600">1. Post your first job</p>
      <p style="margin:0;color:#555;font-size:14px">Go to Jobs in your dashboard and fill out the job details. Talos will score every applicant automatically.</p>
    </div>

    <div style="border-left:3px solid #4ade80;padding-left:16px;margin-bottom:16px">
      <p style="margin:0 0 4px;font-weight:600">2. Share your application link</p>
      <p style="margin:0;color:#555;font-size:14px">Each job gets a unique link you can post on Indeed, Facebook, or text directly to candidates.</p>
    </div>

    <div style="border-left:3px solid #4ade80;padding-left:16px;margin-bottom:32px">
      <p style="margin:0 0 4px;font-weight:600">3. Review your pipeline</p>
      <p style="margin:0;color:#555;font-size:14px">Applicants are ranked Green / Yellow / Red automatically. You'll get an email alert for every strong candidate.</p>
    </div>

    <a href="https://www.gotalos.io/dashboard"
       style="display:inline-block;background:#4ade80;color:#111318;font-weight:700;font-size:14px;padding:12px 28px;text-decoration:none;letter-spacing:0.02em">
      Go to Dashboard →
    </a>

    <p style="margin:32px 0 0;font-size:13px;color:#888">
      Questions? Reply to this email or reach us at <a href="mailto:jake@gotalos.io" style="color:#4ade80">jake@gotalos.io</a>.
    </p>
  </div>
</div>`
            }).catch(err => logger.warn('Welcome email failed', { error: err.message }));
        }

        // Generate JWT token — a freshly registered account always owns itself
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role, accountId: user.id },
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

        // A teammate's account shares the inviting owner's jobs/candidates/pipeline data
        const accountId = user.parent_user_id || user.id;

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: effectiveRole, accountId },
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
                    role: effectiveRole,
                    isTeamMember: accountId !== user.id
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

    jwt.verify(token, JWT_SECRET, async (err, user) => {
        if (err) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid or expired token'
            });
        }
        try {
            // A removed teammate (or deleted owner) still holds a validly-signed,
            // unexpired token — confirm the row wasn't deleted out from under it.
            const dbUser = await userService.findById(user.userId);
            if (!dbUser) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid or expired token'
                });
            }
        } catch (error) {
            logger.error('Auth existence check failed', { error: error.message });
            return res.status(500).json({ status: 'error', message: 'Authentication check failed' });
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
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await userService.findById(req.user.userId);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
        // Company-facing fields (name/logo/scheduling/service area) live on the account
        // owner's row — every teammate's public job postings show the same branding.
        const account = req.user.accountId === user.id ? user : await userService.findById(req.user.accountId);
        res.json({
            status: 'success',
            data: {
                id: user.id,
                email: user.email,
                companyName: account?.company_name,
                role: user.role,
                createdAt: user.created_at,
                schedulingLink: account?.scheduling_link || '',
                logoUrl: account?.logo_url || '',
                serviceArea: account?.service_area || '',
                deliverabilityConfirmedAt: account?.deliverability_confirmed_at || null,
                isTeamMember: req.user.accountId !== user.id
            }
        });
    } catch (error) {
        logger.error('Get profile error', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to load profile' });
    }
});

/**
 * PUT /api/auth/profile
 */
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const companyName = sanitize.trimString(req.body.companyName, 255);
        const schedulingLink = sanitize.trimString(req.body.schedulingLink, 500);
        const serviceArea = sanitize.trimString(req.body.serviceArea, 255);
        // Company profile is shared account-wide, so it's stored on the owner's row
        const user = await userService.updateProfile(req.user.accountId, { companyName, schedulingLink, serviceArea });
        res.json({ status: 'success', data: { companyName: user.company_name, schedulingLink: user.scheduling_link || '', logoUrl: user.logo_url || '', serviceArea: user.service_area || '' } });
    } catch (error) {
        logger.error('Update profile error', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to update profile' });
    }
});

/**
 * POST /api/auth/send-test-email
 * Sends a real Talos alert-style email to the account's inbox so employers can
 * confirm it doesn't land in spam before they're relying on it for real applicants.
 */
router.post('/send-test-email', authenticateToken, async (req, res) => {
    try {
        const account = await userService.findById(req.user.accountId);
        if (!account?.email) {
            return res.status(404).json({ status: 'error', message: 'Account email not found' });
        }

        await gmailService.sendEmail({
            to: account.email,
            subject: 'Test alert — this is what a Talos applicant notification looks like',
            html: `<p>This is a test email from Talos.</p>
<p>When a strong applicant applies to one of your jobs, you'll get an email that looks like this one — sent from <strong>jake@gotalos.io</strong>.</p>
<p>If this landed in your Spam or Junk folder, mark it "Not Junk" and add <strong>jake@gotalos.io</strong> to your safe senders list so real applicant alerts always reach your inbox:</p>
<ul>
  <li><strong>Outlook / Microsoft 365:</strong> Settings → Mail → Junk email → Safe senders and domains → add jake@gotalos.io</li>
  <li><strong>Gmail:</strong> Open the email, click the three-dot menu → "Add jake@gotalos.io to Contacts list" (or drag it out of Spam into your inbox)</li>
</ul>
<p>Once you've found this email, go back to Talos and confirm you got it.</p>`
        });

        logger.info('Deliverability test email sent', { accountId: req.user.accountId, to: account.email });
        res.json({ status: 'success' });
    } catch (error) {
        logger.error('Send test email error', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to send test email' });
    }
});

/**
 * POST /api/auth/confirm-deliverability
 * User confirms they received the test email — marks the onboarding step done.
 */
router.post('/confirm-deliverability', authenticateToken, async (req, res) => {
    try {
        const user = await userService.confirmDeliverability(req.user.accountId);
        res.json({ status: 'success', data: { deliverabilityConfirmedAt: user.deliverability_confirmed_at } });
    } catch (error) {
        logger.error('Confirm deliverability error', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to confirm' });
    }
});

/**
 * POST /api/auth/logo
 */
router.post('/logo', authenticateToken, logoUpload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No logo file uploaded' });
        }

        const existing = await userService.findById(req.user.accountId);
        const { url } = await uploadLogo(req.file.buffer, req.file.originalname, req.file.mimetype, req.user.accountId);
        const user = await userService.updateLogo(req.user.accountId, url);

        const oldKey = keyFromUrl(existing?.logo_url);
        if (oldKey) deleteLogo(oldKey).catch(err => logger.warn('Failed to clean up old logo', { error: err.message }));

        res.json({ status: 'success', data: { logoUrl: user.logo_url } });
    } catch (error) {
        logger.error('Logo upload error', { error: error.message });
        res.status(400).json({ status: 'error', message: error.message || 'Failed to upload logo' });
    }
});

/**
 * DELETE /api/auth/logo
 */
router.delete('/logo', authenticateToken, async (req, res) => {
    try {
        const existing = await userService.findById(req.user.accountId);
        const oldKey = keyFromUrl(existing?.logo_url);

        const user = await userService.updateLogo(req.user.accountId, null);
        if (oldKey) deleteLogo(oldKey).catch(err => logger.warn('Failed to clean up old logo', { error: err.message }));

        res.json({ status: 'success', data: { logoUrl: user.logo_url || '' } });
    } catch (error) {
        logger.error('Logo delete error', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to remove logo' });
    }
});

/**
 * PUT /api/auth/change-password
 */
router.put('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ status: 'error', message: 'New password must be at least 8 characters' });
        }
        const user = await userService.findById(req.user.userId);
        const valid = await bcrypt.compare(currentPassword || '', user.password_hash);
        if (!valid) return res.status(400).json({ status: 'error', message: 'Current password is incorrect' });
        const hash = await bcrypt.hash(newPassword, 10);
        await userService.updatePassword(req.user.userId, hash);
        res.json({ status: 'success', message: 'Password updated' });
    } catch (error) {
        logger.error('Change password error', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to change password' });
    }
});

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

/**
 * GET /api/auth/team
 * List teammates + pending invites sharing this account's data.
 * Available to the owner and to invited members (read-only for members).
 */
router.get('/team', authenticateToken, async (req, res) => {
    try {
        const isOwner = req.user.userId === req.user.accountId;
        const [members, pendingInvites] = await Promise.all([
            userService.findTeamMembers(req.user.accountId),
            isOwner ? teamInviteService.findPendingByOwner(req.user.accountId) : Promise.resolve([])
        ]);
        res.json({
            status: 'success',
            data: {
                isOwner,
                members: members.map(m => ({ id: m.id, email: m.email, createdAt: m.created_at })),
                pendingInvites: pendingInvites.map(i => ({ id: i.id, email: i.email, expiresAt: i.expires_at }))
            }
        });
    } catch (error) {
        logger.error('List team error', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to load team' });
    }
});

/**
 * POST /api/auth/invite
 * Owner invites a teammate by email — they'll share all of the owner's jobs/candidates/pipeline.
 */
router.post('/invite', authenticateToken, async (req, res) => {
    try {
        if (req.user.userId !== req.user.accountId) {
            return res.status(403).json({ status: 'error', message: 'Only the account owner can invite teammates' });
        }

        const email = sanitize.email(req.body.email);
        if (!email) {
            return res.status(400).json({ status: 'error', message: 'A valid email address is required' });
        }

        const existingUser = await userService.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ status: 'error', message: 'A user with this email already exists' });
        }

        const owner = await userService.findById(req.user.accountId);

        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await teamInviteService.create(req.user.accountId, email, tokenHash, expiresAt);

        const frontendUrl = process.env.FRONTEND_URL || 'https://gotalos.io';
        const inviteLink = `${frontendUrl}/accept-invite?token=${rawToken}`;

        gmailService.sendEmail({
            to: email,
            subject: `${owner?.company_name || 'A Talos team'} invited you to join Talos`,
            html: `<p>${owner?.company_name || owner?.email || 'A Talos user'} invited you to join their team on Talos.</p>
<p><a href="${inviteLink}">Click here to accept the invite and set your password</a></p>
<p>This link expires in 7 days. If you weren't expecting this, you can ignore this email.</p>`
        }).catch(err => logger.warn('Invite email failed', { error: err.message }));

        logger.info('Team invite sent', { ownerId: req.user.accountId, email });
        res.json({ status: 'success', message: 'Invite sent' });
    } catch (error) {
        logger.error('Invite error', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to send invite' });
    }
});

/**
 * POST /api/auth/accept-invite
 * Accept a team invite — creates the teammate's login and logs them in.
 */
router.post('/accept-invite', async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password || password.length < 8) {
            return res.status(400).json({ status: 'error', message: 'Token and a password of at least 8 characters are required.' });
        }

        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const invite = await teamInviteService.findByTokenHash(tokenHash);

        if (!invite) {
            return res.status(400).json({ status: 'error', message: 'This invite link is invalid or has expired.' });
        }

        const existingUser = await userService.findByEmail(invite.email);
        if (existingUser) {
            return res.status(400).json({ status: 'error', message: 'A user with this email already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await userService.createTeamMember(invite.email, passwordHash, invite.owner_user_id);
        await teamInviteService.markAccepted(invite.id);

        const token2 = jwt.sign(
            { userId: user.id, email: user.email, role: user.role, accountId: invite.owner_user_id },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        logger.info('Team invite accepted', { userId: user.id, ownerId: invite.owner_user_id });
        res.status(201).json({
            status: 'success',
            message: 'Invite accepted',
            data: {
                token: token2,
                user: { id: user.id, email: user.email, role: user.role, isTeamMember: true }
            }
        });
    } catch (error) {
        logger.error('Accept invite error', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to accept invite.' });
    }
});

/**
 * DELETE /api/auth/team/:id
 * Owner removes a teammate's access.
 */
router.delete('/team/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.userId !== req.user.accountId) {
            return res.status(403).json({ status: 'error', message: 'Only the account owner can remove teammates' });
        }
        const memberId = sanitize.positiveInt(req.params.id);
        if (!memberId) {
            return res.status(400).json({ status: 'error', message: 'Invalid teammate ID' });
        }
        const removed = await userService.removeTeamMember(memberId, req.user.accountId);
        if (!removed) {
            return res.status(404).json({ status: 'error', message: 'Teammate not found' });
        }
        res.json({ status: 'success', message: 'Teammate removed' });
    } catch (error) {
        logger.error('Remove teammate error', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to remove teammate' });
    }
});

module.exports = {
    router,
    authenticateToken,
    requireAdmin
};
