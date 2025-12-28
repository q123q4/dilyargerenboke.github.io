const jwt = require('jsonwebtoken');

// 认证中间件
exports.auth = (req, res, next) => {
  // 从请求头获取token
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
  
  // 检查token是否存在
  if (!token) {
    return res.status(401).json({ message: '没有认证令牌，访问被拒绝' });
  }
  
  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    
    // 将用户信息存储到请求对象中
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: '无效的令牌，访问被拒绝' });
  }
};

// 管理员权限中间件
exports.admin = (req, res, next) => {
  // 首先检查是否已认证
  if (!req.user) {
    return res.status(401).json({ message: '没有认证令牌，访问被拒绝' });
  }
  
  // 检查是否为管理员
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: '权限不足，需要管理员权限' });
  }
  
  next();
};
