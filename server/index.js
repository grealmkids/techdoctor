const app = require('./src/app');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Test DB Connection
        const client = await pool.connect();
        console.log('✅ Connected to PostgreSQL');
        client.release();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    }
};

startServer();
