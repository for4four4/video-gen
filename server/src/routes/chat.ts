import { Router, Request, Response } from 'express';
import pool from '../db';
import { authMiddleware, AuthRequest } from './auth';
import {
  getModelCoefficient,
  getUserBalance,
  deductUserBalance,
  syncModelsFromPolza,
  getModelsCatalog,
  sendChatMessage,
  generateImage,
  generateVideo,
  saveChatHistory,
  clearCoefficientsCache,
  resolveModelSlug,
} from '../services/polza';

const router = Router();

// ── Helper: рассчитать стоимость с учётом tier-условий ────────────────────
function calculateCostFromPricing(pricing: any, params: Record<string, any>): number | null {
  if (!pricing) return null;

  // per_request — фиксированная цена
  if (pricing.per_request) {
    return parseFloat(pricing.per_request);
  }

  // tiers — ищем подходящий по условиям
  if (pricing.tiers && Array.isArray(pricing.tiers) && pricing.tiers.length > 0) {
    const sorted = [...pricing.tiers].sort((a: any, b: any) => 
      (b.conditions?.length || 0) - (a.conditions?.length || 0)
    );

    for (const tier of sorted) {
      if (!tier.conditions || tier.conditions.length === 0) continue;
      
      const allMatch = tier.conditions.every((cond: string) => {
        const [key, value] = cond.split('=');
        return params[key] === value;
      });

      if (allMatch && tier.cost_rub) {
        let cost = parseFloat(tier.cost_rub);
        if (pricing.unitParam && params[pricing.unitParam]) {
          cost *= parseFloat(params[pricing.unitParam]);
        }
        return cost;
      }
    }

    // Базовый tier (без условий)
    const baseTier = sorted.find((t: any) => !t.conditions || t.conditions.length === 0);
    if (baseTier && baseTier.cost_rub) {
      let cost = parseFloat(baseTier.cost_rub);
      if (pricing.unitParam && params[pricing.unitParam]) {
        cost *= parseFloat(params[pricing.unitParam]);
      }
      return cost;
    }
  }

  return null;
}

// ── Helper: resolve model or return error ─────────────────────────────────
async function resolveModel(inputSlug: string, res: Response): Promise<string | null> {
  const resolved = await resolveModelSlug(inputSlug);
  if (!resolved) {
    // Попробуем показать доступные модели для помощи
    const available = await pool.query(
      `SELECT slug, name FROM model_coefficients WHERE enabled = TRUE ORDER BY name LIMIT 10`
    );
    const suggestions = available.rows.map((r: any) => r.slug).join(', ');
    
    res.status(404).json({
      error: `Модель "${inputSlug}" не найдена. Убедитесь что модели синхронизированы (Admin → Sync polza.ai).`,
      availableModels: suggestions || 'Нет доступных моделей — выполните синхронизацию',
    });
    return null;
  }
  return resolved;
}

// ── GET /api/chat/models ──────────────────────────────────────────────────────
router.get('/models', async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string;
    const search = req.query.search as string;

    let where = `enabled = TRUE AND type IN ('image', 'video')`;
    const values: any[] = [];
    let idx = 1;

    if (type && (type === 'image' || type === 'video')) {
      where = `enabled = TRUE AND type = $${idx++}`;
      values.push(type);
    }
    if (search) {
      where += ` AND (name ILIKE $${idx} OR vendor ILIKE $${idx})`;
      values.push(`%${search}%`);
      idx++;
    }

    const result = await pool.query(
      `SELECT slug as id, slug, name, vendor, type,
              base_price_usd as base_price_rub,
              coefficient,
              ROUND(base_price_usd::numeric * coefficient::numeric) as price_points,
              description, short_description, featured, speed, popularity,
              input_modalities, output_modalities, parameters_json
       FROM model_coefficients WHERE ${where}
       ORDER BY featured DESC NULLS LAST, popularity DESC NULLS LAST, name ASC`,
      values
    );

    res.json({ data: result.rows, meta: { total: result.rows.length } });
  } catch (error: any) {
    console.error('Get models error:', error.message);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// ── POST /api/chat/image ──────────────────────────────────────────────────────
router.post('/image', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { model, modelSlug, prompt, aspect_ratio, image_resolution, quality, output_format, seed, n } = req.body;
    const inputModel = model || modelSlug;

    if (!inputModel || !prompt) {
      return res.status(400).json({ error: 'model and prompt are required' });
    }

    // Резолвим slug (поддержка и короткого и полного формата)
    const actualModel = await resolveModel(inputModel, res);
    if (!actualModel) return; // ответ уже отправлен

    const userId = req.user!.id;

    // Получаем данные модели из БД
    const modelRow = await pool.query(
      `SELECT base_price_usd, coefficient, parameters_json FROM model_coefficients WHERE slug = $1`,
      [actualModel]
    );

    let pointsCost = 10;
    if (modelRow.rows.length > 0) {
      const basePriceRub = parseFloat(modelRow.rows[0].base_price_usd);
      const coeff = parseFloat(modelRow.rows[0].coefficient);
      
      let parametersJson: any = {};
      try { parametersJson = JSON.parse(modelRow.rows[0].parameters_json || '{}'); } catch {}
      
      const pricing = parametersJson._pricing;
      const tierCost = calculateCostFromPricing(pricing, { 
        image_resolution, quality, aspect_ratio 
      });
      
      if (tierCost) {
        pointsCost = Math.round(tierCost * coeff);
      } else {
        pointsCost = Math.round(basePriceRub * coeff);
      }
    }

    pointsCost = Math.max(1, pointsCost);

    // Проверяем баланс
    const balance = await getUserBalance(userId);
    if (balance < pointsCost) {
      return res.status(402).json({
        error: 'Insufficient balance',
        currentBalance: balance,
        requiredBalance: pointsCost,
      });
    }

    // Генерируем изображение — передаём ПОЛНЫЙ slug в polza.ai
    const polzaResult = await generateImage({
      model: actualModel,
      prompt,
      aspect_ratio,
      image_resolution,
      quality,
      output_format,
      seed: seed ? parseInt(seed) : undefined,
      n: n || 1,
    });

    // Используем реальную стоимость от polza если есть
    const actualCost = polzaResult.cost_rub
      ? Math.round(polzaResult.cost_rub * (await getModelCoefficient(actualModel)))
      : pointsCost;

    await deductUserBalance(userId, Math.min(actualCost, balance));

    // Сохраняем в generations
    await pool.query(
      `INSERT INTO generations (user_id, model_slug, points_spent, status, prompt, result_url)
       VALUES ($1, $2, $3, 'completed', $4, $5)`,
      [userId, actualModel, actualCost, prompt, polzaResult.imageUrl]
    );
    await pool.query(
      `UPDATE users SET generations_count = generations_count + 1 WHERE id = $1`, [userId]
    );

    res.json({
      imageUrl: polzaResult.imageUrl,
      allImages: polzaResult.allImages || [polzaResult.imageUrl],
      pointsSpent: actualCost,
      remainingBalance: balance - actualCost,
    });
  } catch (error: any) {
    console.error('Image generation error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || error.response?.data?.error || error.message || 'Generation failed'
    });
  }
});

