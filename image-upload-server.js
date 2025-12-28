const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 确保uploads目录存在
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`创建uploads目录: ${uploadsDir}`);
}

// 中间件配置
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Multer存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('文件保存目录:', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    const fileName = uniqueName + fileExt;
    console.log(`生成文件名: ${fileName} (原始名称: ${file.originalname})`);
    cb(null, fileName);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  console.log(`检查文件类型: ${file.mimetype}`);
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log('文件类型验证通过');
    cb(null, true);
  } else {
    console.log('文件类型验证失败');
    const error = new Error('不支持的文件类型');
    error.code = 'UNSUPPORTED_FILE_TYPE';
    cb(error, false);
  }
};

// 创建multer实例
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: fileFilter
});

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: '测试服务器运行正常',
    uploadsPath: uploadsDir
  });
});

// 简单的图片上传路由
app.post('/api/upload-image', (req, res, next) => {
  console.log('收到图片上传请求');
  
  upload.single('image')(req, res, (err) => {
    console.log('Multer文件处理完成');
    
    if (err) {
      console.error('上传错误:', err);
      
      // 处理不同类型的错误
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: '文件大小超过限制 (最大5MB)',
          error: err.message
        });
      }
      
      if (err.code === 'UNSUPPORTED_FILE_TYPE') {
        return res.status(415).json({
          success: false,
          message: '不支持的文件类型，只允许图片文件 (JPG, JPEG, PNG, GIF, WebP)',
          error: err.message
        });
      }
      
      if (err.code === 'ENOENT') {
        return res.status(500).json({
          success: false,
          message: '文件上传路径错误，请检查服务器配置',
          error: err.message
        });
      }
      
      // 处理没有文件的情况
      if (err.message === 'Unexpected field') {
        return res.status(400).json({
          success: false,
          message: '请求中没有找到image字段的文件',
          error: err.message
        });
      }
      
      // 其他错误
      return res.status(500).json({
        success: false,
        message: '文件上传失败',
        error: err.message
      });
    }
    
    // 检查文件是否存在
    if (!req.file) {
      console.error('没有找到上传的文件');
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片文件'
      });
    }
    
    // 文件上传成功
    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    console.log('图片上传成功:', imageUrl);
    
    res.status(200).json({
      success: true,
      message: '图片上传成功',
      data: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: imageUrl
      }
    });
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('全局错误捕获:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: err.message
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`=====================================`);
  console.log(`测试上传服务器已启动`);
  console.log(`监听端口: ${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
  console.log(`上传接口: http://localhost:${PORT}/api/upload-image`);
  console.log(`静态文件: http://localhost:${PORT}/uploads/`);
  console.log(`=====================================`);
});
