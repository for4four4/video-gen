"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = exports.authMiddleware = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};
exports.authMiddleware = authMiddleware;
// Middleware to check admin role
const adminMiddleware = (req, res, next) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        // Check if user exists
        const existingUser = await db_1.default.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // Get signup bonus from settings
        const settingsResult = await db_1.default.query("SELECT value FROM settings WHERE key = 'signupBonusPoints'");
        const signupBonus = parseInt(settingsResult.rows[0]?.value || '50');
        // Create user
        const result = await db_1.default.query(`INSERT INTO users (email, password_hash, name, points_balance, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING id, email, name, points_balance, created_at`, [email, passwordHash, name || null, signupBonus]);
        const user = result.rows[0];
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, isAdmin: false }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                pointsBalance: user.points_balance,
            },
            token,
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        // Find user
        const result = await db_1.default.query('SELECT id, email, password_hash, name, points_balance, is_admin, status FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const user = result.rows[0];
        // Check if user is blocked
        if (user.status === 'blocked') {
            return res.status(403).json({ error: 'Account is blocked' });
        }
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, isAdmin: user.is_admin }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                pointsBalance: user.points_balance,
                isAdmin: user.is_admin,
            },
            token,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        // Find user
        const result = await db_1.default.query('SELECT id, email FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            // Don't reveal if email exists for security
            return res.json({ message: 'If the email exists, a reset link will be sent' });
        }
        // Generate reset token
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour
        // Save reset token
        await db_1.default.query('UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3', [resetToken, resetTokenExpires, email]);
        // In production, send email with reset link
        // For now, just return the token (for development)
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
        console.log('Password reset link:', resetLink);
        res.json({
            message: 'If the email exists, a reset link will be sent',
            resetLink, // Remove in production
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }
        // Find user with valid reset token
        const result = await db_1.default.query("SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()", [token]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }
        // Hash new password
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
        // Update password and clear reset token
        await db_1.default.query('UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2', [passwordHash, result.rows[0].id]);
        res.json({ message: 'Password reset successful' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/auth/me - Get current user
router.get('/me', exports.authMiddleware, async (req, res) => {
    try {
        const result = await db_1.default.query('SELECT id, email, name, points_balance, total_spent_rub, generations_count, status, is_admin, created_at FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = result.rows[0];
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                pointsBalance: user.points_balance,
                totalSpentRub: user.total_spent_rub,
                generationsCount: user.generations_count,
                status: user.status,
                isAdmin: user.is_admin,
                createdAt: user.created_at,
            },
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
