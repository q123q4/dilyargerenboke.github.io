const fs = require('fs');
const path = require('path');

// 获取uploads目录路径
const uploadDir = path.join(__dirname, 'uploads');
console.log(`检查uploads目录: ${uploadDir}`);

// 检查目录是否存在
if (fs.existsSync(uploadDir)) {
  console.log('✅ uploads目录已存在');
  
  // 检查读写权限
  try {
    // 尝试写入一个临时文件来测试权限
    const testFile = path.join(uploadDir, 'test-permission.txt');
    fs.writeFileSync(testFile, 'This is a test file to check permissions.');
    console.log('✅ 写入权限正常');
    
    // 尝试读取文件来测试权限
    const content = fs.readFileSync(testFile, 'utf8');
    console.log('✅ 读取权限正常');
    
    // 删除测试文件
    fs.unlinkSync(testFile);
    console.log('✅ 删除权限正常');
    
    // 获取目录权限
    const stats = fs.statSync(uploadDir);
    console.log(`目录权限信息:`);
    console.log(`- 所有者可读写执行: ${stats.mode & 0o700 ? '是' : '否'}`);
    console.log(`- 组用户可读写执行: ${stats.mode & 0o070 ? '是' : '否'}`);
    console.log(`- 其他用户可读写执行: ${stats.mode & 0o007 ? '是' : '否'}`);
    
  } catch (error) {
    console.error('❌ 权限测试失败:', error.message);
  }
} else {
  console.error('❌ uploads目录不存在');
  // 尝试创建目录
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('✅ 已成功创建uploads目录');
  } catch (error) {
    console.error('❌ 创建uploads目录失败:', error.message);
  }
}
