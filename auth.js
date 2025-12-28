const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authController = {
  // 注册新用户
  register: async (req, res) => {
    try {
      const { username, password, email } = req.body;
      
      // 检查用户名是否已存在
      const userExists = await User.findOne({ username });
      if (userExists) {
        return res.status(400).json({ message: '用户名已被使用' });
      }
      
      // 检查邮箱是否已存在
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: '邮箱已被使用' });
      }
      
      // 创建新用户
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser = new User({
        username,
        password: hashedPassword,
        email,
        isAdmin: false // 默认不是管理员
      });
      
      await newUser.save();
      
      // 生成token
      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin, username: newUser.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.status(201).json({
        message: '注册成功',
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          isAdmin: newUser.isAdmin
        },
        token
      });
    } catch (error) {
      console.error('注册失败:', error);
      res.status(500).json({ message: '注册失败', error: error.message });
    }
  },
  
  // 用户登录
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // 查找用户
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: '用户名或密码错误' });
      }
      
      // 验证密码
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: '用户名或密码错误' });
      }
      
      // 生成token
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        message: '登录成功',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin
        },
        token
      });
    } catch (error) {
      console.error('登录失败:', error);
      res.status(500).json({ message: '登录失败', error: error.message });
    }
  },
  
  // 获取当前用户信息
  getCurrentUser: async (req, res) => {
    try {
      // 从请求头中获取token
      const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.token;
      
      if (!token) {
        return res.status(401).json({ message: '未提供认证令牌' });
      }
      
      // 验证token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 查找用户
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }
      
      res.json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      res.status(401).json({ message: '无效的认证令牌', error: error.message });
    }
  }
};

module.exports = authController;