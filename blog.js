const Blog = require('../models/blog');
const path = require('path');

// 获取所有博客
const getAllBlogs = async (req, res) => {
  try {
    console.log('收到获取所有博客请求');
    
    // 构建查询条件，用户只能看到自己的博客
    const query = {};
    if (req.user) {
      query.author = req.user._id;
      console.log(`用户已登录，仅返回ID为 ${req.user._id} 的用户博客`);
    } else {
      // 如果未登录，可以选择返回空数组或公开博客
      return res.json({ data: [] });
    }
    
    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    console.log(`成功获取 ${blogs.length} 篇博客`);
    res.json({ data: blogs });
  } catch (error) {
    console.error('获取博客列表失败:', error);
    res.status(500).json({ error: '获取博客列表失败' });
  }
};

// 获取单个博客
const getBlogById = async (req, res) => {
  try {
    const blogId = req.params.id;
    console.log(`收到获取单篇博客请求，ID: ${blogId}`);
    
    // 检查用户是否登录
    if (!req.user) {
      console.log('用户未登录，无法查看博客');
      return res.status(401).json({ error: '请先登录' });
    }
    
    // 查询指定ID且作者为当前用户的博客
    const blog = await Blog.findOne({ 
      _id: blogId,
      author: req.user._id
    });
    
    if (!blog) {
      console.log(`未找到博客或无权访问`);
      return res.status(404).json({ error: '博客不存在或无权访问' });
    }
    
    console.log(`成功获取博客: ${blog.title}`);
    res.json(blog);
  } catch (error) {
    console.error(`获取博客失败，ID: ${req.params.id}`, error);
    res.status(500).json({ error: '获取博客失败' });
  }
};

// 创建博客
// @desc  创建新博客
// @route POST /api/blogs
// @access Private
const createBlog = async (req, res) => {
  console.log('[博客控制器] 接收创建博客请求');
  try {
    const blogData = req.body;
    console.log('[博客控制器] 博客数据:', { title: blogData.title, category: blogData.category });
    
    // 自动设置当前登录用户为作者
    blogData.author = req.user._id;
    console.log('[博客控制器] 设置作者:', req.user._id);
    
    // 检查是否有上传的文件
    if (req.file) {
      console.log('[博客控制器] 检测到上传文件:', req.file.filename);
      // 构建图片URL (使用相对路径)
      blogData.image = `/uploads/${req.file.filename}`;
      console.log('[博客控制器] 构建图片URL:', blogData.image);
    }
    
    const newBlog = new Blog(blogData);
    await newBlog.save();
    console.log('[博客控制器] 博客创建成功:', newBlog.title);
    res.status(201).json(newBlog);
  } catch (error) {
    console.error('[博客控制器] 创建博客错误:', error.message);
    res.status(400).json({ error: '创建博客失败', details: error.message });
  }
};

// @desc  更新博客
// @route PUT /api/blogs/:id
// @access Private
const updateBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    console.log(`收到更新博客请求，ID: ${blogId}`);
    
    // 首先检查博客是否存在且作者是当前用户
    const existingBlog = await Blog.findOne({ 
      _id: blogId,
      author: req.user._id
    });
    
    if (!existingBlog) {
      console.log(`未找到博客或无权更新`);
      return res.status(404).json({ error: '博客不存在或无权更新' });
    }
    
    const blogData = { ...req.body };
    
    // 如果有文件上传，设置图片路径
    if (req.file) {
      console.log('检测到上传文件:', req.file.filename);
      blogData.image = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      // 如果有传递图片URL字符串，直接使用它
      console.log('检测到图片URL参数:', req.body.imageUrl);
      blogData.image = req.body.imageUrl;
    }
    
    // 确保不修改作者字段
    delete blogData.author;
    
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { $set: blogData },
      { new: true, runValidators: true }
    );
    
    console.log(`博客更新成功: ${updatedBlog.title}`);
    res.json(updatedBlog);
  } catch (error) {
    console.error(`更新博客失败，ID: ${req.params.id}`, error);
    res.status(400).json({ error: '更新博客失败' });
  }
};

// @desc  上传图片
// @route POST /api/blogs/upload
// @access Private
const uploadImage = async (req, res) => {
  console.log('[博客控制器] 接收图片上传请求');
  try {
    // 检查文件是否存在
    if (!req.file) {
      console.error('[博客控制器] 上传失败: 没有文件');
      return res.status(400).json({ error: '没有上传文件' });
    }
    
    console.log('[博客控制器] 文件上传成功:', req.file);
    
    // 构建图片URL (使用相对路径)
    const imageUrl = `/uploads/${req.file.filename}`;
    console.log('[博客控制器] 生成图片URL:', imageUrl);
    
    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error('[博客控制器] 上传图片处理错误:', error.message);
    res.status(500).json({ error: '图片上传失败', details: error.message });
  }
};

// 删除博客
const deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    console.log(`收到删除博客请求，ID: ${blogId}`);
    
    // 使用findOneAndDelete确保只删除作者为当前用户的博客
    const deletedBlog = await Blog.findOneAndDelete({
      _id: blogId,
      author: req.user._id
    });
    
    if (!deletedBlog) {
      console.log(`未找到博客或无权删除`);
      return res.status(404).json({ error: '博客不存在或无权删除' });
    }
    
    console.log(`博客删除成功: ${deletedBlog.title}`);
    res.json({ message: '博客删除成功' });
  } catch (error) {
    console.error(`删除博客失败，ID: ${req.params.id}`, error);
    res.status(500).json({ error: '删除博客失败' });
  }
};

// 获取所有分类
const getAllCategories = async (req, res) => {
  try {
    console.log('收到获取所有分类请求');
    
    // 只返回当前用户博客中的分类
    const categories = await Blog.distinct('category', { author: req.user._id });
    console.log(`成功获取 ${categories.length} 个分类`);
    res.json({ categories });
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({ error: '获取分类失败' });
  }
};

// 获取热门博客
const getPopularBlogs = async (req, res) => {
  try {
    // 确保用户已登录
    if (!req.user) {
      return res.status(401).json({ error: '未授权，请先登录' });
    }

    const userId = req.user._id;
    // 获取当前用户的博客，按点赞数降序排列，只返回前5篇
    const popularBlogs = await Blog.find({ author: userId })
      .sort({ likes: -1 })
      .limit(5)
      .select('title createdAt likes _id');
    
    res.status(200).json(popularBlogs);
  } catch (error) {
    console.error('获取热门博客失败:', error);
    res.status(500).json({ error: '获取热门博客失败' });
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  getAllCategories,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadImage,
  getPopularBlogs
};