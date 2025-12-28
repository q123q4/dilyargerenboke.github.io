import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function CategoryPage() {
  const { category } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategoryBlogs();
  }, [category]);

  // 获取指定分类的博客
  const fetchCategoryBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/blogs?category=${category}`);
      setBlogs(response.data);
    } catch (err) {
      setError(`获取${category}分类博客失败`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="category-container">
      <div className="category-header">
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--primary-color)' }}>
          ← 返回首页
        </Link>
        <h1 style={{ fontFamily: 'var(--font-cursive)', marginTop: '1rem' }}>{category}分类博客</h1>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="blog-grid">
          {blogs.length === 0 ? (
            <div className="no-blogs">该分类下暂无博客文章</div>
          ) : (
            blogs.map(blog => (
              <div className="blog-card" key={blog._id}>
                {blog.image && (
                  <div className="blog-image">
                    <Link to={`/blog/${blog._id}`}>
                      <img 
                        src={blog.image.startsWith('http') ? blog.image : `http://localhost:5000/${blog.image}`} 
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

export default CategoryPage;