        // 渲染博客列表
        function renderBlogs(blogs) {
            blogGrid.innerHTML = '';
            
            blogs.forEach(blog => {
                const blogCard = document.createElement('div');
                blogCard.className = 'blog-card bg-white rounded-xl shadow-md overflow-hidden';
                
                // 为整个卡片添加点击事件，跳转到详情页
                blogCard.addEventListener('click', function(e) {
                    // 如果点击的是按钮，不跳转
                    if (e.target.closest('button') || e.target.closest('i')) {
                        return;
                    }
                    window.location.href = 'blog-detail.html?id=' + blog.id;
                });
                
                // 处理图片URL
                const imageUrl = getImageUrl(blog.image || '');
                
                // 构建博客卡片内容
                let cardContent = `
                    <div class="relative h-48 overflow-hidden">
                        <img src="${imageUrl}" alt="${blog.title}" onerror="handleImageError(this)" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
                        <div class="absolute top-4 left-4 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                            ${blog.category}
                        </div>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold mb-2 line-clamp-2">${blog.title}</h3>
                        <p class="text-gray-600 mb-4 line-clamp-3">${blog.content}</p>
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-2 text-sm text-gray-500">
                                <span>${blog.date}</span>
                                <span>•</span>
                                <span>${blog.author}</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <button class="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1" data-id="${blog.id}">
                                    <i class="fa fa-heart-o"></i>
                                    <span>${blog.likes}</span>
                                </button>
                                <button class="text-gray-400 hover:text-primary transition-colors">
                                    <i class="fa fa-comment-o"></i>
                                </button>
                                <button class="blog-edit-btn bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-lg text-sm transition-colors" data-id="${blog.id}">
                                    <i class="fa fa-pencil"></i> 编辑
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                blogCard.innerHTML = cardContent;
                blogGrid.appendChild(blogCard);
            });
            
            // 添加点赞事件
            document.querySelectorAll('.fa-heart-o').forEach(heart => {
                heart.parentElement.addEventListener('click', function() {
                    const blogId = parseInt(this.dataset.id);
                    const blog = blogData.find(b => b.id === blogId);
                    if (blog) {
                        blog.likes += 1;
                        this.querySelector('span').textContent = blog.likes;
                        showToast('点赞成功！', 'success');
                    }
                });
            });
            
            // 添加编辑按钮事件
            document.querySelectorAll('.blog-edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    // 如果未登录，提示先登录
                    if (!isLoggedIn) {
                        showToast('请先登录后编辑博客', 'info');
                        loginBtn.click(); // 自动打开登录模态框
                        return;
                    }
                    
                    const blogId = parseInt(this.dataset.id);
                    const blog = blogData.find(b => b.id === blogId);
                    if (blog) {
                        openEditModal(blog);
                    }
                });
            });
        }
        
        // 添加图片URL处理函数，确保图片路径正确并且提供错误回退机制
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
        
        // 图片加载失败处理函数
        function handleImageError(imgElement) {
            // 当图片加载失败时，使用随机默认图片替换
            const randomId = Math.floor(Math.random() * 100);
            imgElement.src = `https://picsum.photos/id/${randomId}/600/400`;
            imgElement.onerror = null; // 防止无限循环
        }