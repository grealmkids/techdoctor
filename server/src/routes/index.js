const express = require('express');
const router = express.Router();

// Register Routes
router.use('/blogs', require('./blog.routes'));
router.use('/categories', require('./category.routes'));

router.get('/status', (req, res) => {
    res.json({ message: 'API is working' });
});

module.exports = router;
