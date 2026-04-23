import pool from '../db';

export const createTables = async () => {
  const client = await pool.connect();
  
  try {
    // Users table
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

    // Model coefficients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS model_coefficients (
        slug VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        vendor VARCHAR(255) NOT NULL,
        type VARCHAR(20) NOT NULL,
        base_price_usd DECIMAL(10, 4) NOT NULL,
        coefficient DECIMAL(5, 2) DEFAULT 1.5,
        enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Generations log table
    await client.query(`
      CREATE TABLE IF NOT EXISTS generations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        model_slug VARCHAR(100) REFERENCES model_coefficients(slug),
        points_spent INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'running',
        prompt TEXT,
        result_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payments table
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

    // Settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Visits tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ip_address VARCHAR(45),
        user_agent TEXT,
        page_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ All tables created successfully');
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
    // Insert default admin user
    const bcrypt = require('bcryptjs');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@imagination.ai';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    
    await client.query(`
      INSERT INTO users (email, password_hash, name, is_admin, points_balance, status)
      VALUES ($1, $2, 'Admin', TRUE, 10000, 'active')
      ON CONFLICT (email) DO NOTHING
    `, [adminEmail, passwordHash]);

    // Insert default model coefficients
    const models = [
      { slug: 'midjourney-v7', name: 'Midjourney v7', vendor: 'Midjourney', type: 'image', basePriceUsd: 0.08 },
      { slug: 'flux-pro', name: 'Flux Pro', vendor: 'Black Forest Labs', type: 'image', basePriceUsd: 0.05 },
      { slug: 'dalle-3', name: 'DALL·E 3', vendor: 'OpenAI', type: 'image', basePriceUsd: 0.04 },
      { slug: 'stable-diffusion-3', name: 'Stable Diffusion 3', vendor: 'Stability AI', type: 'image', basePriceUsd: 0.02 },
      { slug: 'sora', name: 'Sora', vendor: 'OpenAI', type: 'video', basePriceUsd: 0.50 },
      { slug: 'kling-1-6', name: 'Kling 1.6', vendor: 'Kuaishou', type: 'video', basePriceUsd: 0.35 },
      { slug: 'runway-gen3', name: 'Runway Gen-3', vendor: 'Runway', type: 'video', basePriceUsd: 0.40 },
      { slug: 'luma-dream', name: 'Luma Dream', vendor: 'Luma Labs', type: 'video', basePriceUsd: 0.30 },
    ];

    for (const model of models) {
      await client.query(`
        INSERT INTO model_coefficients (slug, name, vendor, type, base_price_usd, coefficient, enabled)
        VALUES ($1, $2, $3, $4, $5, 1.5, TRUE)
        ON CONFLICT (slug) DO UPDATE SET 
          name = EXCLUDED.name,
          vendor = EXCLUDED.vendor,
          type = EXCLUDED.type,
          base_price_usd = EXCLUDED.base_price_usd
      `, [model.slug, model.name, model.vendor, model.type, model.basePriceUsd]);
    }

    // Insert default settings
    const settings = [
      { key: 'pointToRubRate', value: '1' },
      { key: 'signupBonusPoints', value: '50' },
      { key: 'minTopUpPoints', value: '100' },
      { key: 'polzaApiBaseUrl', value: process.env.POLZA_API_BASE_URL || 'https://api.polza.ai/v1' },
    ];

    for (const setting of settings) {
      await client.query(`
        INSERT INTO settings (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `, [setting.key, setting.value]);
    }

    console.log('✅ Default data seeded successfully');
    console.log(`📧 Admin user created: ${adminEmail}`);
    console.log(`🔑 Admin password: ${process.env.ADMIN_PASSWORD || 'Admin123!'}`);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    client.release();
  }
};
