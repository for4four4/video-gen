import { Router, Request, Response } from 'express';
import pool from '../db';
import { authMiddleware, adminMiddleware, AuthRequest } from './auth';

const router = Router();

// ══════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ══════════════════════════════════════════════════════════════

// GET /api/news — публичный список новостей
router.get('/news', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, slug, title, excerpt, tag, model_name, cover_image, published_at, created_at
       FROM news WHERE published = TRUE
       ORDER BY published_at DESC, created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/news/:slug — одна новость
router.get('/news/:slug', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM news WHERE slug = $1 AND published = TRUE`,
      [req.params.slug]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get news item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/blog — публичный список постов
router.get('/blog', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, slug, title, excerpt, category, author, read_minutes, cover_image, featured, published_at, created_at
       FROM blog_posts WHERE published = TRUE
       ORDER BY featured DESC NULLS LAST, published_at DESC, created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/blog/:slug — один пост
router.get('/blog/:slug', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM blog_posts WHERE slug = $1 AND published = TRUE`,
      [req.params.slug]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pricing — тарифные планы
router.get('/pricing', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, points, price_rub, bonus_points, popular
       FROM pricing_plans WHERE enabled = TRUE
       ORDER BY sort_order ASC, price_rub ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/models — публичный каталог моделей из БД
router.get('/models', async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string;
    const search = req.query.search as string;

    let where = `enabled = TRUE`;
    const values: any[] = [];
    let idx = 1;

    if (type) {
      where += ` AND type = $${idx++}`;
      values.push(type);
    }
    if (search) {
      where += ` AND (name ILIKE $${idx} OR vendor ILIKE $${idx})`;
      values.push(`%${search}%`);
      idx++;
    }

    const result = await pool.query(
      `SELECT slug, name, vendor, type, base_price_usd, coefficient,
              ROUND(base_price_usd * coefficient) as price_points,
              description, short_description, featured, speed, popularity,
              input_modalities, output_modalities, parameters_json,
              icon_url, cover_image
       FROM model_coefficients WHERE ${where}
       ORDER BY featured DESC NULLS LAST, popularity DESC NULLS LAST, name ASC`,
      values
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/models/:slug/examples — примеры картинок модели
router.get('/models/:slug/examples', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, image_url, prompt FROM model_examples WHERE model_slug = $1 ORDER BY sort_order ASC`,
      [req.params.slug]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get model examples error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ══════════════════════════════════════════════════════════════
// ADMIN ROUTES — НОВОСТИ
// ══════════════════════════════════════════════════════════════

// GET /api/admin/news
router.get('/admin/news', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM news ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/news/:id
router.get('/admin/news/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM news WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/news
router.post('/admin/news', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { slug, title, excerpt, content, tag, model_name, cover_image, seo_title, seo_description, published } = req.body;
    if (!slug || !title) return res.status(400).json({ error: 'slug and title are required' });

    const result = await pool.query(
      `INSERT INTO news (slug, title, excerpt, content, tag, model_name, cover_image, seo_title, seo_description, published, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [slug, title, excerpt, content, tag || 'update', model_name, cover_image, seo_title, seo_description,
       published || false, published ? new Date() : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') return res.status(409).json({ error: 'Slug already exists' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/news/:id
router.put('/admin/news/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { slug, title, excerpt, content, tag, model_name, cover_image, seo_title, seo_description, published } = req.body;

    const existing = await pool.query(`SELECT published FROM news WHERE id = $1`, [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const wasPublished = existing.rows[0].published;
    const publishedAt = published && !wasPublished ? new Date() : (published ? existing.rows[0].published_at : null);

    await pool.query(
      `UPDATE news SET slug=$1, title=$2, excerpt=$3, content=$4, tag=$5, model_name=$6,
       cover_image=$7, seo_title=$8, seo_description=$9, published=$10, published_at=$11, updated_at=CURRENT_TIMESTAMP
       WHERE id=$12`,
      [slug, title, excerpt, content, tag, model_name, cover_image, seo_title, seo_description, published, publishedAt, req.params.id]
    );
    res.json({ message: 'Updated successfully' });
  } catch (error: any) {
    if (error.code === '23505') return res.status(409).json({ error: 'Slug already exists' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/news/:id
router.delete('/admin/news/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await pool.query(`DELETE FROM news WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ══════════════════════════════════════════════════════════════
// ADMIN ROUTES — БЛОГ
// ══════════════════════════════════════════════════════════════

router.get('/admin/blog', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM blog_posts ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/admin/blog/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM blog_posts WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/admin/blog', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { slug, title, excerpt, content, category, author, read_minutes, cover_image, featured, seo_title, seo_description, published } = req.body;
    if (!slug || !title) return res.status(400).json({ error: 'slug and title are required' });

    const result = await pool.query(
      `INSERT INTO blog_posts (slug, title, excerpt, content, category, author, read_minutes, cover_image, featured, seo_title, seo_description, published, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [slug, title, excerpt, content, category, author, read_minutes || 5, cover_image, featured || false,
       seo_title, seo_description, published || false, published ? new Date() : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') return res.status(409).json({ error: 'Slug already exists' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/admin/blog/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { slug, title, excerpt, content, category, author, read_minutes, cover_image, featured, seo_title, seo_description, published } = req.body;

    const existing = await pool.query(`SELECT published, published_at FROM blog_posts WHERE id = $1`, [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const wasPublished = existing.rows[0].published;
    const publishedAt = published && !wasPublished ? new Date() : existing.rows[0].published_at;

    await pool.query(
      `UPDATE blog_posts SET slug=$1, title=$2, excerpt=$3, content=$4, category=$5, author=$6,
       read_minutes=$7, cover_image=$8, featured=$9, seo_title=$10, seo_description=$11,
       published=$12, published_at=$13, updated_at=CURRENT_TIMESTAMP WHERE id=$14`,
      [slug, title, excerpt, content, category, author, read_minutes || 5, cover_image, featured || false,
       seo_title, seo_description, published, publishedAt, req.params.id]
    );
    res.json({ message: 'Updated successfully' });
  } catch (error: any) {
    if (error.code === '23505') return res.status(409).json({ error: 'Slug already exists' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/admin/blog/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await pool.query(`DELETE FROM blog_posts WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ══════════════════════════════════════════════════════════════
// ADMIN ROUTES — ТАРИФЫ
// ══════════════════════════════════════════════════════════════

router.get('/admin/pricing', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM pricing_plans ORDER BY sort_order ASC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/admin/pricing', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, points, price_rub, bonus_points, popular, enabled, sort_order } = req.body;
    if (!name || !points || !price_rub) return res.status(400).json({ error: 'name, points, price_rub required' });

    const result = await pool.query(
      `INSERT INTO pricing_plans (name, points, price_rub, bonus_points, popular, enabled, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, points, price_rub, bonus_points || 0, popular || false, enabled !== false, sort_order || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/admin/pricing/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, points, price_rub, bonus_points, popular, enabled, sort_order } = req.body;
    await pool.query(
      `UPDATE pricing_plans SET name=$1, points=$2, price_rub=$3, bonus_points=$4, popular=$5, enabled=$6, sort_order=$7, updated_at=CURRENT_TIMESTAMP WHERE id=$8`,
      [name, points, price_rub, bonus_points || 0, popular || false, enabled !== false, sort_order || 0, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/admin/pricing/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await pool.query(`DELETE FROM pricing_plans WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ══════════════════════════════════════════════════════════════
// ADMIN ROUTES — ПРИМЕРЫ КАРТИНОК МОДЕЛЕЙ
// ══════════════════════════════════════════════════════════════

router.get('/admin/models/:slug/examples', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM model_examples WHERE model_slug = $1 ORDER BY sort_order ASC`,
      [req.params.slug]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/admin/models/:slug/examples', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { image_url, prompt, sort_order } = req.body;
    if (!image_url) return res.status(400).json({ error: 'image_url required' });

    const result = await pool.query(
      `INSERT INTO model_examples (model_slug, image_url, prompt, sort_order) VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.params.slug, image_url, prompt, sort_order || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/admin/model-examples/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { image_url, prompt, sort_order } = req.body;
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (image_url !== undefined) { updates.push(`image_url=$${idx++}`); values.push(image_url); }
    if (prompt !== undefined) { updates.push(`prompt=$${idx++}`); values.push(prompt); }
    if (sort_order !== undefined) { updates.push(`sort_order=$${idx++}`); values.push(sort_order); }

    if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update' });

    values.push(req.params.id);
    await pool.query(`UPDATE model_examples SET ${updates.join(', ')} WHERE id=$${idx}`, values);
    res.json({ message: 'Updated' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/admin/model-examples/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await pool.query(`DELETE FROM model_examples WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ══════════════════════════════════════════════════════════════
// CHAT SESSIONS
// ══════════════════════════════════════════════════════════════

// GET /api/chat/sessions — список сессий пользователя
router.get('/chat/sessions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await pool.query(
      `SELECT cs.id, cs.title, cs.model_slug, cs.created_at, cs.updated_at,
              m.name as model_name,
              (SELECT COUNT(*) FROM chat_messages cm WHERE cm.session_id = cs.id) as message_count,
              (SELECT result_url FROM chat_messages cm WHERE cm.session_id = cs.id AND result_url IS NOT NULL ORDER BY cm.created_at DESC LIMIT 1) as last_image
       FROM chat_sessions cs
       LEFT JOIN model_coefficients m ON cs.model_slug = m.slug
       WHERE cs.user_id = $1
       ORDER BY cs.updated_at DESC
       LIMIT 50`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/chat/sessions — создать сессию
router.post('/chat/sessions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, model_slug } = req.body;
    const result = await pool.query(
      `INSERT INTO chat_sessions (user_id, title, model_slug) VALUES ($1,$2,$3) RETURNING *`,
      [userId, title || 'Новый чат', model_slug || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/chat/sessions/:id/messages — сообщения сессии
router.get('/chat/sessions/:id/messages', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Проверяем что сессия принадлежит пользователю
    const session = await pool.query(
      `SELECT id FROM chat_sessions WHERE id = $1 AND user_id = $2`,
      [req.params.id, userId]
    );
    if (session.rows.length === 0) return res.status(404).json({ error: 'Session not found' });

    const result = await pool.query(
      `SELECT id, role, content, result_url, model_slug, points_spent, created_at
       FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/chat/sessions/:id — обновить заголовок
router.patch('/chat/sessions/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title } = req.body;
    await pool.query(
      `UPDATE chat_sessions SET title=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 AND user_id=$3`,
      [title, req.params.id, userId]
    );
    res.json({ message: 'Updated' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/chat/sessions/:id
router.delete('/chat/sessions/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    await pool.query(
      `DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2`,
      [req.params.id, userId]
    );
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
