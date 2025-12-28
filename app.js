const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const app = express();

// 加载环境变量
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// 输出启动信息
console.log('正在启动后端服务器...');
console.log(`当前环境: ${process.env.NODE_ENV || 'development'}`);

// 中间件配置
console.log('配置中间件...');
app.use(cors());
app.use(express.json());

// 配置静态文件服务
console.log('配置静态文件服务...');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// 添加静态文件服务以提供管理页面
app.use(express.static(path.join(__dirname)));
console.log(`uploads目录路径: ${path.join(__dirname, 'uploads')}`);
console.log(`静态文件目录路径: ${path.join(__dirname)}`);

// 路由导入和配置
console.log('加载路由...');
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blog');
// const userRoutes = require('./routes/user'); // 临时注释掉，因为文件不存在

// 路由使用
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
// app.use('/api/users', userRoutes); // 临时注释掉，因为文件不存在

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('全局错误捕获:', err);
  
  // 专门处理multer上传错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: '文件大小超过限制 (最大5MB)' });
  }
  if (err.code === 'UNSUPPORTED_FILE_TYPE') {
    return res.status(415).json({ message: '不支持的文件类型，只允许图片文件' });
  }
  if (err.code === 'ENOENT') {
    return res.status(500).json({ message: '文件上传路径错误，请检查服务器配置' });
  }
  
  // 其他错误
  res.status(500).json({
    message: err.message || '服务器内部错误',
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
});

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '服务器运行正常' });
});

// 管理页面路由
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ message: '请求的资源不存在' });
});

// 启动服务器
const PORT = process.env.PORT || 5000;

// 临时跳过数据库连接，直接启动服务器以便测试
// 在实际环境中，应该先连接数据库再启动服务器
app.listen(PORT, () => {
  console.log(`服务器已成功启动，监听端口 ${PORT}`);
  console.log(`健康检查地址: http://localhost:${PORT}/health`);
  console.log(`文件上传API地址: http://localhost:${PORT}/api/blogs/upload`);
  console.log(`管理页面地址: http://localhost:${PORT}/admin`);
  console.log(`注意: 当前模式为测试模式，数据库连接已暂时跳过`);
});