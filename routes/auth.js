const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// 登录
router.post('/auth/login', authController.login);

// 注册
router.post('/auth/register', authController.register);

// 获取当前用户信息
router.get('/auth/me', authController.getCurrentUser);

module.exports = router;

