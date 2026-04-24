import axios from 'axios';
import pool from '../db';

const POLZA_API_BASE_URL = process.env.POLZA_API_BASE_URL || 'https://polza.ai/api';
const POLZA_API_KEY = process.env.POLZA_API_KEY;

// Кэш коэффициентов моделей (5 минут)
let modelCoefficientsCache: Map<string, number> = new Map();
const CACHE_TTL = 5 * 60 * 1000;
let cacheTimestamp: number = 0;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Извлечь базовую цену в рублях из структуры pricing polza.ai
 * Берём минимальный tier (самую дешёвую конфигурацию) как базу
 */
function extractBasePriceRub(pricing: any): number {
  if (!pricing) return 0;

  // per_request — фиксированная цена
  if (pricing.per_request) {
    return parseFloat(pricing.per_request);
  }

  // tiers — берём первый (самый дешёвый, условия пустые [])
  if (pricing.tiers && Array.isArray(pricing.tiers) && pricing.tiers.length > 0) {
    const baseTier = pricing.tiers.find((t: any) => !t.conditions || t.conditions.length === 0);
    if (baseTier && baseTier.cost_rub) {
      return parseFloat(baseTier.cost_rub);
    }
    // Если нет tier без условий — берём минимум
    const minPrice = Math.min(...pricing.tiers.map((t: any) => parseFloat(t.cost_rub || '9999')));
    return minPrice;
  }

  // prompt_per_million (текстовые модели, на нас не используются, но на всякий)
  if (pricing.prompt_per_million) {
    return parseFloat(pricing.prompt_per_million) / 1000000 * 1000; // цена за 1К токенов
  }

  return 0;
}

// ── Coefficients ──────────────────────────────────────────────────────────────

export const getModelCoefficient = async (modelSlug: string): Promise<number> => {
  if (modelCoefficientsCache.has(modelSlug)) {
    return modelCoefficientsCache.get(modelSlug)!;
  }

  try {
    const result = await pool.query(
      'SELECT coefficient FROM model_coefficients WHERE slug = $1',
      [modelSlug]
    );
    if (result.rows.length > 0) {
      const coeff = parseFloat(result.rows[0].coefficient);
      modelCoefficientsCache.set(modelSlug, coeff);
      return coeff;
    }
  } catch (error) {
    console.error('Error fetching coefficient:', modelSlug, error);
  }

  return 1.5;
};

export const clearCoefficientsCache = () => {
  modelCoefficientsCache.clear();
  cacheTimestamp = 0;
};

// ── Balance ───────────────────────────────────────────────────────────────────

