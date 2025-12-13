const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
// Middleware
// 1. Manual CORS (The Nuclear Option - Guaranteed to work)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow ALL origins
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Intercept OPTIONS method
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// 2. Security headers (relaxed)
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

app.use(express.json());
app.use(morgan('dev'));

// Routes
const routes = require('./routes');
app.use('/api/v1', routes);

// Base route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to The Tech Doctor API' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
