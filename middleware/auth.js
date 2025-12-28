const jwt = require('jsonwebtoken');

const authMiddleware = {
  // 验证用户是否已登录
  verifyToken: (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: '无效的认证令牌' });
    }
  },

  // 验证用户是否为管理员
  verifyAdmin: (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded.isAdmin) {
        return res.status(403).json({ message: '需要管理员权限' });
      }
      
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: '无效的认证令牌' });
    }
  }
};

module.exports = authMiddleware;
