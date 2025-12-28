const http = require('http');
const fs = require('fs');
const path = require('path');

// 服务器配置
const serverHost = 'localhost';
const serverPort = 3001;
const uploadEndpoint = '/api/upload-image';

// 测试图片配置
const testImagePath = path.join(__dirname, 'test-upload-image.png');
const testImageContent = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

// 生成测试图片
function generateTestImage() {
  try {
    fs.writeFileSync(testImagePath, testImageContent);
    console.log(`已创建测试图片: ${testImagePath}`);
    return true;
  } catch (error) {
    console.error('创建测试图片失败:', error.message);
    return false;
  }
}

// 清理测试文件
function cleanupTestFiles() {
  try {
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('已清理测试图片文件');
    }
  } catch (error) {
    console.error('清理测试文件失败:', error.message);
  }
}

// 构建multipart/form-data请求
function buildMultipartRequest(filePath) {
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const fileContent = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  
  const bodyParts = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="image"; filename="' + fileName + '"',
    'Content-Type: image/png',
    '',
    '',  // 空行分隔头和内容
  ];
  
  // 将所有部分和文件内容组合成完整的请求体
  const body = Buffer.concat([
    Buffer.from(bodyParts.join('\r\n')),
    fileContent,
    Buffer.from('\r\n--' + boundary + '--\r\n')
  ]);
  
  return {
    boundary,
    body
  };
}

// 发送图片上传请求
function uploadImage() {
  console.log('开始上传测试图片...');
  
  const { boundary, body } = buildMultipartRequest(testImagePath);
  
  const options = {
    hostname: serverHost,
    port: serverPort,
    path: uploadEndpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': body.length
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`响应状态码: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        console.log('上传结果:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('响应内容:', responseData);
      }
      
      // 无论成功失败都清理测试文件
      cleanupTestFiles();
    });
  });
  
  req.on('error', (error) => {
    console.error('请求错误:', error.message);
    cleanupTestFiles();
  });
  
  // 发送请求体
  req.write(body);
  req.end();
}

// 测试健康检查接口
function testHealthCheck() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: serverHost,
      port: serverPort,
      path: '/health',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const healthData = JSON.parse(data);
          console.log('健康检查响应:', healthData);
          resolve(healthData.status === 'ok');
        } catch (e) {
          console.error('健康检查响应解析失败:', e.message);
          reject(e);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('健康检查请求失败:', error.message);
      reject(error);
    });
    
    req.end();
  });
}

// 主测试函数
async function runTest() {
  console.log('=====================================');
  console.log('开始测试图片上传功能');
  console.log('=====================================');
  
  try {
    // 1. 测试健康检查
    console.log('\n1. 测试服务器健康状态...');
    const isHealthy = await testHealthCheck();
    
    if (!isHealthy) {
      console.error('服务器健康检查失败，请检查服务器是否正常运行');
      return;
    }
    
    // 2. 生成测试图片
    console.log('\n2. 生成测试图片...');
    if (!generateTestImage()) {
      return;
    }
    
    // 3. 上传图片
    console.log('\n3. 执行图片上传测试...');
    uploadImage();
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
    cleanupTestFiles();
  }
}

// 运行测试
runTest();
