import axios from 'axios';
import pool from '../db';
import { getModelConfig } from '../config/models';

const POLZA_API_BASE_URL = (process.env.POLZA_API_BASE_URL || 'https://polza.ai/api').trim();
const POLZA_API_KEY = process.env.POLZA_API_KEY;

// Кэш коэффициентов моделей
let modelCoefficientsCache: Map<string, number> = new Map();

// Получить коэффициент для модели
export const getModelCoefficient = async (modelSlug: string): Promise<number> => {
  if (modelCoefficientsCache.has(modelSlug)) {
    const cachedCoeff = modelCoefficientsCache.get(modelSlug);
    if (cachedCoeff !== undefined) return cachedCoeff;
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
    console.error('Error fetching coefficient:', error);
  }
  return 1.5;
};

export const clearCoefficientsCache = () => modelCoefficientsCache.clear();

export const getUserBalance = async (userId: string): Promise<number> => {
  const result = await pool.query('SELECT points_balance FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) throw new Error('User not found');
  return parseInt(result.rows[0].points_balance);
};

export const deductUserBalance = async (userId: string, amount: number): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const balanceResult = await client.query('SELECT points_balance FROM users WHERE id = $1 FOR UPDATE', [userId]);
    if (balanceResult.rows.length === 0) throw new Error('User not found');
    const currentBalance = parseInt(balanceResult.rows[0].points_balance);
    if (currentBalance < amount) throw new Error('Insufficient balance');
    await client.query('UPDATE users SET points_balance = points_balance - $1, total_spent_rub = total_spent_rub + $2 WHERE id = $3', [amount, amount, userId]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Функция ожидания завершения генерации (Polling)
async function waitForGeneration(taskId: string, type: 'image' | 'video' = 'image'): Promise<string> {
  const maxAttempts = type === 'image' ? 200 : 120; // До 10 мин для фото, 10 мин для видео
  const interval = type === 'image' ? 3000 : 5000; // 3 сек или 5 сек
  
  console.log(`[Polza] Starting polling for task ${taskId}...`);

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, interval));
    
    try {
      const response = await axios.get(`${POLZA_API_BASE_URL}/v1/media/${taskId}`, {
        headers: { 'Authorization': `Bearer ${POLZA_API_KEY}` }
      });
      
      const status = response.data.status;
      console.log(`[Polza] Task ${taskId} status: ${status}`);

      if (status === 'completed') {
        const url = response.data.data?.url;
        if (!url) throw new Error('No URL in completed response');
        console.log(`[Polza] Task ${taskId} completed! URL: ${url}`);
        return url;
      }
      
      if (status === 'failed') {
        const errorMsg = response.data.error?.message || 'Generation failed';
        console.error(`[Polza] Task ${taskId} failed: ${errorMsg}`);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(`[Polza] Task ${taskId} not found yet, retrying...`);
      } else {
        throw error;
      }
    }
  }
  throw new Error('Generation timeout exceeded');
}

export const generateImage = async (options: {
  model: string;
  prompt: string;
  negativePrompt?: string;
  aspect_ratio?: string;
  image_resolution?: string;
  quality?: string;
  seed?: number;
  n?: number;
}): Promise<{ url: string }> => {
  const modelConfig = getModelConfig(options.model);
  
  const payload: any = {
    model: options.model,
    input: {
      prompt: options.prompt,
      aspect_ratio: options.aspect_ratio || modelConfig?.defaults?.aspect_ratio || '1:1',
      image_resolution: options.image_resolution || modelConfig?.defaults?.image_resolution,
      quality: options.quality || modelConfig?.defaults?.quality,
      seed: options.seed ?? modelConfig?.defaults?.seed,
      max_images: options.n || modelConfig?.defaults?.images || 1,
    },
    async: true // Важно: включаем асинхронный режим
  };

  if (options.negativePrompt) payload.input.negative_prompt = options.negativePrompt;

  console.log(`[Polza] Requesting image generation for model: ${options.model}`);
  
  // 1. Запускаем генерацию
  const startResponse = await axios.post(`${POLZA_API_BASE_URL}/v1/media`, payload, {
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${POLZA_API_KEY}` 
    }
  });

  const taskId = startResponse.data.id;
  if (!taskId) throw new Error('No task ID returned from Polza');
  console.log(`[Polza] Generation started, task ID: ${taskId}`);

  // 2. Ждем завершения (Polling)
  const imageUrl = await waitForGeneration(taskId, 'image');
  
  return { url: imageUrl };
};

export const generateVideo = async (options: {
  model: string;
  prompt: string;
  duration?: number;
  resolution?: string;
  aspect_ratio?: string;
}): Promise<{ url: string }> => {
  const modelConfig = getModelConfig(options.model);

  const payload: any = {
    model: options.model,
    input: {
      prompt: options.prompt,
      duration: options.duration ? `${options.duration}s` : (modelConfig?.defaults?.duration || '10s'),
      resolution: options.resolution || modelConfig?.defaults?.resolution,
      aspect_ratio: options.aspect_ratio || modelConfig?.defaults?.aspect_ratio,
    },
    async: true
  };

  console.log(`[Polza] Requesting video generation for model: ${options.model}`);

  const startResponse = await axios.post(`${POLZA_API_BASE_URL}/v1/media`, payload, {
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${POLZA_API_KEY}` 
    }
  });

  const taskId = startResponse.data.id;
  if (!taskId) throw new Error('No task ID returned from Polza');
  console.log(`[Polza] Video generation started, task ID: ${taskId}`);

  const videoUrl = await waitForGeneration(taskId, 'video');
  return { url: videoUrl };
};

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
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [data.userId, data.modelSlug, data.pointsSpent, data.status || 'completed', data.prompt, data.imageUrl]
  );
  await pool.query('UPDATE users SET generations_count = generations_count + 1 WHERE id = $1', [data.userId]);
  return result.rows[0].id;
};

export const getUserChatHistory = async (userId: string, limit: number = 50) => {
  const result = await pool.query(
    `SELECT g.id, g.model_slug, g.points_spent, g.status, g.prompt, g.result_url, g.created_at, m.name as model_name
     FROM generations g LEFT JOIN model_coefficients m ON g.model_slug = m.slug
     WHERE g.user_id = $1 ORDER BY g.created_at DESC LIMIT $2`,
    [userId, limit]
  );
  return result.rows.map(row => ({
    id: row.id, modelSlug: row.model_slug, modelName: row.model_name,
    pointsSpent: row.points_spent, status: row.status, prompt: row.prompt,
    resultUrl: row.result_url, createdAt: row.created_at,
  }));
};

export const calculatePointsCost = async (modelSlug: string, basePriceRub: number): Promise<number> => {
  const coefficient = await getModelCoefficient(modelSlug);
  return Math.round(basePriceRub * coefficient);
};

export const syncModelsFromPolza = async (): Promise<number> => {
  // Упрощенная версия синхронизации
  return 0;
};
