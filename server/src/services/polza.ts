import axios from 'axios';
import pool from '../db';

const POLZA_API_BASE_URL = process.env.POLZA_API_BASE_URL || 'https://polza.ai/api';
const POLZA_API_KEY = process.env.POLZA_API_KEY;

// Кэш коэффициентов моделей
let modelCoefficientsCache: Map<string, number> = new Map();
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

// Получить коэффициент для модели
export const getModelCoefficient = async (modelSlug: string): Promise<number> => {
  // Проверяем кэш
  if (modelCoefficientsCache.has(modelSlug)) {
    const cachedCoeff = modelCoefficientsCache.get(modelSlug);
    if (cachedCoeff !== undefined) {
      return cachedCoeff;
    }
  }

  // Получаем из БД
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
    console.error('Error fetching coefficient for model:', modelSlug, error);
  }

  // Если модели нет в БД, возвращаем дефолтный коэффициент 1.5
  return 1.5;
};

// Очистить кэш коэффициентов (вызывать при обновлении в админке)
export const clearCoefficientsCache = () => {
  modelCoefficientsCache.clear();
  cacheTimestamp = 0;
};

// Получить баланс пользователя из БД
export const getUserBalance = async (userId: string): Promise<number> => {
  const result = await pool.query(
    'SELECT points_balance FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  return parseInt(result.rows[0].points_balance);
};

// Списать баллы у пользователя
export const deductUserBalance = async (userId: string, amount: number): Promise<void> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Проверка баланса
    const balanceResult = await client.query(
      'SELECT points_balance FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );

    if (balanceResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const currentBalance = parseInt(balanceResult.rows[0].points_balance);
    if (currentBalance < amount) {
      throw new Error('Insufficient balance');
    }

    // Списание
    await client.query(
      'UPDATE users SET points_balance = points_balance - $1, total_spent_rub = total_spent_rub + $2 WHERE id = $3',
      [amount, amount, userId] // Упрощенно: 1 поинт = 1 рубль
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Синхронизировать модели из polza.ai
export const syncModelsFromPolza = async (): Promise<number> => {
  try {
    const response = await axios.get(`${POLZA_API_BASE_URL}/v1/models/catalog`, {
      headers: POLZA_API_KEY ? { 'Authorization': `Bearer ${POLZA_API_KEY}` } : {},
      params: { limit: 500 } // Получаем больше моделей
    });

    const models = response.data.data || [];
    let updatedCount = 0;

    for (const model of models) {
      const type = mapModelType(model.type);
      if (!type) continue; // Пропускаем неподдерживаемые типы

      // Получаем цену из top_provider.pricing
      const pricing = model.top_provider?.pricing || {};
      let basePriceUsd = 0;

      // Конвертируем RUB в USD (условно 1 USD = 90 RUB)
      if (pricing.prompt_per_million) {
        basePriceUsd = parseFloat(pricing.prompt_per_million) / 90;
      } else if (pricing.request_per_thousand) {
        basePriceUsd = parseFloat(pricing.request_per_thousand) / 90;
      } else if (pricing.video_per_second) {
        basePriceUsd = parseFloat(pricing.video_per_second) / 90;
      }

      // Вставляем или обновляем модель
      await pool.query(`
        INSERT INTO model_coefficients (slug, name, vendor, type, base_price_usd, coefficient, enabled)
        VALUES ($1, $2, $3, $4, $5, 1.5, TRUE)
        ON CONFLICT (slug) DO UPDATE SET 
          name = EXCLUDED.name,
          vendor = EXCLUDED.vendor,
          type = EXCLUDED.type,
          base_price_usd = EXCLUDED.base_price_usd,
          updated_at = CURRENT_TIMESTAMP
      `, [model.id, model.name, extractVendor(model.id), type, basePriceUsd]);

      updatedCount++;
    }

    // Очищаем кэш коэффициентов после синхронизации
    clearCoefficientsCache();

    return updatedCount;
  } catch (error) {
    console.error('Error syncing models from polza.ai:', error);
    throw error;
  }
};

// Получить модели из polza.ai с фильтрацией
export const getModelsCatalog = async (params?: {
  search?: string;
  type?: string;
  inputModalities?: string[];
  outputModalities?: string[];
  providers?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  try {
    // Преобразуем type из строки "image,video" в массив для API
    const typeArray = params?.type ? params.type.split(',') : undefined;
    
    const response = await axios.get(`${POLZA_API_BASE_URL}/v1/models/catalog`, {
      headers: POLZA_API_KEY ? { 'Authorization': `Bearer ${POLZA_API_KEY}` } : {},
      params: {
        ...params,
        type: typeArray, // Передаем как массив
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching models catalog:', error);
    throw error;
  }
};

// Отправить сообщение в чат
export const sendChatMessage = async (options: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
}): Promise<any> => {
  try {
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
          ...(POLZA_API_KEY ? { 'Authorization': `Bearer ${POLZA_API_KEY}` } : {}),
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error sending chat message:', error.response?.data || error.message);
    throw error;
  }
};

// Сгенерировать изображение
export const generateImage = async (options: {
  model: string;
  prompt: string;
  size?: string;
  n?: number;
}): Promise<any> => {
  try {
    const response = await axios.post(
      `${POLZA_API_BASE_URL}/v1/images/generations`,
      {
        model: options.model,
        prompt: options.prompt,
        size: options.size || '1024x1024',
        n: options.n || 1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(POLZA_API_KEY ? { 'Authorization': `Bearer ${POLZA_API_KEY}` } : {}),
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error generating image:', error.response?.data || error.message);
    throw error;
  }
};

// Сгенерировать видео
export const generateVideo = async (options: {
  model: string;
  prompt: string;
  duration?: number;
  resolution?: string;
}): Promise<any> => {
  try {
    const response = await axios.post(
      `${POLZA_API_BASE_URL}/v1/videos/generations`,
      {
        model: options.model,
        prompt: options.prompt,
        duration: options.duration || 5,
        resolution: options.resolution || '720p',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(POLZA_API_KEY ? { 'Authorization': `Bearer ${POLZA_API_KEY}` } : {}),
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error generating video:', error.response?.data || error.message);
    throw error;
  }
};

// Сохранить историю чата в БД
export const saveChatHistory = async (data: {
  userId: string;
  modelSlug: string;
  prompt: string;
  response: string;
  pointsSpent: number;
  imageUrl?: string;
  status?: string;
}): Promise<string> => {
  const result = await pool.query(
    `INSERT INTO generations (user_id, model_slug, points_spent, status, prompt, result_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [data.userId, data.modelSlug, data.pointsSpent, data.status || 'completed', data.prompt, data.imageUrl]
  );

  // Обновляем счетчик генераций у пользователя
  await pool.query(
    'UPDATE users SET generations_count = generations_count + 1 WHERE id = $1',
    [data.userId]
  );

  return result.rows[0].id;
};

// Получить историю чатов пользователя
export const getUserChatHistory = async (userId: string, limit: number = 50) => {
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

  return result.rows.map(row => ({
    id: row.id,
    modelSlug: row.model_slug,
    modelName: row.model_name,
    pointsSpent: row.points_spent,
    status: row.status,
    prompt: row.prompt,
    resultUrl: row.result_url,
    createdAt: row.created_at,
  }));
};

// Вспомогательные функции
const mapModelType = (type: string): string | null => {
  const typeMap: Record<string, string> = {
    'chat': 'chat',
    'image': 'image',
    'video': 'video',
    'embedding': 'embedding',
    'audio': 'audio',
    'stt': 'audio',
    'tts': 'audio',
  };
  return typeMap[type] || null;
};

const extractVendor = (modelId: string): string => {
  const parts = modelId.split('/');
  return parts.length > 1 ? parts[0] : 'unknown';
};

// Рассчитать стоимость в поинтах
export const calculatePointsCost = async (modelSlug: string, basePriceRub: number): Promise<number> => {
  const coefficient = await getModelCoefficient(modelSlug);
  // Конвертируем рубли в поинты (1 поинт = 1 рубль * коэффициент)
  return Math.round(basePriceRub * coefficient);
};
