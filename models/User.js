const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 虚拟字段：用户是否为第一个管理员
userSchema.virtual('isFirstAdmin').get(function() {
  // 这里不能直接在虚拟字段中查询数据库，这个逻辑会在控制器中处理
  return this.isAdmin && this.createdAt === new Date('2023-01-01'); // 示例日期，实际会比较创建时间
});

const User = mongoose.model('User', userSchema);

module.exports = User;