// ── POST /api/chat/video ──────────────────────────────────────────────────────
router.post('/video', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { modelSlug, model, prompt, aspect_ratio, aspectRatio, duration, resolution, sound, mode } = req.body;
    const inputModel = model || modelSlug;

    if (!inputModel || !prompt) {
      return res.status(400).json({ error: 'model and prompt are required' });
    }

    // Резолвим slug
    const actualModel = await resolveModel(inputModel, res);
    if (!actualModel) return;

    const userId = req.user!.id;

    const modelRow = await pool.query(
      `SELECT base_price_usd, coefficient, parameters_json FROM model_coefficients WHERE slug = $1`,
      [actualModel]
    );

    let pointsCost = 50;
    if (modelRow.rows.length > 0) {
      const basePriceRub = parseFloat(modelRow.rows[0].base_price_usd);
      const coeff = parseFloat(modelRow.rows[0].coefficient);
      
      let parametersJson: any = {};
      try { parametersJson = JSON.parse(modelRow.rows[0].parameters_json || '{}'); } catch {}
      
      const pricing = parametersJson._pricing;
      const tierCost = calculateCostFromPricing(pricing, {
        duration: duration || '5',
        resolution: resolution || '720p',
        sound: sound || 'false',
        mode: mode || 'std',
      });
      
      if (tierCost) {
        pointsCost = Math.round(tierCost * coeff);
      } else {
        pointsCost = Math.round(basePriceRub * coeff);
      }
    }

    pointsCost = Math.max(1, pointsCost);

    const balance = await getUserBalance(userId);
    if (balance < pointsCost) {
      return res.status(402).json({
        error: 'Insufficient balance',
        currentBalance: balance,
        requiredBalance: pointsCost,
      });
    }

    const actualAspectRatio = aspect_ratio || aspectRatio;

    const polzaResult = await generateVideo({
      model: actualModel,
      prompt,
      aspect_ratio: actualAspectRatio,
      duration,
      resolution,
      sound,
      mode,
    });

    const actualCost = polzaResult.cost_rub
      ? Math.round(polzaResult.cost_rub * (await getModelCoefficient(actualModel)))
      : pointsCost;

    await deductUserBalance(userId, Math.min(actualCost, balance));

    await pool.query(
      `INSERT INTO generations (user_id, model_slug, points_spent, status, prompt, result_url)
       VALUES ($1, $2, $3, 'completed', $4, $5)`,
      [userId, actualModel, actualCost, prompt, polzaResult.videoUrl]
    );
    await pool.query(
      `UPDATE users SET generations_count = generations_count + 1 WHERE id = $1`, [userId]
    );

    res.json({
      videoUrl: polzaResult.videoUrl,
      pointsSpent: actualCost,
      remainingBalance: balance - actualCost,
    });
  } catch (error: any) {
    console.error('Video generation error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || error.response?.data?.error || error.message || 'Generation failed'
    });
  }
});

