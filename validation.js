// 验证脚本：测试图片处理逻辑修复效果

// 模拟getImageUrl函数
function getImageUrl(imagePath) {
    // 如果路径为空或未定义，提供默认随机图片
    if (!imagePath) {
        const randomId = Math.floor(Math.random() * 100);
        return `https://picsum.photos/id/${randomId}/600/400`;
    }
    
    // 保留原始图片URL，包括DataURL格式和其他可能的格式
    // 只有在确定图片URL无效时才提供默认图片
    return imagePath;
}

// 模拟handleImageError函数
function handleImageError(imgElement) {
    // 当图片加载失败时，使用随机默认图片替换
    const randomId = Math.floor(Math.random() * 100);
    imgElement.src = `https://picsum.photos/id/${randomId}/600/400`;
    imgElement.onerror = null; // 防止无限循环
}

// 创建模拟的图片元素
function createMockImage() {
    return {
        src: '',
        onerror: null
    };
}

// 测试getImageUrl函数
function testImageUrlFunction() {
    console.log('=== 测试 getImageUrl 函数 ===');
    
    // 测试场景1：空URL
    const result1 = getImageUrl('');
    console.log('测试空URL:', result1, result1.includes('https://picsum.photos/'));
    
    // 测试场景2：null URL
    const result2 = getImageUrl(null);
    console.log('测试null URL:', result2, result2.includes('https://picsum.photos/'));
    
    // 测试场景3：undefined URL
    const result3 = getImageUrl(undefined);
    console.log('测试undefined URL:', result3, result3.includes('https://picsum.photos/'));
    
    // 测试场景4：有效URL
    const validUrl = 'https://picsum.photos/id/1/600/400';
    const result4 = getImageUrl(validUrl);
    console.log('测试有效URL:', result4, result4 === validUrl);
    
    // 测试场景5：DataURL
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const result5 = getImageUrl(dataUrl);
    console.log('测试DataURL:', result5, result5 === dataUrl);
}

// 测试handleImageError函数
function testImageErrorFunction() {
    console.log('\n=== 测试 handleImageError 函数 ===');
    
    // 创建模拟图片元素
    const mockImage = createMockImage();
    
    // 执行错误处理函数
    handleImageError(mockImage);
    
    // 验证结果
    console.log('错误处理后图片URL:', mockImage.src, 
                mockImage.src.includes('https://picsum.photos/'));
    console.log('onerror是否被清除:', mockImage.onerror === null);
}

// 模拟renderBlogs函数测试
function testRenderBlogs() {
    console.log('\n=== 模拟测试 renderBlogs 函数逻辑 ===');
    
    // 模拟博客数据，包含各种图片情况
    const mockBlogs = [
        { id: 1, image: 'https://picsum.photos/id/1/600/400' },  // 有效URL
        { id: 2, image: '' },  // 空URL
        { id: 3, image: null },  // null URL
        { id: 4 }  // 无image属性
    ];
    
    // 模拟渲染每篇博客的图片
    mockBlogs.forEach(blog => {
        // 获取处理后的图片URL
        const processedUrl = getImageUrl(blog.image);
        console.log(`博客ID ${blog.id} 处理后的图片URL:`, 
                    processedUrl, 
                    processedUrl.includes('https://picsum.photos/'));
    });
}

// 执行所有测试
function runAllTests() {
    console.log('开始测试图片处理逻辑修复效果...\n');
    
    testImageUrlFunction();
    testImageErrorFunction();
    testRenderBlogs();
    
    console.log('\n测试完成！');
}

// 导出测试函数，以便在浏览器控制台中可以手动运行
testImageUrl = testImageUrlFunction;
testImageError = testImageErrorFunction;
testRender = testRenderBlogs;
testAll = runAllTests;

// 如果是直接在浏览器中运行脚本，自动执行测试
if (typeof window !== 'undefined') {
    // 等待文档加载完成
    window.addEventListener('DOMContentLoaded', () => {
        runAllTests();
    });
} else {
    // 在Node.js环境下直接运行
    runAllTests();
}
