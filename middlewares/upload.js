const multer = require('multer');
const path = require('path');

// 确保uploads目录存在
const fs = require('fs');
const uploadDir = path.join(__dirname, '../uploads');
console.log('检查uploads目录:', uploadDir);
if (!fs.existsSync(uploadDir)) {
  console.log('创建uploads目录');
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(`[存储配置] 目标目录: ${uploadDir}, 文件: ${file.originalname}`);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const newFilename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log(`[存储配置] 重命名文件: ${file.originalname} -> ${newFilename}`);
    cb(null, newFilename);
  }
});

// 文件类型过滤
const fileFilter = (req, file, cb) => {
  console.log(`[文件过滤] 检查文件: ${file.originalname}, MIME类型: ${file.mimetype}`);
  // 允许的图片类型
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  
  // 检查文件类型
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  console.log(`[文件过滤] 扩展名检查: ${extname}, MIME类型检查: ${mimetype}`);
  
  if (extname && mimetype) {
    console.log(`[文件过滤] 文件 ${file.originalname} 类型验证通过`);
    return cb(null, true);
  } else {
    console.error(`[文件过滤] 文件 ${file.originalname} 类型不允许`);
    const error = new Error('只允许上传图片文件 (JPEG, JPG, PNG, GIF, WebP)');
    error.code = 'UNSUPPORTED_FILE_TYPE';
    cb(error);
  }
};

// 配置multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制文件大小为5MB
  },
  fileFilter: fileFilter
});

// 添加错误处理中间件
upload.handleMulterError = (err, req, res, next) => {
  console.error('[Multer错误处理] 错误详情:', {
    message: err.message,
    code: err.code,
    stack: err.stack
  });
  
  // 确保错误有正确的代码标识
  if (!err.code && err.message.includes('只允许上传图片文件')) {
    err.code = 'UNSUPPORTED_FILE_TYPE';
  }
  
  next(err); // 将错误传递给全局错误处理器
};

console.log('multer上传中间件配置完成');
module.exports = upload;