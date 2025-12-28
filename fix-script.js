// 修复博客发布功能
const fixBlogSystem = () => {
    // 添加filterBlogs函数
    window.filterBlogs = function(category) {
        let filteredBlogs = window.blogData;
        if (category !== 'all') {
            filteredBlogs = window.blogData.filter(blog => blog.category === category);
        }
        
        // 根据排序选择排序方式
        const sortType = document.getElementById('sortBy').value;
        if (sortType === 'popular') {
            filteredBlogs.sort((a, b) => b.likes - a.likes);
        } else {
            // 默认为按日期排序
            filteredBlogs.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        
        window.renderBlogs(filteredBlogs);
    };
    
    // 添加分类按钮事件
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.category-btn').forEach(b => {
                b.classList.remove('active', 'bg-primary', 'text-white');
                b.classList.add('bg-gray-100', 'hover:bg-gray-200');
            });
            this.classList.add('active', 'bg-primary', 'text-white');
            this.classList.remove('bg-gray-100', 'hover:bg-gray-200');
            
            const category = this.dataset.category;
            window.filterBlogs(category);
        });
    });
    
    // 添加排序事件
    document.getElementById('sortBy').addEventListener('change', function() {
        const activeCategory = document.querySelector('.category-btn.active').dataset.category;
        window.filterBlogs(activeCategory);
    });
    
    // 修复关闭登录模态框函数
    window.closeLoginModal = function() {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('loginModal').classList.remove('flex');
    };
    
    // 修复博客表单提交
    const blogForm = document.getElementById('blogForm');
    if (blogForm) {
        // 移除可能存在的旧事件监听
        const newBlogForm = blogForm.cloneNode(true);
        blogForm.parentNode.replaceChild(newBlogForm, blogForm);
        
        newBlogForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('blogTitle').value;
            const category = document.getElementById('blogCategory').value;
            const content = document.getElementById('blogContent').value;
            const blogImage = document.getElementById('blogImage');
            
            // 验证表单
            if (!title || !category || !content) {
                window.showToast('请填写完整的博客信息！', 'error');
                return;
            }
            
            // 处理图片
            let imagePath = '';
            if (blogImage.files && blogImage.files[0]) {
                // 获取预览图片的src
                const previewImg = document.getElementById('newCurrentImage');
                if (previewImg && previewImg.src) {
                    imagePath = previewImg.src;
                }
            }
            
            // 创建新博客
            const newBlog = {
                id: Date.now(),
                title: title,
                category: category,
                content: content,
                image: imagePath,
                date: new Date().toISOString().split('T')[0],
                author: window.currentUserName || 'dilyar',
                likes: 0
            };
            
            // 添加到数据中
            window.blogData.unshift(newBlog);
            
            // 保存数据
            window.saveData();
            
            // 重新渲染博客列表
            const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'all';
            window.filterBlogs(activeCategory);
            
            // 清空表单
            this.reset();
            
            // 隐藏写博客区域
            document.getElementById('write').classList.add('hidden');
            
            // 显示成功消息
            window.showToast('博客发布成功！', 'success');
        });
    }
};

// 等待页面加载完成后执行修复
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixBlogSystem);
} else {
    fixBlogSystem();
}
