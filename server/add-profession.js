const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function updateDB() {
    try {
        console.log('🔌 Connecting to database...');

        // Add author_profession column
        await pool.query(`
            ALTER TABLE blogs 
            ADD COLUMN IF NOT EXISTS author_profession VARCHAR(255);
        `);
        console.log('✅ Added author_profession column');

        console.log('🎉 Database update verified!');
    } catch (err) {
        console.error('❌ Error updating database:', err);
    } finally {
        await pool.end();
    }
}

updateDB();
