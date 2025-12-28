// 在页面加载时检查并修复localStorage中的用户名设置
window.addEventListener('DOMContentLoaded', function() {
    // 检查并修复localStorage中的用户名
    if (localStorage.getItem('blogUserName') === '管理员') {
        localStorage.setItem('blogUserName', 'dilyar');
    }
    
    // 强制更新UI显示正确的用户名
    if (window.currentUserName === '管理员' || !window.currentUserName) {
        window.currentUserName = 'dilyar';
        // 调用updateLoginUI函数更新显示，如果存在的话
        if (typeof updateLoginUI === 'function') {
            updateLoginUI();
        } else {
            // 直接更新登录按钮文本
            const loginBtn = document.getElementById('loginBtn');
            const mobileLoginBtn = document.getElementById('mobileLoginBtn');
            if (loginBtn) {
                loginBtn.innerHTML = `<i class="fa fa-user-circle"></i> dilyar`;
            }
            if (mobileLoginBtn) {
                mobileLoginBtn.innerHTML = `<i class="fa fa-user-circle"></i> dilyar`;
            }
        }
    }
});

// 拦截localStorage的setItem方法，防止'管理员'字样被写入
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    if (key === 'blogUserName' && value === '管理员') {
        value = 'dilyar';
    }
    originalSetItem.call(this, key, value);
};
