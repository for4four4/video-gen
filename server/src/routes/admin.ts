import { Router, Request, Response } from 'express';
import axios from 'axios';
import pool from '../db';
import { authMiddleware, adminMiddleware, AuthRequest } from './auth';

const router = Router();

// GET /api/admin/overview
router.get('/overview', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const range = req.query.range as string || '30d';
    let days = 30;
    if (range === '24h') days = 1;
    else if (range === '7d') days = 7;
    else if (range === '90d') days = 90;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const visitsResult = await pool.query("SELECT COUNT(*) as total FROM visits WHERE created_at >= $1", [startDate]);
    const usersResult = await pool.query("SELECT COUNT(*) as total FROM users WHERE created_at >= $1", [startDate]);
    const generationsResult = await pool.query("SELECT COUNT(*) as total FROM generations WHERE created_at >= $1", [startDate]);
    const revenueResult = await pool.query("SELECT COALESCE(SUM(amount_rub), 0) as total FROM payments WHERE status = 'succeeded' AND created_at >= $1", [startDate]);

    res.json({
      visits: { total: parseInt(visitsResult.rows[0].total), change: 18, series: [] },
      users: { total: parseInt(usersResult.rows[0].total), change: 24, series: [] },
      generations: { total: parseInt(generationsResult.rows[0].total), change: 312, series: [] },
      revenueRub: { total: parseInt(revenueResult.rows[0].total), change: 12, series: [] },
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/users
router.get('/users', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, email, created_at, points_balance, total_spent_rub, 
              generations_count as generations, status 
       FROM users ORDER BY created_at DESC`
    );
    const users = result.rows.map((row: any) => ({
      id: row.id, email: row.email, createdAt: row.created_at,
      pointsBalance: row.points_balance, totalSpentRub: row.total_spent_rub,
      generations: row.generations, status: row.status,
    }));
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/admin/users/:id
router.patch('/users/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, pointsBalance } = req.body;
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status !== undefined) { updates.push(`status = $${paramIndex++}`); values.push(status); }
    if (pointsBalance !== undefined) { updates.push(`points_balance = $${paramIndex++}`); values.push(pointsBalance); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`, values);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/payments
router.get('/payments', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT p.id, u.email as user_email, p.amount_rub, p.points, p.status, 
              p.provider, p.created_at 
       FROM payments p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC`
    );
    const payments = result.rows.map(row => ({
      id: row.id, userEmail: row.user_email, amountRub: row.amount_rub,
      points: row.points, status: row.status, provider: row.provider, createdAt: row.created_at,
    }));
    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/models
router.get('/models', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT slug, name, vendor, type, base_price_usd, coefficient, enabled 
       FROM model_coefficients ORDER BY enabled DESC, type, name`
    );
    const models = result.rows.map(row => ({
      slug: row.slug, name: row.name, vendor: row.vendor, type: row.type,
      basePriceUsd: parseFloat(row.base_price_usd),
      coefficient: parseFloat(row.coefficient),
      pointsPrice: Math.round(parseFloat(row.base_price_usd) * 100 * parseFloat(row.coefficient)),
      enabled: row.enabled,
    }));
    res.json(models);
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/admin/models/:slug
router.patch('/models/:slug', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const { coefficient, enabled } = req.body;
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (coefficient !== undefined) { updates.push(`coefficient = $${paramIndex++}`); values.push(coefficient); }
    if (enabled !== undefined) { updates.push(`enabled = $${paramIndex++}`); values.push(enabled); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(slug);
    await pool.query(`UPDATE model_coefficients SET ${updates.join(', ')} WHERE slug = $${paramIndex}`, values);

    const { clearCoefficientsCache } = await import('../services/polza');
    clearCoefficientsCache();
    res.json({ message: 'Model updated successfully' });
  } catch (error: any) {
    console.error('Update model error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/admin/models/sync — Sync models from polza.ai
router.post('/models/sync', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { syncModelsFromPolza } = await import('../services/polza');
    const updatedCount = await syncModelsFromPolza();
    res.json({ updated: updatedCount });
  } catch (error: any) {
    console.error('Sync models error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// DELETE /api/admin/models/clean — удалить ВСЕ старые модели (полная очистка)
router.delete('/models/clean', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Удаляем только disabled модели (не используемые в генерациях)
    const result = await pool.query(
      `DELETE FROM model_coefficients 
       WHERE enabled = FALSE 
       AND slug NOT IN (SELECT DISTINCT model_slug FROM generations WHERE model_slug IS NOT NULL)`
    );
    
    const { clearCoefficientsCache } = await import('../services/polza');
    clearCoefficientsCache();
    
    res.json({ 
      deleted: result.rowCount || 0,
      message: `Удалено ${result.rowCount || 0} неиспользуемых моделей` 
    });
  } catch (error: any) {
    console.error('Clean models error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// DELETE /api/admin/models/purge — полная очистка ВСЕХ моделей перед ресинком
router.delete('/models/purge', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Сначала убираем FK ссылки из generations
    await pool.query(`UPDATE generations SET model_slug = NULL WHERE model_slug IS NOT NULL`);
    
    // Удаляем все модели
    const result = await pool.query(`DELETE FROM model_coefficients`);
    
    // Удаляем примеры
    await pool.query(`DELETE FROM model_examples`);
    
    const { clearCoefficientsCache } = await import('../services/polza');
    clearCoefficientsCache();
    
    res.json({ 
      deleted: result.rowCount || 0,
      message: `Полная очистка: удалено ${result.rowCount || 0} моделей. Выполните Sync для загрузки актуальных.` 
    });
  } catch (error: any) {
    console.error('Purge models error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/admin/generations
router.get('/generations', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT g.id, u.email as user_email, g.model_slug, g.points_spent, g.status, g.created_at 
       FROM generations g JOIN users u ON g.user_id = u.id ORDER BY g.created_at DESC LIMIT 100`
    );
    const generations = result.rows.map(row => ({
      id: row.id, userEmail: row.user_email, modelSlug: row.model_slug,
      pointsSpent: row.points_spent, status: row.status, createdAt: row.created_at,
    }));
    res.json(generations);
  } catch (error) {
    console.error('Get generations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/settings
router.get('/settings', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT key, value FROM settings');
    const settings: any = {};
    for (const row of result.rows) {
      if (row.key === 'pointToRubRate' || row.key === 'signupBonusPoints' || row.key === 'minTopUpPoints') {
        settings[row.key] = parseInt(row.value);
      } else {
        settings[row.key] = row.value;
      }
    }
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/settings
router.put('/settings', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
        [key, String(value)]
      );
    }
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
