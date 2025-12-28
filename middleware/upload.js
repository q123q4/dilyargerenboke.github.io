const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadsDir = path.join(__dirname, '../uploads');
console.log('上传目录路径:', uploadsDir);

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('已创建上传目录:', uploadsDir);
  } else {
    console.log('上传目录已存在:', uploadsDir);
  }
} catch (error) {
  console.error('创建上传目录失败:', error.message);
}

// 配置存储引擎
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('准备存储文件:', file.originalname);
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = uniqueSuffix + path.extname(file.originalname);
    console.log('生成文件名:', fileName);
    cb(null, fileName);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  console.log('检查文件类型:', file.mimetype);
  
  // 允许的文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log('文件类型有效:', file.mimetype);
    cb(null, true);
  } else {
    const error = new Error('不支持的文件类型');
    error.code = 'UNSUPPORTED_FILE_TYPE';
    console.error('文件类型无效:', file.mimetype);
    cb(error, false);
  }
};

// 创建multer实例
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制文件大小为5MB
    files: 1 // 限制单次上传1个文件
  },
  fileFilter: fileFilter
});

// 错误处理中间件
const handleMulterError = (err, req, res, next) => {
  console.error('文件上传中间件错误:', err);
  
  // 将错误传递给全局错误处理器，而不是直接发送响应
  next(err);
};

module.exports = {
  upload,
  handleMulterError
};