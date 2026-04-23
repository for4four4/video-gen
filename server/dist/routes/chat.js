"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const auth_1 = require("./auth");
const polza_1 = require("../services/polza");
const router = (0, express_1.Router)();
// POST /api/chat/send - Отправить сообщение в чат
router.post('/send', auth_1.authMiddleware, async (req, res) => {
    try {
        const { modelSlug, messages, temperature, max_tokens } = req.body;
        if (!modelSlug || !messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'ModelSlug and messages are required' });
        }
        const userId = req.user.id;
        // Проверяем баланс пользователя из БД
        const balance = await (0, polza_1.getUserBalance)(userId);
        // Получаем коэффициент модели
        const coefficient = await (0, polza_1.getModelCoefficient)(modelSlug);
        // Рассчитываем стоимость (упрощенно: базовая цена * коэффициент)
        // В реальном проекте нужно считать токены
        const basePriceRub = 10; // Условная базовая цена за запрос
        const pointsCost = Math.round(basePriceRub * coefficient);
        if (balance < pointsCost) {
            return res.status(402).json({
                error: 'Insufficient balance',
                currentBalance: balance,
                requiredBalance: pointsCost,
            });
        }
        // Отправляем запрос в polza.ai
        const polzaResponse = await (0, polza_1.sendChatMessage)({
            model: modelSlug,
            messages,
            temperature,
            max_tokens,
        });
        // Списываем баллы
        await (0, polza_1.deductUserBalance)(userId, pointsCost);
        // Сохраняем историю
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        const assistantMessage = polzaResponse.choices?.[0]?.message?.content || '';
        await (0, polza_1.saveChatHistory)({
            userId,
            modelSlug,
            prompt: lastUserMessage?.content || '',
            response: assistantMessage,
            pointsSpent: pointsCost,
            status: 'completed',
        });
        res.json({
            response: polzaResponse,
            pointsSpent: pointsCost,
            remainingBalance: balance - pointsCost,
        });
    }
    catch (error) {
        console.error('Chat send error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || error.message || 'Internal server error'
        });
    }
});
// POST /api/chat/image - Сгенерировать изображение
router.post('/image', auth_1.authMiddleware, async (req, res) => {
    try {
        const { model, modelSlug, prompt, negativePrompt, size } = req.body;
        const actualModelSlug = model || modelSlug;
        if (!actualModelSlug || !prompt) {
            return res.status(400).json({ error: 'Model and prompt are required' });
        }
        const userId = req.user.id;
        // Проверяем баланс пользователя из БД
        const balance = await (0, polza_1.getUserBalance)(userId);
        // Получаем коэффициент модели
        const coefficient = await (0, polza_1.getModelCoefficient)(actualModelSlug);
        // Рассчитываем стоимость
        const basePriceRub = 50; // Условная базовая цена за изображение
        const pointsCost = Math.round(basePriceRub * coefficient);
        if (balance < pointsCost) {
            return res.status(402).json({
                error: 'Insufficient balance',
                currentBalance: balance,
                requiredBalance: pointsCost,
            });
        }
        // Генерируем изображение через polza.ai
        const polzaResponse = await (0, polza_1.generateImage)({
            model: actualModelSlug,
            prompt,
            negativePrompt,
            size,
        });
        // Списываем баллы
        await (0, polza_1.deductUserBalance)(userId, pointsCost);
        // Получаем URL изображения (картинки хранятся в polza.ai)
        const imageUrl = polzaResponse.data?.[0]?.url || '';
        // Сохраняем историю
        await (0, polza_1.saveChatHistory)({
            userId,
            modelSlug: actualModelSlug,
            prompt,
            response: 'Image generated successfully',
            pointsSpent: pointsCost,
            imageUrl,
            status: 'completed',
        });
        res.json({
            imageUrl,
            pointsSpent: pointsCost,
            remainingBalance: balance - pointsCost,
        });
    }
    catch (error) {
        console.error('Image generation error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || error.message || 'Internal server error'
        });
    }
});
// POST /api/chat/video - Сгенерировать видео
router.post('/video', auth_1.authMiddleware, async (req, res) => {
    try {
        const { modelSlug, prompt, duration, resolution } = req.body;
        if (!modelSlug || !prompt) {
            return res.status(400).json({ error: 'Model and prompt are required' });
        }
        const userId = req.user.id;
        // Проверяем баланс пользователя из БД
        const balance = await (0, polza_1.getUserBalance)(userId);
        // Получаем коэффициент модели
        const coefficient = await (0, polza_1.getModelCoefficient)(modelSlug);
        // Рассчитываем стоимость
        const basePriceRub = 200; // Условная базовая цена за видео
        const pointsCost = Math.round(basePriceRub * coefficient);
        if (balance < pointsCost) {
            return res.status(402).json({
                error: 'Insufficient balance',
                currentBalance: balance,
                requiredBalance: pointsCost,
            });
        }
        // Генерируем видео через polza.ai
        const polzaResponse = await (0, polza_1.generateVideo)({
            model: modelSlug,
            prompt,
            duration,
            resolution,
        });
        // Списываем баллы
        await (0, polza_1.deductUserBalance)(userId, pointsCost);
        // Получаем URL видео (видео хранится в polza.ai)
        const videoUrl = polzaResponse.data?.url || '';
        // Сохраняем историю
        await (0, polza_1.saveChatHistory)({
            userId,
            modelSlug,
            prompt,
            response: 'Video generated successfully',
            pointsSpent: pointsCost,
            imageUrl: videoUrl,
            status: 'completed',
        });
        res.json({
            videoUrl,
            pointsSpent: pointsCost,
            remainingBalance: balance - pointsCost,
        });
    }
    catch (error) {
        console.error('Video generation error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || error.message || 'Internal server error'
        });
    }
});
// GET /api/chat/models - Получить список моделей из polza.ai (только image и video)
router.get('/models', async (req, res) => {
    try {
        const { search, page, limit, sortBy, sortOrder } = req.query;
        // Запрашиваем только модели типов image и video
        const catalog = await (0, polza_1.getModelsCatalog)({
            search: search,
            type: ['image', 'video'], // явный фильтр по типам
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 50,
            sortBy: sortBy,
            sortOrder: sortOrder || 'asc',
        });
        // Добавляем коэффициенты к моделям
        const modelsWithCoefficients = await Promise.all((catalog.data || []).map(async (model) => {
            const coefficient = await (0, polza_1.getModelCoefficient)(model.id);
            return {
                ...model,
                coefficient,
            };
        }));
        res.json({
            ...catalog,
            data: modelsWithCoefficients,
        });
    }
    catch (error) {
        console.error('Get models error:', error.message);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
// GET /api/chat/history - Получить историю чатов пользователя
router.get('/history', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        // Получаем все генерации пользователя
        const result = await db_1.default.query(`SELECT g.id, g.model_slug, g.points_spent, g.status, g.prompt, g.result_url, g.created_at,
              m.name as model_name
       FROM generations g
       LEFT JOIN model_coefficients m ON g.model_slug = m.slug
       WHERE g.user_id = $1
       ORDER BY g.created_at DESC
       LIMIT $2`, [userId, limit]);
        // Преобразуем плоский список генераций в формат сессий
        // Каждая генерация становится отдельной "сессией" для упрощения
        const sessions = result.rows.map((row) => ({
            id: row.id,
            userId,
            title: row.prompt?.slice(0, 40) || 'Чат',
            modelSlug: row.model_slug,
            messages: [
                {
                    role: 'user',
                    content: row.prompt || '',
                    model: row.model_slug,
                    cost: row.points_spent,
                    createdAt: row.created_at,
                },
                {
                    role: 'assistant',
                    content: row.result_url ? 'Генерация завершена' : 'Ответ готов',
                    image: row.result_url || undefined,
                    model: row.model_name || row.model_slug,
                    cost: row.points_spent,
                    createdAt: row.created_at,
                },
            ],
            createdAt: row.created_at,
            updatedAt: row.created_at,
        }));
        res.json(sessions);
    }
    catch (error) {
        console.error('Get history error:', error.message);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
// GET /api/chat/balance - Получить баланс пользователя
router.get('/balance', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const balance = await (0, polza_1.getUserBalance)(userId);
        res.json({ balance });
    }
    catch (error) {
        console.error('Get balance error:', error.message);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
// GET /api/chat/session/:id - Получить конкретную сессию
router.get('/session/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionId = req.params.id;
        // Получаем все генерации пользователя и группируем по дате в сессии
        const result = await db_1.default.query(`SELECT g.id, g.model_slug, g.points_spent, g.status, g.prompt, g.result_url, g.created_at,
              m.name as model_name
       FROM generations g
       LEFT JOIN model_coefficients m ON g.model_slug = m.slug
       WHERE g.user_id = $1
       ORDER BY g.created_at ASC`, [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }
        // Преобразуем плоский список генераций в формат сессии с сообщениями
        const messages = [];
        for (const row of result.rows) {
            messages.push({
                role: 'user',
                content: row.prompt,
                model: row.model_slug,
                cost: row.points_spent,
                createdAt: row.created_at,
            });
            messages.push({
                role: 'assistant',
                content: row.result_url ? 'Генерация завершена' : 'Ответ готов',
                image: row.result_url || undefined,
                model: row.model_name || row.model_slug,
                cost: row.points_spent,
                createdAt: row.created_at,
            });
        }
        const session = {
            id: sessionId,
            userId,
            title: result.rows[0]?.prompt?.slice(0, 40) || 'Чат',
            modelSlug: result.rows[0]?.model_slug || '',
            messages,
            createdAt: result.rows[0]?.created_at,
            updatedAt: result.rows[result.rows.length - 1]?.created_at,
        };
        res.json(session);
    }
    catch (error) {
        console.error('Get session error:', error.message);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
// DELETE /api/chat/session/:id - Удалить сессию (все генерации пользователя)
router.delete('/session/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionId = req.params.id;
        // В данной реализации sessionId игнорируется, удаляем все генерации пользователя
        // В будущей версии можно добавить поле session_id в таблицу generations
        await db_1.default.query('DELETE FROM generations WHERE user_id = $1', [userId]);
        res.json({ message: 'Session deleted successfully' });
    }
    catch (error) {
        console.error('Delete session error:', error.message);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
exports.default = router;
