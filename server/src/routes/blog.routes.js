const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const verifyToken = require('../middleware/auth');
const { upload } = require('../services/upload.service');

// Public
router.get('/', blogController.getAllBlogs);
router.get('/:slug', blogController.getBlogBySlug);

// Protected
router.post('/', verifyToken, upload.fields([
    { name: 'banner_image', maxCount: 1 },
    { name: 'podcast_audio', maxCount: 1 },
    { name: 'author_image', maxCount: 1 }
]), blogController.createBlog);

router.post('/update/:id', verifyToken, upload.fields([
    { name: 'banner_image', maxCount: 1 },
    { name: 'podcast_audio', maxCount: 1 },
    { name: 'author_image', maxCount: 1 }
]), blogController.updateBlog);

router.delete('/:id', verifyToken, blogController.deleteBlog);

// Generic Upload Route (for progress bars)
router.post('/upload', verifyToken, upload.single('file'), blogController.uploadFile);

router.post('/:id/like', blogController.incrementLikes);

module.exports = router;
