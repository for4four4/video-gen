"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const auth_1 = require("./auth");
const router = (0, express_1.Router)();
// GET /api/admin/overview - Get overview metrics
router.get('/overview', auth_1.authMiddleware, auth_1.adminMiddleware, async (req, res) => {
    try {
        const range = req.query.range || '30d';
        let days = 30;
        if (range === '24h')
            days = 1;
        else if (range === '7d')
            days = 7;
        else if (range === '90d')
            days = 90;
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        // Get visits count
        const visitsResult = await db_1.default.query("SELECT COUNT(*) as total FROM visits WHERE created_at >= $1", [startDate]);
        // Get users count and new users
        const usersResult = await db_1.default.query("SELECT COUNT(*) as total FROM users WHERE created_at >= $1", [startDate]);
        // Get generations count
        const generationsResult = await db_1.default.query("SELECT COUNT(*) as total FROM generations WHERE created_at >= $1", [startDate]);
        // Get revenue
        const revenueResult = await db_1.default.query("SELECT COALESCE(SUM(amount_rub), 0) as total FROM payments WHERE status = 'succeeded' AND created_at >= $1", [startDate]);
        res.json({
            visits: { total: parseInt(visitsResult.rows[0].total), change: 18, series: [] },
            users: { total: parseInt(usersResult.rows[0].total), change: 24, series: [] },
            generations: { total: parseInt(generationsResult.rows[0].total), change: 312, series: [] },
            revenueRub: { total: parseInt(revenueResult.rows[0].total), change: 12, series: [] },
        });
    }
    catch (error) {
        console.error('Get overview error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/admin/users - Get all users
router.get('/users', auth_1.authMiddleware, auth_1.adminMiddleware, async (req, res) => {
    try {
        const result = await db_1.default.query(`SELECT id, email, created_at, points_balance, total_spent_rub, 
              generations_count as generations, status 
       FROM users ORDER BY created_at DESC`);
        const users = result.rows.map((row) => ({
            id: row.id,
            email: row.email,
            createdAt: row.created_at,
            pointsBalance: row.points_balance,
            totalSpentRub: row.total_spent_rub,
            generations: row.generations,
            status: row.status,
        }));
        res.json(users);
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PATCH /api/admin/users/:id - Update user
router.patch('/users/:id', auth_1.authMiddleware, auth_1.adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, pointsBalance } = req.body;
        const updates = [];
        const values = [];
        let paramIndex = 1;
        if (status !== undefined) {
            updates.push(`status = $${paramIndex++}`);
            values.push(status);
        }
        if (pointsBalance !== undefined) {
            updates.push(`points_balance = $${paramIndex++}`);
            values.push(pointsBalance);
        }
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        await db_1.default.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`, values);
        res.json({ message: 'User updated successfully' });
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/admin/payments - Get all payments
router.get('/payments', auth_1.authMiddleware, auth_1.adminMiddleware, async (req, res) => {
    try {
        const result = await db_1.default.query(`SELECT p.id, u.email as user_email, p.amount_rub, p.points, p.status, 
              p.provider, p.created_at 
       FROM payments p 
       JOIN users u ON p.user_id = u.id 
       ORDER BY p.created_at DESC`);
        const payments = result.rows.map(row => ({
            id: row.id,
            userEmail: row.user_email,
            amountRub: row.amount_rub,
            points: row.points,
            status: row.status,
            provider: row.provider,
            createdAt: row.created_at,
        }));
        res.json(payments);
    }
    catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/admin/models - Get model coefficients
router.get('/models', auth_1.authMiddleware, auth_1.adminMiddleware, async (req, res) => {
    try {
        const result = await db_1.default.query(`SELECT slug, name, vendor, type, base_price_usd, coefficient, enabled 
       FROM model_coefficients ORDER BY type, name`);
        const models = result.rows.map(row => ({
            slug: row.slug,
            name: row.name,
            vendor: row.vendor,
            type: row.type,
            basePriceUsd: parseFloat(row.base_price_usd),
            coefficient: parseFloat(row.coefficient),
            pointsPrice: Math.round(parseFloat(row.base_price_usd) * 100 * parseFloat(row.coefficient)),
            enabled: row.enabled,
        }));
        res.json(models);
    }
    catch (error) {
        console.error('Get models error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PATCH /api/admin/models/:slug - Update model coefficient
router.patch('/models/:slug', auth_1.authMiddleware, auth_1.adminMiddleware, async (req, res) => {
    try {
        const { slug } = req.params;
        const { coefficient, enabled } = req.body;
        const updates = [];
        const values = [];
        let paramIndex = 1;
        if (coefficient !== undefined) {
            updates.push(`coefficient = $${paramIndex++}`);
            values.push(coefficient);
        }
        if (enabled !== undefined) {
            updates.push(`enabled = $${paramIndex++}`);
            values.push(enabled);
        }
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(slug);
        await db_1.default.query(`UPDATE model_coefficients SET ${updates.join(', ')} WHERE slug = $${paramIndex}`, values);
        // Очищаем кэш коэффициентов после обновления
        const { clearCoefficientsCache } = await Promise.resolve().then(() => __importStar(require('../services/polza')));
        clearCoefficientsCache();
        res.json({ message: 'Model updated successfully' });
    }
    catch (error) {
        console.error('Update model error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
// POST /api/admin/models/sync - Sync models from polza.ai
router.post('/models/sync', auth_1.authMiddleware, auth_1.adminMiddleware, async (req, res) => {
    try {
        const { syncModelsFromPolza } = await Promise.resolve().then(() => __importStar(require('../services/polza')));
        const updatedCount = await syncModelsFromPolza();
        res.json({ updated: updatedCount });
    }
    catch (error) {
        console.error('Sync models error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
// GET /api/admin/generations - Get generation logs
router.get('/generations', auth_1.authMiddleware, auth_1.adminMiddleware, async (req, res) => {
    try {
        const result = await db_1.default.query(`SELECT g.id, u.email as user_email, g.model_slug, g.points_spent, g.status, g.created_at 
       FROM generations g 
       JOIN users u ON g.user_id = u.id 
       ORDER BY g.created_at DESC 
       LIMIT 100`);
        const generations = result.rows.map(row => ({
            id: row.id,
            userEmail: row.user_email,
            modelSlug: row.model_slug,
            pointsSpent: row.points_spent,
            status: row.status,
            createdAt: row.created_at,
        }));
        res.json(generations);
    }
    catch (error) {
        console.error('Get generations error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/admin/settings - Get settings
router.get('/settings', auth_1.authMiddleware, auth_1.adminMiddleware, async (req, res) => {
    try {
        const result = await db_1.default.query('SELECT key, value FROM settings');
        const settings = {};
        for (const row of result.rows) {
            if (row.key === 'pointToRubRate' || row.key === 'signupBonusPoints' || row.key === 'minTopUpPoints') {
                settings[row.key] = parseInt(row.value);
            }
            else {
                settings[row.key] = row.value;
            }
        }
        res.json(settings);
    }
    catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /api/admin/settings - Update settings
router.put('/settings', auth_1.authMiddleware, auth_1.adminMiddleware, async (req, res) => {
    try {
        const settings = req.body;
        for (const [key, value] of Object.entries(settings)) {
            await db_1.default.query(`INSERT INTO settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`, [key, String(value)]);
        }
        res.json({ message: 'Settings updated successfully' });
    }
    catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
