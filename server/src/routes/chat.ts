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
  getUserChatHistory,
  clearCoefficientsCache,
} from '../services/polza';

const router = Router();

// POST /api/chat/send - Отправить сообщение в чат
router.post('/send', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { modelSlug, messages, temperature, max_tokens } = req.body;

    if (!modelSlug || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'ModelSlug and messages are required' });
    }

    const userId = req.user!.id;

    // Проверяем баланс пользователя из БД
    const balance = await getUserBalance(userId);
    
    // Получаем коэффициент модели
    const coefficient = await getModelCoefficient(modelSlug);
    
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
    const polzaResponse = await sendChatMessage({
      model: modelSlug,
      messages,
      temperature,
      max_tokens,
    });

    // Списываем баллы
    await deductUserBalance(userId, pointsCost);

    // Сохраняем историю
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const assistantMessage = polzaResponse.choices?.[0]?.message?.content || '';
    
    await saveChatHistory({
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
  } catch (error: any) {
    console.error('Chat send error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.error || error.message || 'Internal server error' 
    });
  }
});

// POST /api/chat/image - Сгенерировать изображение
router.post('/image', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { modelSlug, prompt, negativePrompt, size } = req.body;

    if (!modelSlug || !prompt) {
      return res.status(400).json({ error: 'Model and prompt are required' });
    }

    const userId = req.user!.id;

    // Проверяем баланс пользователя из БД
    const balance = await getUserBalance(userId);
    
    // Получаем коэффициент модели
    const coefficient = await getModelCoefficient(modelSlug);
    
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
    const polzaResponse = await generateImage({
      model: modelSlug,
      prompt,
      negativePrompt,
      size,
    });

    // Списываем баллы
    await deductUserBalance(userId, pointsCost);

    // Получаем URL изображения (картинки хранятся в polza.ai)
    const imageUrl = polzaResponse.data?.[0]?.url || '';

    // Сохраняем историю
    await saveChatHistory({
      userId,
      modelSlug,
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
  } catch (error: any) {
    console.error('Image generation error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.error || error.message || 'Internal server error' 
    });
  }
});

// POST /api/chat/video - Сгенерировать видео
router.post('/video', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { modelSlug, prompt, duration, resolution } = req.body;

    if (!modelSlug || !prompt) {
      return res.status(400).json({ error: 'Model and prompt are required' });
    }

    const userId = req.user!.id;

    // Проверяем баланс пользователя из БД
    const balance = await getUserBalance(userId);
    
    // Получаем коэффициент модели
    const coefficient = await getModelCoefficient(modelSlug);
    
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
    const polzaResponse = await generateVideo({
      model: modelSlug,
      prompt,
      duration,
      resolution,
    });

    // Списываем баллы
    await deductUserBalance(userId, pointsCost);

    // Получаем URL видео (видео хранится в polza.ai)
    const videoUrl = polzaResponse.data?.url || '';

    // Сохраняем историю
    await saveChatHistory({
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
  } catch (error: any) {
    console.error('Video generation error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.error || error.message || 'Internal server error' 
    });
  }
});

// GET /api/chat/models - Получить список моделей из polza.ai (только image и video)
router.get('/models', async (req: Request, res: Response) => {
  try {
    const { search, page, limit, sortBy, sortOrder } = req.query;

    // Запрашиваем только модели типов image и video
    const catalog = await getModelsCatalog({
      search: search as string,
      type: ['image', 'video'], // явный фильтр по типам
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50,
      sortBy: sortBy as string,
      sortOrder: (sortOrder as 'asc' | 'desc') || 'asc',
    });

    // Добавляем коэффициенты к моделям
    const modelsWithCoefficients = await Promise.all(
      (catalog.data || []).map(async (model: any) => {
        const coefficient = await getModelCoefficient(model.id);
        return {
          ...model,
          coefficient,
        };
      })
    );

    res.json({
      ...catalog,
      data: modelsWithCoefficients,
    });
  } catch (error: any) {
    console.error('Get models error:', error.message);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/chat/history - Получить историю чатов пользователя
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const history = await getUserChatHistory(userId, limit);

    res.json(history);
  } catch (error: any) {
    console.error('Get history error:', error.message);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/chat/balance - Получить баланс пользователя
router.get('/balance', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const balance = await getUserBalance(userId);

    res.json({ balance });
  } catch (error: any) {
    console.error('Get balance error:', error.message);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
