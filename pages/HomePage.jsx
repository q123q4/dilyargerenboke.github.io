import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI, categoryAPI } from '../api/api';

function HomePage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState(['全部', '技术', '生活', '旅行']);
  const [selectedCategory, setSelectedCategory] = useState('全部');

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  // 获取所有博客
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getAllBlogs();
      setBlogs(response);
    } catch (err) {
      setError(err.message || '获取博客列表失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 获取所有分类
  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategories();
      // 添加"全部"选项
      setCategories(['全部', ...response]);
    } catch (err) {
      console.error('获取分类失败:', err);
      // 保留默认分类
    }
  };

  // 按分类筛选博客
  const filteredBlogs = selectedCategory === '全部' 
    ? blogs 
    : blogs.filter(blog => blog.category === selectedCategory);

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 截取内容摘要
  const getExcerpt = (content) => {
    const plainText = content.replace(/[\r\n]+/g, ' '); // 移除换行符
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  };

  return (
    <div className="home-container">
      <header className="hero-section">
        <h1 style={{ fontFamily: 'var(--font-cursive)' }}>dilyar的博客</h1>
        <p className="hero-subtitle">记录生活的点滴，分享技术的乐趣</p>
      </header>

      <div className="blog-header">
        <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-cursive)' }}>最新博客</h2>
        
        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                backgroundColor: selectedCategory === category ? 'var(--primary-color)' : 'var(--secondary-color)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                margin: '0.25rem',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                fontFamily: 'var(--font-sans)'
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="blog-grid">
          {filteredBlogs.length === 0 ? (
            <div className="no-blogs">暂无博客文章</div>
          ) : (
            filteredBlogs.map(blog => (
              <div className="blog-card" key={blog._id}>
                {blog.image && (
                  <div className="blog-image">
                    <Link to={`/blog/${blog._id}`}>
                      <img 
                        src={blog.image.startsWith('http') ? blog.image : `/uploads/${blog.image}`} 
                        alt={blog.title} 
                      />
                    </Link>
                  </div>
                )}
                
                <div className="blog-content">
                  <span className="blog-category">{blog.category}</span>
                  <h3 className="blog-title">
                    <Link to={`/blog/${blog._id}`}>{blog.title}</Link>
                  </h3>
                  <p className="blog-excerpt">{getExcerpt(blog.content)}</p>
                  <div className="blog-meta">
                    <span className="blog-date">{formatDate(blog.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default HomePage;