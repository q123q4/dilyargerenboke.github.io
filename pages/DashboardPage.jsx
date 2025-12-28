import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogAPI } from '../api/api';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '技术',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // 检查用户登录状态
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('token');
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      fetchBlogs();
    }
  }, [navigate]);

  // 获取博客列表
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getAllBlogs();
      setBlogs(response.data);
    } catch (err) {
      setError('获取博客列表失败');
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理图片上传
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      setUploading(true);
      setError('');
      setSuccess('');
      
      console.log('开始上传图片:', file.name, file.size, file.type);
      
      // 直接使用File对象调用API
      const response = await blogAPI.uploadImage(file);
      
      if (response && response.imageUrl) {
        console.log('图片上传成功，设置表单image字段:', response.imageUrl);
        setFormData({ ...formData, image: response.imageUrl });
        setSuccess('图片上传成功');
        
        // 清空input值，允许再次上传同一图片
        event.target.value = '';
      } else {
        throw new Error('无效的服务器响应');
      }
    } catch (err) {
      console.error('图片上传失败:', err);
      const errorMessage = err.error || err.message || '图片上传失败，请稍后再试';
      setError(errorMessage);
      alert(`上传失败: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  // 图片预览URL格式化
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    
    // 如果已经是完整URL，则直接返回
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // 如果是以/uploads开头，则直接使用
    if (imagePath.startsWith('/uploads')) {
      return imagePath;
    }
    
    // 否则添加/uploads前缀
    return `/uploads/${imagePath}`;
  };

  // 删除当前预览的图片
  const handleRemoveImage = () => {
    setFormData({ ...formData, image: '' });
  };

  // 编辑博客
  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      category: blog.category,
      image: blog.image || ''
    });
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      content: '',
      category: '技术',
      image: ''
    });
    setSuccess('');
    setError('');
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      setError('标题和内容不能为空');
      return;
    }

    try {
      setLoading(true);
      
      if (editingBlog) {
        // 更新博客
        await blogAPI.updateBlog(editingBlog._id, formData);
        setSuccess('博客更新成功');
      } else {
        // 创建新博客
        await blogAPI.createBlog(formData);
        setSuccess('博客创建成功');
      }
      
      // 重置表单和状态
      handleCancelEdit();
      // 重新获取博客列表
      fetchBlogs();
    } catch (err) {
      setError(editingBlog ? '博客更新失败' : '博客创建失败');
      console.error('Error submitting blog:', err);
    } finally {
      setLoading(false);
      // 3秒后清除消息
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    }
  };

  // 删除博客
  const handleDeleteBlog = async (id) => {
    if (window.confirm('确定要删除这篇博客吗？')) {
      try {
        setLoading(true);
        await blogAPI.deleteBlog(id);
        setSuccess('博客删除成功');
        // 重新获取博客列表
        fetchBlogs();
      } catch (err) {
        setError('博客删除失败');
        console.error('Error deleting blog:', err);
      } finally {
        setLoading(false);
        // 3秒后清除消息
        setTimeout(() => {
          setSuccess('');
          setError('');
        }, 3000);
      }
    }
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>管理后台</h1>
        <button className="logout-button" onClick={handleLogout}>
          退出登录
        </button>
      </header>

      {/* 消息提示 */}
      {success && (
        <div className="message success-message">
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="message error-message">
          <span>{error}</span>
        </div>
      )}

      <main className="dashboard-main">
        {/* 博客列表部分 */}
        <section className="blog-list-section">
          <h2 className="section-title">博客列表</h2>
          
          {loading && !editingBlog && (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          )}
          
          <div className="blog-list">
            {blogs.length === 0 && !loading ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <div className="empty-state-text">暂无博客，开始创建第一篇吧！</div>
              </div>
            ) : (
              blogs.map(blog => (
                <div key={blog._id} className="blog-item">
                  <div className="blog-item-header">
                    <h3 className="blog-title">{blog.title}</h3>
                    <div className="blog-actions">
                      <button 
                        className="edit-button"
                        onClick={() => handleEditBlog(blog)}
                        disabled={loading}
                      >
                        编辑
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteBlog(blog._id)}
                        disabled={loading}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <div className="blog-meta">
                    <span>{blog.category}</span>
                    <span>{formatDate(blog.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 博客编辑器部分 */}
        <section className="blog-editor-section">
          <h2 className="section-title">{editingBlog ? '编辑博客' : '创建新博客'}</h2>
          
          <form className="editor-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">标题</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">分类</label>
              <select
                id="category"
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="技术">技术</option>
                <option value="生活">生活</option>
                <option value="旅行">旅行</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="image">图片</label>
              <div className="image-upload-container">
                <label htmlFor="imageUpload" className="image-upload-label">
                  {uploading ? '上传中...' : '点击或拖拽图片到此处上传'}
                </label>
                <input
                  type="file"
                  id="imageUpload"
                  className="image-upload-input"
                  onChange={handleImageUpload}
                  accept="image/*"
                  disabled={uploading}
                />
              </div>
              
              {formData.image && (
                <div className="image-preview">
                  <img 
                    src={getImageUrl(formData.image)} 
                    alt="Preview" 
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                  <button 
                    type="button" 
                    className="remove-image"
                    onClick={handleRemoveImage}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="content">内容</label>
              <textarea
                id="content"
                name="content"
                className="form-control"
                value={formData.content}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            <div className="button-group">
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading || uploading}
              >
                {loading ? '保存中...' : (editingBlog ? '更新博客' : '创建博客')}
              </button>
              {editingBlog && (
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  取消编辑
                </button>
              )}
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;