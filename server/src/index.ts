import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db';
import { createTables, seedDefaultData } from './database/init';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import chatRoutes from './routes/chat';
import contentRoutes from './routes/content';
import uploadRoutes from './routes/upload';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'public', 'uploads')));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Track visits (только не-API)
app.use(async (req, res, next) => {
  try {
    if (!req.path.startsWith('/api/')) {
      await pool.query(
        'INSERT INTO visits (ip_address, user_agent, page_path) VALUES ($1, $2, $3)',
        [req.ip, req.get('user-agent'), req.path]
      );
    }
  } catch (_) { /* ignore */ }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', contentRoutes); // news, blog, pricing, models, chat/sessions
app.use('/api/admin', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Start server ──────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');

    await createTables();
    await seedDefaultData();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    // Auto-sync models from polza.ai every 4 hours
    const { syncModelsFromPolza } = await import('./services/polza');

    const runSync = async () => {
      try {
        const count = await syncModelsFromPolza();
        console.log(`🔄 Auto-sync: ${count} models updated`);
      } catch (err: any) {
        console.error('❌ Auto-sync error:', err.message);
      }
    };

    // Первый запуск через 5 сек после старта
    setTimeout(runSync, 5000);

    // Потом каждые 4 часа
    setInterval(runSync, 4 * 60 * 60 * 1000);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
