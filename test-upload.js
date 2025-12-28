const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// 测试上传功能
async function testUpload() {
  try {
    // 首先登录获取token
    console.log('1. 获取认证token...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com', // 替换为有效的测试账号
      password: 'password123' // 替换为有效的密码
    });
    
    const token = loginResponse.data.token;
    console.log('✓ 获取token成功');
    
    // 创建一个测试图片文件（如果不存在）
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    if (!fs.existsSync(testImagePath)) {
      console.log('2. 创建测试图片文件...');
      // 创建一个1x1像素的空白图片（实际使用时应该使用真实的测试图片）
      const buffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9]);
      fs.writeFileSync(testImagePath, buffer);
      console.log('✓ 创建测试图片成功');
    }
    
    // 创建FormData
    console.log('3. 准备上传数据...');
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath));
    
    console.log('4. 发送上传请求...');
    const uploadResponse = await axios.post('http://localhost:5000/api/blogs/upload', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });
    
    console.log('✓ 上传成功!');
    console.log('上传结果:', uploadResponse.data);
    
    // 清理测试文件
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('✓ 清理测试文件完成');
    }
    
  } catch (error) {
    console.error('✗ 测试失败:', error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误响应:', error.response.data);
    }
    
    // 清理测试文件
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  }
}

// 运行测试
testUpload();
