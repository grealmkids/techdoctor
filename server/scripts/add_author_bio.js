require('dotenv').config({ path: 'server/.env' });
const pool = require('../src/config/db');

async function migrate() {
    try {
        console.log('🔄 Connecting to database...');
        const client = await pool.connect();

        console.log('📝 Adding author_bio column to blogs table...');
        await client.query(`
            ALTER TABLE blogs 
            ADD COLUMN IF NOT EXISTS author_bio TEXT;
        `);

        console.log('✅ Column added successfully!');
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
