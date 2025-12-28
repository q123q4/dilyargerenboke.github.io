const http = require('http');
const fs = require('fs');
const path = require('path');

// 静态文件目录
const frontendDir = path.resolve(__dirname, '../frontend/dist');

// 模拟博客数据
const mockBlogs = [
  {
    id: '1',
    title: '欢迎来到我的博客',
    content: '这是我的第一篇博客文章，很高兴能在这里分享我的想法和经验。',
    category: '生活',
    image: '/images/blog1.jpg',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString()
  },
  {
    id: '2',
    title: '技术分享：React入门指南',
    content: 'React是一个用于构建用户界面的JavaScript库。本文将带你了解React的基础知识。',
    category: '技术',
    image: '/images/blog2.jpg',
    createdAt: new Date('2024-01-02').toISOString(),
    updatedAt: new Date('2024-01-02').toISOString()
  },
  {
    id: '3',
    title: '旅行见闻：探索自然之美',
    content: '最近的一次旅行让我深深感受到了大自然的神奇和美丽。',
    category: '旅行',
    image: '/images/blog3.jpg',
    createdAt: new Date('2024-01-03').toISOString(),
    updatedAt: new Date('2024-01-03').toISOString()
  }
];

// 模拟分类数据
const mockCategories = ['全部', '生活', '技术', '旅行'];

// 处理请求的函数
function handleRequest(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // API路由处理
  if (req.url.startsWith('/api')) {
    // 处理博客相关API
    if (req.url.startsWith('/api/blogs')) {
      // 获取博客列表
      if (req.method === 'GET' && req.url === '/api/blogs') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: mockBlogs }));
        return;
      }
      
      // 获取单个博客详情
      if (req.method === 'GET' && req.url.match(/\/api\/blogs\/[^/]+$/)) {
        const blogId = req.url.split('/').pop();
        const blog = mockBlogs.find(b => b.id === blogId);
        if (blog) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, data: blog }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Blog not found' }));
        }
        return;
      }
    }
    
    // 处理分类相关API
    if (req.method === 'GET' && req.url === '/api/categories') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: mockCategories }));
      return;
    }
    
    // 处理认证相关API
    if (req.url.startsWith('/api/auth')) {
      // 模拟登录
      if (req.method === 'POST' && req.url === '/api/auth/login') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const credentials = JSON.parse(body);
            // 模拟管理员登录逻辑（用户名和密码都是admin）
            if (credentials.username === 'admin' && credentials.password === 'admin') {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                token: 'mock-jwt-token',
                user: { id: '1', username: 'admin', isAdmin: true }
              }));
            } else {
              res.writeHead(401, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, message: 'Invalid credentials' }));
            }
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Invalid request body' }));
          }
        });
        return;
      }
      
      // 模拟获取当前用户信息
      if (req.method === 'GET' && req.url === '/api/auth/me') {
        // 检查是否有token头（简化处理）
        const token = req.headers.authorization;
        if (token) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            data: { id: '1', username: 'admin', isAdmin: true }
          }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Not authenticated' }));
        }
        return;
      }
    }
    
    // API端点未找到
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'API endpoint not found' }));
    return;
  }
  
  // 静态文件服务
  let filePath = path.join(frontendDir, req.url === '/' ? 'index.html' : req.url);
  
  // 检查文件是否存在
  fs.exists(filePath, exists => {
    if (exists) {
      // 确定MIME类型
      const extname = path.extname(filePath);
      let contentType = 'text/html';
      
      switch (extname) {
        case '.js':
          contentType = 'text/javascript';
          break;
        case '.css':
          contentType = 'text/css';
          break;
        case '.json':
          contentType = 'application/json';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
        case '.gif':
          contentType = 'image/gif';
          break;
        case '.svg':
          contentType = 'image/svg+xml';
          break;
      }
      
      // 读取并发送文件
      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    } else {
      // 如果文件不存在，尝试发送index.html（支持前端路由）
      fs.readFile(path.join(frontendDir, 'index.html'), (err, content) => {
        if (err) {
          res.writeHead(404);
          res.end('404 Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        }
      });
    }
  });
}

// 创建HTTP服务器
const server = http.createServer(handleRequest);

// 启动服务器
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
