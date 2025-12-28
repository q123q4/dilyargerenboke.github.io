import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api', // 基础URL
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加token到请求头
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证API
export const authAPI = {
  // 用户登录
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: '登录失败' };
    }
  },
  
  // 用户注册
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: '注册失败' };
    }
  }
};

// 博客API
export const blogAPI = {
  // 获取所有博客
  getAllBlogs: async () => {
    try {
      const response = await api.get('/blogs');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: '获取博客列表失败' };
    }
  },
  
  // 获取单个博客
  getBlogById: async (id) => {
    try {
      const response = await api.get(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: '获取博客详情失败' };
    }
  },
  
  // 获取所有分类
  getAllCategories: async () => {
    try {
      const response = await api.get('/blogs/categories/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: '获取分类失败' };
    }
  },
  
  // 创建博客
  createBlog: async (blogData) => {
    try {
      const formData = new FormData();
      formData.append('title', blogData.title);
      formData.append('content', blogData.content);
      formData.append('category', blogData.category);
      
      // 如果有图片文件，则添加到FormData
      if (blogData.image && blogData.image instanceof File) {
        formData.append('image', blogData.image);
      }
      
      const response = await api.post('/blogs', formData, {
        headers: {
          'Content-Type': undefined // 让axios自动处理multipart/form-data
        }
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: '创建博客失败' };
    }
  },
  
  // 更新博客
  updateBlog: async (id, blogData) => {
    try {
      const formData = new FormData();
      formData.append('title', blogData.title);
      formData.append('content', blogData.content);
      formData.append('category', blogData.category);
      
      // 如果是图片文件，则添加到FormData；如果是URL字符串，也添加到表单中
      if (blogData.image) {
        if (blogData.image instanceof File) {
          formData.append('image', blogData.image);
        } else {
          // 传递图片URL字符串给后端
          formData.append('imageUrl', blogData.image);
        }
      }
      
      const response = await api.put(`/blogs/${id}`, formData, {
        headers: {
          'Content-Type': undefined // 让axios自动处理multipart/form-data
        }
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: '更新博客失败' };
    }
  },
  
  // 删除博客
  deleteBlog: async (id) => {
    try {
      const response = await api.delete(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: '删除博客失败' };
    }
  },
  
  // 单独上传图片
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file); // 这里的'image'字段名必须与后端multer.single('image')匹配
      
      console.log('准备上传图片:', file.name);
      const response = await api.post('/blogs/upload', formData, {
        headers: {
          'Content-Type': undefined // 让axios自动处理multipart/form-data请求头和边界标记
        }
      });
      
      if (response.data && response.data.imageUrl) {
        console.log('图片上传成功，URL:', response.data.imageUrl);
        return response.data;
      } else {
        console.error('图片上传响应格式无效:', response.data);
        throw { error: '上传成功但返回格式异常' };
      }
    } catch (error) {
      console.error('图片上传API错误:', error);
      throw error.response?.data || { error: '图片上传失败，请稍后再试' };
    }
  },
};

export default api;