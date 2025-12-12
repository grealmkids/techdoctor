const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const verifyToken = require('../middleware/auth');

// Public
router.get('/', categoryController.getAllCategories);

// Protected
router.post('/', verifyToken, categoryController.createCategory);

module.exports = router;
