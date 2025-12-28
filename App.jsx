import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BlogDetailPage from './pages/BlogDetailPage';
import CategoryPage from './pages/CategoryPage';
import './styles/global.css';

// 404页面组件
function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <h2>404 - 页面未找到</h2>
      <p>抱歉，您访问的页面不存在</p>
      <Link to="/">返回首页</Link>
    </div>
  );
}

function App() {
  // 检查登录状态
  const isLoggedIn = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const username = localStorage.getItem('username') || '';
  
  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="App">
        {/* 导航栏 */}
        <header style={{
          backgroundColor: '#fff',
          padding: '1rem 2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>
            <h1 style={{ 
              margin: 0, 
              fontFamily: 'var(--font-cursive)',
              fontSize: '1.8rem',
              color: 'var(--primary-color)'
            }}>
              博客网站
            </h1>
          </Link>
          
          <nav>
            <ul style={{
              display: 'flex',
              listStyle: 'none',
              gap: '1.5rem',
              margin: 0,
              padding: 0
            }}>
              <li>
                <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>首页</Link>
              </li>
              <li>
                <Link to="/category/技术" style={{ textDecoration: 'none', color: '#333' }}>技术</Link>
              </li>
              <li>
                <Link to="/category/生活" style={{ textDecoration: 'none', color: '#333' }}>生活</Link>
              </li>
              <li>
                <Link to="/category/旅行" style={{ textDecoration: 'none', color: '#333' }}>旅行</Link>
              </li>
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                      <li>
                        <Link to="/dashboard" style={{ 
                          textDecoration: 'none', 
                          color: 'var(--primary-color)',
                          fontWeight: 'bold'
                        }}>管理后台</Link>
                      </li>
                    )}
                  <li>
                    <button 
                      onClick={handleLogout}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#333',
                        padding: '0',
                        fontSize: '1rem'
                      }}
                    >
                      登出
                    </button>
                  </li>
                  <li style={{ color: '#666', fontSize: '0.9rem' }}>
                    欢迎, {username}
                  </li>
                </>
              ) : (
                <li>
                  <Link to="/login" style={{ 
                    textDecoration: 'none', 
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--border-radius)'
                  }}>登录</Link>
                </li>
              )}
            </ul>
          </nav>
        </header>

        {/* 主要内容 */}
        <main style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem'
        }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog/:id" element={<BlogDetailPage />} />
            <Route path="/category/:name" element={<CategoryPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* 页脚 */}
        <footer style={{
          backgroundColor: '#f9f9f9',
          padding: '2rem',
          textAlign: 'center',
          marginTop: '4rem',
          color: '#666'
        }}>
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} 博客网站. 保留所有权利.
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;