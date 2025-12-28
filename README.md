# 个人博客系统

一个功能完善的个人博客系统，采用前后端分离架构设计，支持博客发布、编辑、分类管理和用户认证等功能。

## 功能特性

- ✅ 博客管理：发布、编辑、删除博客文章
- ✅ 分类管理：支持按分类浏览和管理博客
- ✅ 用户认证：安全的登录系统和权限控制
- ✅ 图片上传：支持博客封面图片上传和预览
- ✅ 响应式设计：适配各种设备屏幕

## 技术栈

### 前端
- React 18
- React Router 6
- Axios
- CSS3 (响应式设计)

### 后端
- Node.js
- Express
- MongoDB
- JWT (认证)
- Multer (文件上传)

## 项目结构

```
├── backend/         # 后端API服务
├── frontend/        # 前端React应用
├── index.html       # 项目入口页面
└── README.md        # 项目说明文档
```

## 部署说明

### GitHub Pages部署

1. 确保您的项目已初始化git仓库：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. 创建GitHub仓库并添加远程仓库：
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   ```

3. **重要：配置vite.config.js中的base路径**
   - 修改`frontend/vite.config.js`文件中的base配置
   - 将`base: '/repo-name/'`中的`repo-name`替换为您的GitHub仓库名称
   ```javascript
   base: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '/',
   ```

4. 构建前端应用：
   ```bash
   cd frontend
   npm install
   npm run build
   ```

5. 将构建后的文件复制到根目录（可选）：
   ```bash
   cp -r ../dist/* ../
   ```

6. 推送代码到GitHub：
   ```bash
   git add .
   git commit -m "Add build files"
   git push -u origin master
   ```

7. 在GitHub仓库设置中启用GitHub Pages：
   - 进入仓库设置 > Pages
   - 选择 "Branch: master" 和 "/ (root)"
   - 点击 "Save"
   - 稍等几分钟，您的网站将可通过生成的URL访问

### 本地开发

#### 前端

1. 安装依赖：
   ```bash
   cd frontend
   npm install
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   ```

#### 后端

1. 安装依赖：
   ```bash
   cd backend
   npm install
   ```

2. 创建并配置.env文件（参考.env.example）

3. 启动后端服务器：
   ```bash
   npm start
   ```

## 注意事项

- 首次使用时，请确保MongoDB服务已启动
- 部署时，记得更新前端API配置中的后端服务地址
- 生产环境中，建议配置HTTPS以确保数据传输安全
- **重要：在GitHub Pages部署前，一定要修改vite.config.js中的base路径配置**

## License

MIT

