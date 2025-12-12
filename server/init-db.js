const fs = require('fs');
const path = require('path');
const pool = require('./src/config/db');

const initDb = async () => {
    try {
        const sqlPath = path.join(__dirname, '../database/init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('⏳ Running migration...');
        await pool.query(sql);
        console.log('✅ Database initialized successfully');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await pool.end();
    }
};

initDb();
