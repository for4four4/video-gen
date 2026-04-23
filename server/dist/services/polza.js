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
// Синхронизировать модели из polza.ai
const syncModelsFromPolza = async () => {
    try {
        const response = await axios_1.default.get(`${POLZA_API_BASE_URL}/v1/models/catalog`, {
            headers: POLZA_API_KEY ? { 'Authorization': `Bearer ${POLZA_API_KEY}` } : {},
            params: { limit: 500 } // Получаем больше моделей
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
// Получить модели из polza.ai с фильтрацией
const getModelsCatalog = async (params) => {
    try {
        // Преобразуем type из строки "image,video" в массив для API
        const typeArray = params?.type ? params.type.split(',') : undefined;
        const response = await axios_1.default.get(`${POLZA_API_BASE_URL}/v1/models/catalog`, {
            headers: POLZA_API_KEY ? { 'Authorization': `Bearer ${POLZA_API_KEY}` } : {},
            params: {
                ...params,
                type: typeArray, // Передаем как массив
            }
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
        const response = await axios_1.default.post(`${POLZA_API_BASE_URL}/v1/images/generations`, {
            model: options.model,
            prompt: options.prompt,
            size: options.size || '1024x1024',
            n: options.n || 1,
        }, {
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
    const typeMap = {
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
