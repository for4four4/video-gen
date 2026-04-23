"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePointsCost = exports.getUserChatHistory = exports.saveChatHistory = exports.generateVideo = exports.generateImage = exports.sendChatMessage = exports.getModelsCatalog = exports.syncModelsFromPolza = exports.deductUserBalance = exports.getUserBalance = exports.clearCoefficientsCache = exports.getModelCoefficient = void 0;
const axios_1 = __importDefault(require("axios"));
const db_1 = __importDefault(require("../db"));
const POLZA_API_BASE_URL = process.env.POLZA_API_BASE_URL || 'https://polza.ai/api';
const POLZA_API_KEY = process.env.POLZA_API_KEY;
// Кэш коэффициентов моделей
let modelCoefficientsCache = new Map();
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 минут
// Получить коэффициент для модели
const getModelCoefficient = async (modelSlug) => {
    // Проверяем кэш
    if (modelCoefficientsCache.has(modelSlug)) {
        const cachedCoeff = modelCoefficientsCache.get(modelSlug);
        if (cachedCoeff !== undefined) {
            return cachedCoeff;
        }
    }
    // Получаем из БД
    try {
        const result = await db_1.default.query('SELECT coefficient FROM model_coefficients WHERE slug = $1', [modelSlug]);
        if (result.rows.length > 0) {
            const coeff = parseFloat(result.rows[0].coefficient);
            modelCoefficientsCache.set(modelSlug, coeff);
            return coeff;
        }
    }
    catch (error) {
        console.error('Error fetching coefficient for model:', modelSlug, error);
    }
    // Если модели нет в БД, возвращаем дефолтный коэффициент 1.5
    return 1.5;
};
exports.getModelCoefficient = getModelCoefficient;
// Очистить кэш коэффициентов (вызывать при обновлении в админке)
const clearCoefficientsCache = () => {
    modelCoefficientsCache.clear();
    cacheTimestamp = 0;
};
exports.clearCoefficientsCache = clearCoefficientsCache;
// Получить баланс пользователя из БД
const getUserBalance = async (userId) => {
    const result = await db_1.default.query('SELECT points_balance FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
        throw new Error('User not found');
    }
    return parseInt(result.rows[0].points_balance);
};
exports.getUserBalance = getUserBalance;
// Списать баллы у пользователя
const deductUserBalance = async (userId, amount) => {
    const client = await db_1.default.connect();
    try {
        await client.query('BEGIN');
        // Проверка баланса
        const balanceResult = await client.query('SELECT points_balance FROM users WHERE id = $1 FOR UPDATE', [userId]);
        if (balanceResult.rows.length === 0) {
            throw new Error('User not found');
        }
        const currentBalance = parseInt(balanceResult.rows[0].points_balance);
        if (currentBalance < amount) {
            throw new Error('Insufficient balance');
        }
        // Списание
        await client.query('UPDATE users SET points_balance = points_balance - $1, total_spent_rub = total_spent_rub + $2 WHERE id = $3', [amount, amount, userId] // Упрощенно: 1 поинт = 1 рубль
        );
        await client.query('COMMIT');
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
};
exports.deductUserBalance = deductUserBalance;
// Синхронизировать модели из polza.ai (только image и video)
const syncModelsFromPolza = async () => {
    try {
        // Формируем URL вручную для корректной передачи массива type
        const baseUrl = `${POLZA_API_BASE_URL}/v1/models/catalog`;
        const queryParams = new URLSearchParams();
        // Добавляем каждый тип как отдельный параметр
        queryParams.append('type', 'image');
        queryParams.append('type', 'video');
        queryParams.append('limit', '500');
        const url = `${baseUrl}?${queryParams.toString()}`;
        const response = await axios_1.default.get(url, {
            headers: POLZA_API_KEY ? { 'Authorization': `Bearer ${POLZA_API_KEY}` } : {},
        });
        const models = response.data.data || [];
        let updatedCount = 0;
        for (const model of models) {
            const type = mapModelType(model.type);
            if (!type)
                continue; // Пропускаем неподдерживаемые типы
            // Получаем цену из top_provider.pricing
            const pricing = model.top_provider?.pricing || {};
            let basePriceUsd = 0;
            // Конвертируем RUB в USD (условно 1 USD = 90 RUB)
            if (pricing.prompt_per_million) {
                basePriceUsd = parseFloat(pricing.prompt_per_million) / 90;
            }
            else if (pricing.request_per_thousand) {
                basePriceUsd = parseFloat(pricing.request_per_thousand) / 90;
            }
            else if (pricing.video_per_second) {
                basePriceUsd = parseFloat(pricing.video_per_second) / 90;
            }
            // Вставляем или обновляем модель
            await db_1.default.query(`
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
        (0, exports.clearCoefficientsCache)();
        return updatedCount;
    }
    catch (error) {
        console.error('Error syncing models from polza.ai:', error);
        throw error;
    }
};
exports.syncModelsFromPolza = syncModelsFromPolza;
// Получить модели из polza.ai с фильтрацией (только image и video)
const getModelsCatalog = async (params) => {
    try {
        // Формируем URL вручную для корректной передачи массива type
        const baseUrl = `${POLZA_API_BASE_URL}/v1/models/catalog`;
        const queryParams = new URLSearchParams();
        if (params?.search)
            queryParams.append('search', params.search);
        // Добавляем каждый тип как отдельный параметр
        const types = params?.type || ['image', 'video'];
        types.forEach(type => queryParams.append('type', type));
        queryParams.append('page', String(params?.page || 1));
        queryParams.append('limit', String(params?.limit || 50));
        if (params?.sortBy)
            queryParams.append('sortBy', params.sortBy);
        if (params?.sortOrder)
            queryParams.append('sortOrder', params.sortOrder);
        const url = `${baseUrl}?${queryParams.toString()}`;
        const response = await axios_1.default.get(url, {
            headers: POLZA_API_KEY ? { 'Authorization': `Bearer ${POLZA_API_KEY}` } : {},
        });
        return response.data;
    }
    catch (error) {
        console.error('Error fetching models catalog:', error);
        throw error;
    }
};
exports.getModelsCatalog = getModelsCatalog;
// Отправить сообщение в чат
const sendChatMessage = async (options) => {
    try {
        const response = await axios_1.default.post(`${POLZA_API_BASE_URL}/v1/chat/completions`, {
            model: options.model,
            messages: options.messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.max_tokens ?? 2048,
        }, {
            headers: {
                'Content-Type': 'application/json',
                ...(POLZA_API_KEY ? { 'Authorization': `Bearer ${POLZA_API_KEY}` } : {}),
            },
        });
        return response.data;
    }
    catch (error) {
        console.error('Error sending chat message:', error.response?.data || error.message);
        throw error;
    }
};
exports.sendChatMessage = sendChatMessage;
// Сгенерировать изображение
const generateImage = async (options) => {
    try {
        const requestBody = {
            model: options.model,
            prompt: options.prompt,
        };
        // Добавляем опциональные параметры только если они переданы
        if (options.negativePrompt)
            requestBody.negative_prompt = options.negativePrompt;
        if (options.size)
            requestBody.size = options.size;
        if (options.n)
            requestBody.n = options.n;
        if (options.aspect_ratio)
            requestBody.aspect_ratio = options.aspect_ratio;
        if (options.image_resolution)
            requestBody.image_resolution = options.image_resolution;
        if (options.quality)
            requestBody.quality = options.quality;
        if (options.seed !== undefined)
            requestBody.seed = options.seed;
        if (options.guidance_scale !== undefined)
            requestBody.guidance_scale = options.guidance_scale;
        if (options.enable_safety_checker !== undefined)
            requestBody.enable_safety_checker = options.enable_safety_checker;
        if (options.output_format)
            requestBody.output_format = options.output_format;
        if (options.upscale_factor)
            requestBody.upscale_factor = options.upscale_factor;
        if (options.fixed_lens !== undefined)
            requestBody.fixed_lens = options.fixed_lens;
        if (options.generate_audio !== undefined)
            requestBody.generate_audio = options.generate_audio;
        const response = await axios_1.default.post(`${POLZA_API_BASE_URL}/v1/images/generations`, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                ...(POLZA_API_KEY ? { 'Authorization': `Bearer ${POLZA_API_KEY}` } : {}),
            },
        });
        return response.data;
    }
    catch (error) {
        console.error('Error generating image:', error.response?.data || error.message);
        throw error;
    }
};
exports.generateImage = generateImage;
// Сгенерировать видео
const generateVideo = async (options) => {
    try {
        const response = await axios_1.default.post(`${POLZA_API_BASE_URL}/v1/videos/generations`, {
            model: options.model,
            prompt: options.prompt,
            duration: options.duration || 5,
            resolution: options.resolution || '720p',
        }, {
            headers: {
                'Content-Type': 'application/json',
                ...(POLZA_API_KEY ? { 'Authorization': `Bearer ${POLZA_API_KEY}` } : {}),
            },
        });
        return response.data;
    }
    catch (error) {
        console.error('Error generating video:', error.response?.data || error.message);
        throw error;
    }
};
exports.generateVideo = generateVideo;
// Сохранить историю чата в БД
const saveChatHistory = async (data) => {
    const result = await db_1.default.query(`INSERT INTO generations (user_id, model_slug, points_spent, status, prompt, result_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`, [data.userId, data.modelSlug, data.pointsSpent, data.status || 'completed', data.prompt, data.imageUrl]);
    // Обновляем счетчик генераций у пользователя
    await db_1.default.query('UPDATE users SET generations_count = generations_count + 1 WHERE id = $1', [data.userId]);
    return result.rows[0].id;
};
exports.saveChatHistory = saveChatHistory;
// Получить историю чатов пользователя
const getUserChatHistory = async (userId, limit = 50) => {
    const result = await db_1.default.query(`SELECT g.id, g.model_slug, g.points_spent, g.status, g.prompt, g.result_url, g.created_at,
            m.name as model_name
     FROM generations g
     LEFT JOIN model_coefficients m ON g.model_slug = m.slug
     WHERE g.user_id = $1
     ORDER BY g.created_at DESC
     LIMIT $2`, [userId, limit]);
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
exports.getUserChatHistory = getUserChatHistory;
// Вспомогательные функции
const mapModelType = (type) => {
    // Разрешаем только image и video типы
    const allowedTypes = {
        'image': 'image',
        'video': 'video',
    };
    return allowedTypes[type] || null;
};
const extractVendor = (modelId) => {
    const parts = modelId.split('/');
    return parts.length > 1 ? parts[0] : 'unknown';
};
// Рассчитать стоимость в поинтах
const calculatePointsCost = async (modelSlug, basePriceRub) => {
    const coefficient = await (0, exports.getModelCoefficient)(modelSlug);
    // Конвертируем рубли в поинты (1 поинт = 1 рубль * коэффициент)
    return Math.round(basePriceRub * coefficient);
};
exports.calculatePointsCost = calculatePointsCost;
