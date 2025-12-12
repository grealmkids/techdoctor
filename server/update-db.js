const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const updateSchema = async () => {
    try {
        // 1. Create Categories Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Created categories table');

        // 2. Add columns to Blogs Table
        // We use DO blocks or simple ALTER statements. 
        // IF NOT EXISTS for columns logic:

        await pool.query(`
      ALTER TABLE blogs 
      ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id),
      ADD COLUMN IF NOT EXISTS author_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS author_image TEXT,
      ADD COLUMN IF NOT EXISTS author_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS author_whatsapp VARCHAR(255),
      ADD COLUMN IF NOT EXISTS author_linkedin VARCHAR(255);
    `);
        console.log('✅ Added category_id and author columns to blogs table');

        // 3. Create a default category if none exists
        const catCheck = await pool.query('SELECT * FROM categories');
        if (catCheck.rows.length === 0) {
            await pool.query(`
            INSERT INTO categories (name, slug) VALUES ('General', 'general')
        `);
            console.log('✅ Created default "General" category');
        }

    } catch (err) {
        console.error('❌ Error updating schema:', err);
    } finally {
        pool.end();
    }
};

updateSchema();
