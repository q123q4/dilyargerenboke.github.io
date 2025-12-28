import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogAPI } from '../api/api';

function BlogDetailPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlogDetail();
  }, [id]);

  // 获取博客详情
  const fetchBlogDetail = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getBlogById(id);
      setBlog(response);
    } catch (err) {
      setError(err.message || '获取博客详情失败');
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 将内容按换行符分割为段落
  const renderContent = (content) => {
    if (!content) return null;
    
    const paragraphs = content.split(/[\r\n]+/).filter(p => p.trim() !== '');
    return paragraphs.map((paragraph, index) => (
      <p key={index} className="blog-paragraph">
        {paragraph.trim()}
      </p>
    ));
  };

  if (loading) {
    return (
      <div className="blog-detail-container">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blog-detail-container">
        <div className="error-message">{error || '未找到博客文章'}</div>
        <Link to="/">返回首页</Link>
      </div>
    );
  }

  return (
    <div className="blog-detail-container">
      <div className="blog-detail-header">
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--primary-color)' }}>
          ← 返回首页
        </Link>
        <span className="blog-category">{blog.category}</span>
        <h1 style={{ fontFamily: 'var(--font-cursive)' }}>{blog.title}</h1>
        <div className="blog-meta">
          <span className="blog-date">{formatDate(blog.createdAt)}</span>
        </div>
      </div>

      {blog.image && (
        <div className="blog-detail-image">
          <img 
            src={blog.image.startsWith('http') ? blog.image : `/uploads/${blog.image}`} 
            alt={blog.title} 
          />
        </div>
      )}

      <div className="blog-detail-content">
        {renderContent(blog.content)}
      </div>

      <div className="blog-actions">
        <Link to="/">返回首页</Link>
      </div>
      <div className="blog-footer">
        <p className="blog-footer-text">© 2024 dilyar的博客</p>
      </div>
    </div>
  );
}

export default BlogDetailPage;