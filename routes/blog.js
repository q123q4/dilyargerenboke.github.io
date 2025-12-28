const express = require('express');
const router = express.Router();

// 引入控制器
const { getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog, getAllCategories, uploadImage, getPopularBlogs } = require('../controllers/blog');

// 引入中间件
const authMiddleware = require('../middleware/auth');
// 修改为使用middlewares/upload.js
const upload = require('../middlewares/upload');

// 路由
router.get('/', authMiddleware.verifyToken, getAllBlogs);
router.get('/categories', authMiddleware.verifyToken, getAllCategories);
router.get('/popular', authMiddleware.verifyToken, getPopularBlogs);
router.get('/:id', authMiddleware.verifyToken, getBlogById);

// 需要认证的路由
router.post('/', authMiddleware.verifyToken, upload.single('image'), upload.handleMulterError, createBlog);
router.put('/:id', authMiddleware.verifyToken, upload.single('image'), upload.handleMulterError, updateBlog);
router.post('/upload', authMiddleware.verifyToken, upload.single('image'), upload.handleMulterError, uploadImage);
router.delete('/:id', authMiddleware.verifyToken, deleteBlog);

module.exports = router;