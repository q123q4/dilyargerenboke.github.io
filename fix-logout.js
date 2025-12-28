// 修复登录模态框关闭函数
function closeLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    
    if (loginModal) {
        loginModal.classList.add('hidden');
        loginModal.classList.remove('flex');
    }
    if (loginForm) {
        loginForm.reset();
    }
    if (loginError) {
        loginError.classList.add('hidden');
    }
}

// 退出登录功能
function logout() {
    // 清除登录状态变量
    window.isLoggedIn = false;
    window.currentUserId = null;
    window.currentUserName = null;
    
    // 清除localStorage中的登录信息
    localStorage.removeItem('blogUserLoggedIn');
    localStorage.removeItem('blogUserId');
    localStorage.removeItem('blogUserName');
    
    // 更新UI
    updateLoginUI();
    
    // 关闭管理面板
    const adminModal = document.getElementById('adminModal');
    if (adminModal) {
        adminModal.classList.add('hidden');
        adminModal.classList.remove('flex');
    }
    
    // 显示成功提示
    showToast('退出登录成功！', 'success');
}

// DOMContentLoaded事件监听
document.addEventListener('DOMContentLoaded', () => {
    // 获取退出登录按钮
    const logoutBtn = document.getElementById('logoutBtn');
    
    // 添加点击事件监听
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // 确保updateLoginUI函数可以访问
    if (typeof window.updateLoginUI !== 'function') {
        // 如果updateLoginUI未定义，提供一个基本实现
        window.updateLoginUI = function() {
            const loginBtn = document.getElementById('loginBtn');
            const mobileLoginBtn = document.getElementById('mobileLoginBtn');
            const writeSection = document.getElementById('write');
            
            if (window.isLoggedIn) {
                if (loginBtn) {
                    loginBtn.innerHTML = `<i class="fa fa-user-circle"></i> ${window.currentUserName || '已登录'}`;
                    loginBtn.onclick = function() {
                        const adminModal = document.getElementById('adminModal');
                        if (adminModal) {
                            adminModal.classList.remove('hidden');
                            adminModal.classList.add('flex');
                        }
                    };
                }
                if (mobileLoginBtn) {
                    mobileLoginBtn.innerHTML = `<i class="fa fa-user-circle"></i> ${window.currentUserName || '已登录'}`;
                    mobileLoginBtn.onclick = function() {
                        const adminModal = document.getElementById('adminModal');
                        if (adminModal) {
                            adminModal.classList.remove('hidden');
                            adminModal.classList.add('flex');
                        }
                        const mobileMenu = document.getElementById('mobileMenu');
                        if (mobileMenu) {
                            mobileMenu.classList.add('hidden');
                        }
                    };
                }
                if (writeSection) {
                    writeSection.classList.remove('hidden');
                }
            } else {
                if (loginBtn) {
                    loginBtn.innerHTML = '登录';
                    loginBtn.onclick = function() {
                        const loginModal = document.getElementById('loginModal');
                        if (loginModal) {
                            loginModal.classList.remove('hidden');
                            loginModal.classList.add('flex');
                        }
                    };
                }
                if (mobileLoginBtn) {
                    mobileLoginBtn.innerHTML = '登录';
                    mobileLoginBtn.onclick = function() {
                        const loginModal = document.getElementById('loginModal');
                        if (loginModal) {
                            loginModal.classList.remove('hidden');
                            loginModal.classList.add('flex');
                        }
                        const mobileMenu = document.getElementById('mobileMenu');
                        if (mobileMenu) {
                            mobileMenu.classList.add('hidden');
                        }
                    };
                }
                if (writeSection) {
                    writeSection.classList.add('hidden');
                }
            }
        };
    }
    
    // 确保showToast函数可以访问
    if (typeof window.showToast !== 'function') {
        // 如果showToast未定义，提供一个基本实现
        window.showToast = function(message, type = 'info') {
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toastMessage');
            const toastIcon = document.getElementById('toastIcon');
            
            if (!toast || !toastMessage || !toastIcon) {
                console.log(message);
                return;
            }
            
            toastMessage.textContent = message;
            
            // 设置图标
            if (type === 'success') {
                toastIcon.className = 'fa fa-check-circle text-green-400';
                toast.classList.add('bg-green-50', 'text-green-800', 'border-l-4', 'border-green-400');
            } else if (type === 'error') {
                toastIcon.className = 'fa fa-exclamation-circle text-red-400';
                toast.classList.add('bg-red-50', 'text-red-800', 'border-l-4', 'border-red-400');
            } else {
                toastIcon.className = 'fa fa-info-circle text-blue-400';
                toast.classList.add('bg-blue-50', 'text-blue-800', 'border-l-4', 'border-blue-400');
            }
            
            // 显示toast
            toast.classList.remove('translate-x-full');
            toast.classList.add('translate-x-0');
            
            // 3秒后自动隐藏
            setTimeout(() => {
                toast.classList.remove('translate-x-0');
                toast.classList.add('translate-x-full');
                
                // 清除样式
                setTimeout(() => {
                    toast.classList.remove('bg-green-50', 'text-green-800', 'border-l-4', 'border-green-400',
                                        'bg-red-50', 'text-red-800', 'border-l-4', 'border-red-400',
                                        'bg-blue-50', 'text-blue-800', 'border-l-4', 'border-blue-400');
                }, 300);
            }, 3000);
        };
    }
});
