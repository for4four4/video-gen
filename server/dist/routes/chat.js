"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("./auth");
const polza_1 = require("../services/polza");
const router = (0, express_1.Router)();
// POST /api/chat/send - Отправить сообщение в чат
router.post('/send', auth_1.authMiddleware, async (req, res) => {
    try {
        const { model, messages, temperature, max_tokens } = req.body;
        if (!model || !messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Model and messages are required' });
        }
        const userId = req.user.id;
        // Проверяем баланс пользователя из БД
        const balance = await (0, polza_1.getUserBalance)(userId);
        // Получаем коэффициент модели
        const coefficient = await (0, polza_1.getModelCoefficient)(model);
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
            model,
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
            modelSlug: model,
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
        const { model, prompt, size } = req.body;
        if (!model || !prompt) {
            return res.status(400).json({ error: 'Model and prompt are required' });
        }
        const userId = req.user.id;
        // Проверяем баланс пользователя из БД
        const balance = await (0, polza_1.getUserBalance)(userId);
        // Получаем коэффициент модели
        const coefficient = await (0, polza_1.getModelCoefficient)(model);
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
            model,
            prompt,
            size,
        });
        // Списываем баллы
        await (0, polza_1.deductUserBalance)(userId, pointsCost);
        // Получаем URL изображения (картинки хранятся в polza.ai)
        const imageUrl = polzaResponse.data?.[0]?.url || '';
        // Сохраняем историю
        await (0, polza_1.saveChatHistory)({
            userId,
            modelSlug: model,
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
        const { model, prompt, duration, resolution } = req.body;
        if (!model || !prompt) {
            return res.status(400).json({ error: 'Model and prompt are required' });
        }
        const userId = req.user.id;
        // Проверяем баланс пользователя из БД
        const balance = await (0, polza_1.getUserBalance)(userId);
        // Получаем коэффициент модели
        const coefficient = await (0, polza_1.getModelCoefficient)(model);
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
            model,
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
            modelSlug: model,
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
        const history = await (0, polza_1.getUserChatHistory)(userId, limit);
        res.json(history);
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
exports.default = router;