// ── POST /api/chat/send (text chat) ──────────────────────────────────────────
router.post('/send', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { modelSlug, model, messages, temperature, max_tokens, sessionId } = req.body;
    const inputModel = model || modelSlug;

    if (!inputModel || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'model and messages are required' });
    }

    // Резолвим slug
    const actualModel = await resolveModel(inputModel, res);
    if (!actualModel) return;

    const userId = req.user!.id;

    const modelRow = await pool.query(
      `SELECT base_price_usd, coefficient FROM model_coefficients WHERE slug = $1`,
      [actualModel]
    );

    let pointsCost = 5;
    if (modelRow.rows.length > 0) {
      const basePriceRub = parseFloat(modelRow.rows[0].base_price_usd);
      const coeff = parseFloat(modelRow.rows[0].coefficient);
      pointsCost = Math.round(basePriceRub * coeff) || 5;
    }

    const balance = await getUserBalance(userId);
    if (balance < pointsCost) {
      return res.status(402).json({
        error: 'Insufficient balance',
        currentBalance: balance,
        requiredBalance: pointsCost,
      });
    }

    const polzaResponse = await sendChatMessage({ model: actualModel, messages, temperature, max_tokens });
    await deductUserBalance(userId, pointsCost);

    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user');
    const assistantContent = polzaResponse.choices?.[0]?.message?.content || '';

    if (sessionId) {
      await pool.query(
        `INSERT INTO chat_messages (session_id, user_id, role, content, model_slug, points_spent)
         VALUES ($1,$2,'user',$3,$4,0)`,
        [sessionId, userId, lastUserMessage?.content || '', actualModel]
      );
      await pool.query(
        `INSERT INTO chat_messages (session_id, user_id, role, content, model_slug, points_spent)
         VALUES ($1,$2,'assistant',$3,$4,$5)`,
        [sessionId, userId, assistantContent, actualModel, pointsCost]
      );
      await pool.query(
        `UPDATE chat_sessions SET updated_at=CURRENT_TIMESTAMP WHERE id=$1`, [sessionId]
      );
    }

    await pool.query(
      `INSERT INTO generations (user_id, model_slug, points_spent, status, prompt)
       VALUES ($1,$2,$3,'completed',$4)`,
      [userId, actualModel, pointsCost, lastUserMessage?.content || '']
    );
    await pool.query(
      `UPDATE users SET generations_count = generations_count + 1 WHERE id = $1`, [userId]
    );

    res.json({
      response: polzaResponse,
      pointsSpent: pointsCost,
      remainingBalance: balance - pointsCost,
    });
  } catch (error: any) {
    console.error('Chat send error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || error.message || 'Internal server error'
    });
  }
});

// ── GET /api/chat/history ─────────────────────────────────────────────────────
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await pool.query(
      `SELECT g.id, g.model_slug, g.points_spent, g.status, g.prompt, g.result_url, g.created_at,
              m.name as model_name
       FROM generations g
       LEFT JOIN model_coefficients m ON g.model_slug = m.slug
       WHERE g.user_id = $1
       ORDER BY g.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    const sessions = result.rows.map(row => ({
      id: row.id,
      userId,
      title: row.prompt?.slice(0, 40) || 'Генерация',
      modelSlug: row.model_slug,
      messages: [
        { role: 'user', content: row.prompt || '', model: row.model_slug, cost: 0, createdAt: row.created_at },
        { role: 'assistant', content: 'Готово!', image: row.result_url || undefined, model: row.model_name || row.model_slug, cost: row.points_spent, createdAt: row.created_at },
      ],
      createdAt: row.created_at,
      updatedAt: row.created_at,
    }));

    res.json(sessions);
  } catch (error: any) {
    console.error('Get history error:', error.message);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// ── GET /api/chat/balance ─────────────────────────────────────────────────────
router.get('/balance', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const balance = await getUserBalance(req.user!.id);
    res.json({ balance });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/chat/session/:id ─────────────────────────────────────────────────
router.get('/session/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      `SELECT g.id, g.model_slug, g.points_spent, g.status, g.prompt, g.result_url, g.created_at,
              m.name as model_name
       FROM generations g
       LEFT JOIN model_coefficients m ON g.model_slug = m.slug
       WHERE g.user_id = $1
       ORDER BY g.created_at ASC`,
      [userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const messages: any[] = [];
    for (const row of result.rows) {
      messages.push({ role: 'user', content: row.prompt, model: row.model_slug, cost: 0, createdAt: row.created_at });
      messages.push({ role: 'assistant', content: 'Готово!', image: row.result_url || undefined, model: row.model_name || row.model_slug, cost: row.points_spent, createdAt: row.created_at });
    }

    res.json({
      id: req.params.id,
      userId,
      title: result.rows[0]?.prompt?.slice(0, 40) || 'Чат',
      modelSlug: result.rows[0]?.model_slug || '',
      messages,
      createdAt: result.rows[0]?.created_at,
      updatedAt: result.rows[result.rows.length - 1]?.created_at,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /api/chat/session/:id ──────────────────────────────────────────────
router.delete('/session/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    await pool.query(`DELETE FROM generations WHERE id = $1 AND user_id = $2`, [req.params.id, userId]);
    res.json({ message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
