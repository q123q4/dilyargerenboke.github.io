const http = require('http');
const fs = require('fs');
const path = require('path');

// 测试脚本配置
const config = {
  host: 'localhost',
  port: 5000,
  loginEndpoint: '/api/auth/login',
  uploadEndpoint: '/api/blogs/upload',
  testCredentials: {
    email: 'test@example.com', // 替换为您的测试账号
    password: 'testpassword'    // 替换为您的测试密码
  }
};

// 简单创建一个测试图片文件的函数
function createTestImage() {
  const testImagePath = path.join(__dirname, 'test-image.jpg');
  
  // 创建一个非常小的jpg文件（1x1像素的黑色图片的二进制数据）
  const smallJpgData = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0xFF, 0xDB,
    0x00, 0x43, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01, 0x00, 0x01, 0x03,
    0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xFF, 0xC4, 0x00,
    0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x0A, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x0A, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F,
    0x00, 0xFF, 0xD9
  ]);
  
  try {
    fs.writeFileSync(testImagePath, smallJpgData);
    console.log(`测试图片已创建: ${testImagePath}`);
    return testImagePath;
  } catch (error) {
    console.error('创建测试图片失败:', error);
    throw error;
  }
}

// 使用原生http模块发送POST请求的通用函数
function sendPostRequest(options, data, isJson = true) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = isJson ? JSON.parse(responseData) : responseData;
          resolve({ data: result, status: res.statusCode });
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(isJson ? JSON.stringify(data) : data);
    }
    
    req.end();
  });
}

// 登录获取token
async function login() {
  try {
    console.log('正在登录...');
    
    const options = {
      hostname: config.host,
      port: config.port,
      path: config.loginEndpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const response = await sendPostRequest(options, config.testCredentials);
    
    if (response.status !== 200) {
      throw new Error(`登录请求失败，状态码: ${response.status}`);
    }
    
    console.log('登录成功，获取到token');
    return response.data.token;
  } catch (error) {
    console.error('登录失败:', error.message);
    throw new Error('登录失败，请检查测试账号和密码是否正确');
  }
}

// 上传图片测试 - 直接上传文件内容
async function testImageUpload(token, imagePath) {
  try {
    console.log(`开始上传图片: ${imagePath}`);
    
    // 读取图片文件内容
    const imageBuffer = fs.readFileSync(imagePath);
    const boundary = '------------------------' + Math.random().toString(36).substring(2);
    
    // 创建multipart/form-data格式的请求体
    let formData = `\r\n--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="image"; filename="test-image.jpg"\r\n';
    formData += 'Content-Type: image/jpeg\r\n\r\n';
    
    // 创建Buffer数组，包括表单头、二进制图片数据和表单尾
    const formHeaderBuffer = Buffer.from(formData, 'utf8');
    const formFooterBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
    const bodyBuffer = Buffer.concat([formHeaderBuffer, imageBuffer, formFooterBuffer]);
    
    // 配置请求选项
    const options = {
      hostname: config.host,
      port: config.port,
      path: config.uploadEndpoint,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuffer.length,
        'Authorization': `Bearer ${token}`
      }
    };
    
    console.log(`发送multipart/form-data请求，边界标识: ${boundary}`);
    
    const response = await sendPostRequest(options, bodyBuffer, false);
    
    if (response.status !== 200) {
      throw new Error(`上传请求失败，状态码: ${response.status}, 响应: ${JSON.stringify(response.data)}`);
    }
    
    console.log('图片上传成功!');
    console.log('上传响应:', response.data);
    
    return response.data.imageUrl;
  } catch (error) {
    console.error('图片上传失败:', error.message);
    throw error;
  }
}

// 主测试函数
async function runTest() {
  let testImagePath = null;
  
  try {
    console.log('===== 开始图片上传测试 =====');
    
    // 步骤1: 创建测试图片
    testImagePath = createTestImage();
    
    // 步骤2: 尝试上传图片（这里假设已经有一个有效的token用于测试）
    // 注意：实际使用时需要先登录获取token
    const mockToken = 'mock-token-for-testing'; // 替换为实际的token或取消注释下面的登录代码
    // const token = await login();
    
    // 由于登录可能需要实际的账号密码，我们直接使用一个模拟的token进行测试
    // 如果服务器正常接收请求，即使token无效，也会返回401错误而不是上传功能错误
    await testImageUpload(mockToken, testImagePath);
    
    console.log('===== 测试完成! 请求已发送到服务器 =====');
    console.log('注意: 由于使用了模拟token，您需要查看服务器日志确认上传处理逻辑是否正常工作');
  } catch (error) {
    console.error('===== 测试过程中遇到错误 =====', error.message);
  } finally {
    // 清理测试文件
    if (testImagePath && fs.existsSync(testImagePath)) {
      try {
        fs.unlinkSync(testImagePath);
        console.log(`测试文件已清理: ${testImagePath}`);
      } catch (cleanupError) {
        console.error('清理测试文件失败:', cleanupError);
      }
    }
  }
}

// 运行测试
runTest();