export const getUserBalance = async (userId: string): Promise<number> => {
  const result = await pool.query('SELECT points_balance FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) throw new Error('User not found');
  return parseInt(result.rows[0].points_balance);
};

export const deductUserBalance = async (userId: string, amount: number): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const balanceResult = await client.query(
      'SELECT points_balance FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );
    if (balanceResult.rows.length === 0) throw new Error('User not found');
    const currentBalance = parseInt(balanceResult.rows[0].points_balance);
    if (currentBalance < amount) throw new Error('Insufficient balance');
    await client.query(
      'UPDATE users SET points_balance = points_balance - $1, total_spent_rub = total_spent_rub + $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [amount, amount, userId]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// ── Models sync ───────────────────────────────────────────────────────────────

export const syncModelsFromPolza = async (): Promise<number> => {
  try {
    let allModels: any[] = [];
    let page = 1;
    let hasMore = true;

    // Качаем все страницы
    while (hasMore) {
      const url = `${POLZA_API_BASE_URL}/v1/models/catalog?type=image&type=video&limit=50&page=${page}`;
      const response = await axios.get(url, {
        headers: POLZA_API_KEY ? { Authorization: `Bearer ${POLZA_API_KEY}` } : {},
        timeout: 30000,
      });

      const data = response.data;
      const models = data.data || [];
      allModels = allModels.concat(models);

      const meta = data.meta || {};
      hasMore = meta.page < meta.totalPages;
      page++;

      if (!meta.totalPages) break; // нет пагинации
    }

    let updatedCount = 0;

    for (const model of allModels) {
      if (model.type !== 'image' && model.type !== 'video') continue;

      const pricing = model.top_provider?.pricing;
      const basePriceRub = extractBasePriceRub(pricing);

      // Сохраняем параметры модели
      const parameters = model.parameters || model.top_provider?.parameters || {};
      const inputModalities = model.architecture?.input_modalities || [];
      const outputModalities = model.architecture?.output_modalities || [];
      const shortDesc = model.short_description || null;

      await pool.query(`
        INSERT INTO model_coefficients 
          (slug, name, vendor, type, base_price_usd, coefficient, enabled,
           description, input_modalities, output_modalities, parameters_json)
        VALUES ($1, $2, $3, $4, $5, 1.5, TRUE, $6, $7, $8, $9)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          vendor = EXCLUDED.vendor,
          type = EXCLUDED.type,
          base_price_usd = EXCLUDED.base_price_usd,
          description = EXCLUDED.description,
          input_modalities = EXCLUDED.input_modalities,
          output_modalities = EXCLUDED.output_modalities,
          parameters_json = EXCLUDED.parameters_json,
          updated_at = CURRENT_TIMESTAMP
      `, [
        model.id,
        model.name,
        extractVendor(model.id),
        model.type,
        basePriceRub, // Храним в рублях как "base_price_usd" (переименуем логически)
        shortDesc,
        JSON.stringify(inputModalities),
        JSON.stringify(outputModalities),
        JSON.stringify(parameters),
      ]);

      updatedCount++;
    }

    clearCoefficientsCache();
    console.log(`✅ Synced ${updatedCount} models from polza.ai`);
    return updatedCount;
  } catch (error) {
    console.error('Error syncing models:', error);
    throw error;
  }
};

// ── Models catalog (с кэшем из БД) ───────────────────────────────────────────

export const getModelsCatalog = async (params?: {
  search?: string;
  type?: string[];
  page?: number;
  limit?: number;
}) => {
  try {
    // Отдаём из нашей БД (туда уже засинхронизировано)
    const types = params?.type || ['image', 'video'];
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const offset = (page - 1) * limit;

    let whereClause = `type = ANY($1) AND enabled = TRUE`;
    const values: any[] = [types];
    let paramIdx = 2;

    if (params?.search) {
      whereClause += ` AND (name ILIKE $${paramIdx} OR vendor ILIKE $${paramIdx})`;
      values.push(`%${params.search}%`);
      paramIdx++;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM model_coefficients WHERE ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT slug, name, vendor, type, base_price_usd, coefficient, description,
              input_modalities, output_modalities, parameters_json, featured, short_description
       FROM model_coefficients
       WHERE ${whereClause}
       ORDER BY featured DESC NULLS LAST, name ASC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...values, limit, offset]
    );

    return {
      data: result.rows.map(row => ({
        id: row.slug,
        slug: row.slug,
        name: row.name,
        vendor: row.vendor,
        type: row.type,
        base_price_rub: parseFloat(row.base_price_usd), // на самом деле рубли
        coefficient: parseFloat(row.coefficient),
        // Цена в поинтах = базовая цена в рублях * коэффициент
        price_points: Math.round(parseFloat(row.base_price_usd) * parseFloat(row.coefficient)),
        description: row.description || row.short_description,
        input_modalities: row.input_modalities || [],
        output_modalities: row.output_modalities || [],
        parameters: row.parameters_json || {},
        featured: row.featured || false,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  } catch (error) {
    console.error('Error fetching models catalog:', error);
    throw error;
  }
};

// ── Image generation via /v2/images/generations ───────────────────────────────

export const generateImage = async (options: {
  model: string;
  prompt: string;
  size?: string;
  quality?: string;
  n?: number;
  negativePrompt?: string;
}): Promise<{ imageUrl: string; allImages: string[]; cost_rub?: number }> => {
  try {
    console.log(`[Polza] Image generation: model=${options.model}, prompt="${options.prompt.slice(0, 50)}..."`);

    const requestBody: any = {
      model: options.model,
      prompt: options.prompt,
      n: options.n || 1,
      response_format: 'url',
    };

    if (options.size && options.size !== 'auto') {
      // size может быть '1024x1024' или aspect_ratio '1:1' — пробуем оба
      if (options.size.includes('x')) {
        requestBody.size = options.size;
      } else {
        requestBody.size = 'auto';
      }
    }

    if (options.quality) requestBody.quality = options.quality;

    const response = await axios.post(
      `${POLZA_API_BASE_URL}/v2/images/generations`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(POLZA_API_KEY ? { Authorization: `Bearer ${POLZA_API_KEY}` } : {}),
        },
        timeout: 130000, // 130 сек (polza timeout 120s)
      }
    );

    const data = response.data;

    // Синхронный успешный ответ
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      const urls = data.data.map((item: any) => item.url).filter(Boolean);
      return {
        imageUrl: urls[0],
        allImages: urls,
        cost_rub: data.usage?.cost_rub,
      };
    }

    // Асинхронный режим (таймаут >120 сек) — получили pending
    if (data.id && data.status === 'pending') {
      console.log(`[Polza] Image generation pending, id=${data.id}, polling...`);
      return await pollMediaStatus(data.id);
    }

    throw new Error('Unexpected response format: ' + JSON.stringify(data).slice(0, 200));
  } catch (error: any) {
    console.error('[Polza] Image generation error:', error.response?.data || error.message);
    throw error;
  }
};

// ── Video generation via /v1/media ────────────────────────────────────────────

export const generateVideo = async (options: {
  model: string;
  prompt: string;
  aspectRatio?: string;
  duration?: string | number;
  resolution?: string;
}): Promise<{ videoUrl: string; cost_rub?: number }> => {
  try {
    console.log(`[Polza] Video generation: model=${options.model}, prompt="${options.prompt.slice(0, 50)}..."`);

    const input: any = {
      prompt: options.prompt,
    };

    if (options.aspectRatio) input.aspect_ratio = options.aspectRatio;
    if (options.duration) input.duration = String(options.duration);
    if (options.resolution) input.resolution = options.resolution;

    const response = await axios.post(
      `${POLZA_API_BASE_URL}/v1/media`,
      { model: options.model, input },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(POLZA_API_KEY ? { Authorization: `Bearer ${POLZA_API_KEY}` } : {}),
        },
        timeout: 60000,
      }
    );

    const data = response.data;

    // Если сразу completed (маловероятно для видео)
    if (data.status === 'completed') {
      const videoUrl = data.data?.url || data.data?.video_url || '';
      return { videoUrl, cost_rub: data.usage?.cost_rub };
    }

    // Pending/processing — поллинг
    if (data.id) {
      console.log(`[Polza] Video pending, id=${data.id}, polling...`);
      const result = await pollMediaStatus(data.id, 120, 5000); // до 10 минут
      return { videoUrl: result.imageUrl, cost_rub: result.cost_rub };
    }

    throw new Error('No generation ID in response: ' + JSON.stringify(data).slice(0, 200));
  } catch (error: any) {
    console.error('[Polza] Video generation error:', error.response?.data || error.message);
    throw error;
  }
};

// ── Polling helper ────────────────────────────────────────────────────────────

async function pollMediaStatus(
  id: string,
  maxAttempts = 60,
  intervalMs = 5000
): Promise<{ imageUrl: string; allImages: string[]; cost_rub?: number }> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, intervalMs));

    const statusResp = await axios.get(
      `${POLZA_API_BASE_URL}/v1/media/${id}`,
      {
        headers: POLZA_API_KEY ? { Authorization: `Bearer ${POLZA_API_KEY}` } : {},
        timeout: 15000,
      }
    );

    const status = statusResp.data;
    console.log(`[Polza] Poll ${attempt + 1}/${maxAttempts}: status=${status.status}`);

    if (status.status === 'completed') {
      // Изображения
      if (status.data?.images && Array.isArray(status.data.images)) {
        const urls = status.data.images.map((img: any) => img.url || img).filter(Boolean);
        return { imageUrl: urls[0], allImages: urls, cost_rub: status.usage?.cost_rub };
      }
      // Видео
      if (status.data?.url) {
        return { imageUrl: status.data.url, allImages: [status.data.url], cost_rub: status.usage?.cost_rub };
      }
      // Fallback
      const url = status.data?.url || status.result_url || '';
      return { imageUrl: url, allImages: url ? [url] : [], cost_rub: status.usage?.cost_rub };
    }

    if (status.status === 'failed') {
      throw new Error(`Generation failed: ${status.error?.message || JSON.stringify(status.error || {})}`);
    }
  }

  throw new Error(`Generation timeout after ${maxAttempts} attempts`);
}

