import pool from '../db';

export const createTables = async () => {
  const client = await pool.connect();

  try {
    // Users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        points_balance INTEGER DEFAULT 0,
        total_spent_rub INTEGER DEFAULT 0,
        generations_count INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        is_admin BOOLEAN DEFAULT FALSE,
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Model coefficients + дополнительные поля
    await client.query(`
      CREATE TABLE IF NOT EXISTS model_coefficients (
        slug VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        vendor VARCHAR(255) NOT NULL,
        type VARCHAR(20) NOT NULL,
        base_price_usd DECIMAL(10, 4) NOT NULL DEFAULT 0,
        coefficient DECIMAL(5, 2) DEFAULT 1.5,
        enabled BOOLEAN DEFAULT TRUE,
        description TEXT,
        short_description TEXT,
        input_modalities TEXT,
        output_modalities TEXT,
        parameters_json TEXT,
        featured BOOLEAN DEFAULT FALSE,
        speed VARCHAR(20) DEFAULT 'medium',
        popularity INTEGER DEFAULT 50,
        icon_url TEXT,
        cover_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Добавляем новые колонки если они ещё не существуют (для существующих таблиц)
    const newColumns = [
      `ALTER TABLE model_coefficients ADD COLUMN IF NOT EXISTS description TEXT`,
      `ALTER TABLE model_coefficients ADD COLUMN IF NOT EXISTS short_description TEXT`,
      `ALTER TABLE model_coefficients ADD COLUMN IF NOT EXISTS input_modalities TEXT`,
      `ALTER TABLE model_coefficients ADD COLUMN IF NOT EXISTS output_modalities TEXT`,
      `ALTER TABLE model_coefficients ADD COLUMN IF NOT EXISTS parameters_json TEXT`,
      `ALTER TABLE model_coefficients ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE model_coefficients ADD COLUMN IF NOT EXISTS speed VARCHAR(20) DEFAULT 'medium'`,
      `ALTER TABLE model_coefficients ADD COLUMN IF NOT EXISTS popularity INTEGER DEFAULT 50`,
      `ALTER TABLE model_coefficients ADD COLUMN IF NOT EXISTS icon_url TEXT`,
      `ALTER TABLE model_coefficients ADD COLUMN IF NOT EXISTS cover_image TEXT`,
    ];
    for (const sql of newColumns) {
      await client.query(sql).catch(() => {}); // игнорируем ошибки если уже есть
    }

    // Generations
    await client.query(`
      CREATE TABLE IF NOT EXISTS generations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        model_slug VARCHAR(100),
        points_spent INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'running',
        prompt TEXT,
        result_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payments
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        amount_rub INTEGER NOT NULL,
        points INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        provider VARCHAR(50) DEFAULT 'manual',
        payment_external_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Settings
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Visits
    await client.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ip_address VARCHAR(45),
        user_agent TEXT,
        page_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Model examples
    await client.query(`
      CREATE TABLE IF NOT EXISTS model_examples (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        model_slug VARCHAR(100),
        image_url TEXT NOT NULL,
        prompt TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // News
    await client.query(`
      CREATE TABLE IF NOT EXISTS news (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(500) NOT NULL,
        excerpt TEXT,
        content TEXT,
        tag VARCHAR(50) DEFAULT 'update',
        model_name VARCHAR(100),
        cover_image TEXT,
        seo_title VARCHAR(500),
        seo_description TEXT,
        published BOOLEAN DEFAULT FALSE,
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Blog posts
    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(500) NOT NULL,
        excerpt TEXT,
        content TEXT,
        category VARCHAR(100),
        author VARCHAR(255),
        read_minutes INTEGER DEFAULT 5,
        cover_image TEXT,
        featured BOOLEAN DEFAULT FALSE,
        seo_title VARCHAR(500),
        seo_description TEXT,
        published BOOLEAN DEFAULT FALSE,
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Pricing plans
    await client.query(`
      CREATE TABLE IF NOT EXISTS pricing_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        points INTEGER NOT NULL,
        price_rub INTEGER NOT NULL,
        bonus_points INTEGER DEFAULT 0,
        popular BOOLEAN DEFAULT FALSE,
        enabled BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Chat sessions
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500) DEFAULT 'Новый чат',
        model_slug VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Chat messages
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT,
        result_url TEXT,
        model_slug VARCHAR(100),
        points_spent INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Индексы
    await client.query(`CREATE INDEX IF NOT EXISTS idx_generations_user ON generations(user_id)`).catch(() => {});
    await client.query(`CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id)`).catch(() => {});
    await client.query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id)`).catch(() => {});
    await client.query(`CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug)`).catch(() => {});
    await client.query(`CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug)`).catch(() => {});

    console.log('✅ All tables created/verified');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const seedDefaultData = async () => {
  const client = await pool.connect();

  try {
    const bcrypt = require('bcryptjs');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@imagination.ai';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await client.query(`
      INSERT INTO users (email, password_hash, name, is_admin, points_balance, status)
      VALUES ($1, $2, 'Admin', TRUE, 10000, 'active')
      ON CONFLICT (email) DO NOTHING
    `, [adminEmail, passwordHash]);

    // Дефолтные настройки
    const settings = [
      ['pointToRubRate', '1'],
      ['signupBonusPoints', '50'],
      ['minTopUpPoints', '100'],
      ['polzaApiBaseUrl', process.env.POLZA_API_BASE_URL || 'https://polza.ai/api'],
      ['defaultCoefficient', '1.5'],
      ['usdToRubRate', '90'],
    ];

    for (const [key, value] of settings) {
      await client.query(`
        INSERT INTO settings (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO NOTHING
      `, [key, value]);
    }

    // Дефолтные тарифные планы
    const plans = [
      ['Старт',      100,   100,    0, false, 1],
      ['Базовый',    500,   500,   25, false, 2],
      ['Популярный', 1000, 1000,  100,  true, 3],
      ['Про',        5000, 5000,  750, false, 4],
    ];

    for (const [name, points, price, bonus, popular, order] of plans) {
      await client.query(`
        INSERT INTO pricing_plans (name, points, price_rub, bonus_points, popular, sort_order)
        VALUES ($1,$2,$3,$4,$5,$6)
        ON CONFLICT DO NOTHING
      `, [name, points, price, bonus, popular, order]).catch(() => {});
    }

    console.log('✅ Default data seeded');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    client.release();
  }
};