// ── Chat completions ──────────────────────────────────────────────────────────

export const sendChatMessage = async (options: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
}): Promise<any> => {
  const response = await axios.post(
    `${POLZA_API_BASE_URL}/v1/chat/completions`,
    {
      model: options.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2048,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        ...(POLZA_API_KEY ? { Authorization: `Bearer ${POLZA_API_KEY}` } : {}),
      },
      timeout: 60000,
    }
  );
  return response.data;
};

// ── Chat history ──────────────────────────────────────────────────────────────

export const saveChatHistory = async (data: {
  userId: string;
  modelSlug: string;
  prompt: string;
  response: string;
  pointsSpent: number;
  imageUrl?: string;
  status?: string;
  sessionId?: string;
}): Promise<string> => {
  // Если sessionId передан — сохраняем в chat_messages
  if (data.sessionId) {
    const msgResult = await pool.query(
      `INSERT INTO chat_messages (session_id, user_id, role, content, result_url, model_slug, points_spent)
       VALUES ($1, $2, 'assistant', $3, $4, $5, $6)
       RETURNING id`,
      [data.sessionId, data.userId, data.response, data.imageUrl || null, data.modelSlug, data.pointsSpent]
    );
    // Обновляем сессию
    await pool.query(
      `UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [data.sessionId]
    );
    await pool.query(
      'UPDATE users SET generations_count = generations_count + 1 WHERE id = $1',
      [data.userId]
    );
    return msgResult.rows[0].id;
  }

  // Иначе — старый путь через generations
  const result = await pool.query(
    `INSERT INTO generations (user_id, model_slug, points_spent, status, prompt, result_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [data.userId, data.modelSlug, data.pointsSpent, data.status || 'completed', data.prompt, data.imageUrl]
  );
  await pool.query(
    'UPDATE users SET generations_count = generations_count + 1 WHERE id = $1',
    [data.userId]
  );
  return result.rows[0].id;
};

export const getUserChatHistory = async (userId: string, limit = 50) => {
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
  return result.rows;
};

export const calculatePointsCost = async (modelSlug: string, basePriceRub: number): Promise<number> => {
  const coefficient = await getModelCoefficient(modelSlug);
  return Math.round(basePriceRub * coefficient);
};

// ── Utils ─────────────────────────────────────────────────────────────────────

function extractVendor(modelId: string): string {
  const parts = modelId.split('/');
  return parts.length > 1 ? parts[0] : 'unknown';
}
