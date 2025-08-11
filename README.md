# 个人博客系统

基于 Next.js 15 + SQLite + Prisma + Tailwind CSS 3 的现代化个人博客系统，专为非技术人员设计，支持傻瓜式部署和维护。

## 🚀 项目特色

- **🎨 现代化设计**：响应式布局，支持暗色模式，炫酷动画效果
- **📝 强大编辑器**：Markdown 编辑器，实时预览，图片拖拽上传
- **💬 评论系统**：本地自建评论，支持审核管理，垃圾评论过滤
- **🏷️ 内容管理**：分类标签管理，归档浏览，全文搜索
- **📡 SEO 优化**：RSS 订阅，sitemap，社交分享卡片
- **🔒 安全可靠**：JWT 鉴权，限流保护，敏感词过滤
- **📦 备份恢复**：一键导出导入，数据安全有保障
- **⚡ 性能优化**：静态生成，图片优化，CDN 友好

## 技术栈
- **前端**：Next.js 15 (App Router)、React 18、TypeScript、Tailwind CSS 3
- **后端**：Next.js API Routes、Prisma ORM
- **数据库**：SQLite（生产环境可切换 PostgreSQL）
- **鉴权**：jose (JWT)、中间件路由保护
- **动画**：Framer Motion（支持 prefers-reduced-motion）
- **其他**：ESLint、PostCSS、remark/rehype (Markdown)

## 📋 功能清单

### 前台功能
- ✅ **首页**：炫酷 Hero 动画，文章卡片 cascade 动画
- ✅ **文章详情**：Markdown 渲染，代码高亮，评论区
- ✅ **分类页面**：分类列表，分类下文章浏览
- ✅ **标签页面**：标签云，标签下文章浏览
- ✅ **归档页面**：按年月分组的时间线浏览
- ✅ **搜索页面**：前端全文搜索（标题、摘要、分类、标签）
- ✅ **关于页面**：站点介绍和联系方式
- ✅ **RSS 订阅**：/feed.xml，支持订阅器
- ✅ **站点地图**：/sitemap.xml，SEO 友好

### 后台管理
- ✅ **文章管理**：创建、编辑、发布、删除文章
- ✅ **评论管理**：审核、通过、拒绝、删除评论
- ✅ **分类管理**：创建、编辑、删除分类
- ✅ **标签管理**：创建、编辑、删除标签
- ✅ **站点设置**：基本信息、SEO 配置、统计面板
- ✅ **备份管理**：一键导出/导入完整备份

### 编辑功能
- ✅ **Markdown 编辑器**：工具栏，实时预览
- ✅ **图片上传**：拖拽上传，自动插入 Markdown
- ✅ **文章管理**：草稿/发布状态切换
- ✅ **分类标签**：多选分类和标签

### 评论系统
- ✅ **前台提交**：昵称、邮箱、内容表单
- ✅ **后台审核**：待审核、已通过、已拒绝状态管理
- ✅ **安全保护**：限流、敏感词过滤、垃圾评论检测
- ✅ **隐私保护**：IP 哈希存储

### SEO 与订阅
- ✅ **动态 metadata**：每页自动生成标题、描述、关键词
- ✅ **Open Graph**：社交媒体分享卡片
- ✅ **RSS feed**：最新文章订阅
- ✅ **Sitemap**：搜索引擎索引

### 动画与交互
- ✅ **首页动画**：Hero 背景粒子、文章卡片入场动画
- ✅ **页面过渡**：流畅的页面切换效果
- ✅ **响应式设计**：移动端友好
- ✅ **无障碍支持**：prefers-reduced-motion 检测

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- pnpm（推荐）或 npm

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd personal-blog
```

2. **安装依赖**
```bash
pnpm install
```

3. **环境配置**
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
# 数据库
DATABASE_URL="file:./data/blog.db"

# JWT 密钥（请修改为随机字符串）
SESSION_SECRET="your-super-secret-key-change-this"

# 管理员账号（首次运行时创建）
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-secure-password"

# 站点配置
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

4. **初始化数据库**
```bash
pnpm db:init
```

5. **启动开发服务器**
```bash
pnpm dev
```

6. **访问应用**
- 前台：http://localhost:3000
- 后台：http://localhost:3000/admin
- 登录：http://localhost:3000/login

### 生产部署

1. **构建项目**
```bash
pnpm build
```

2. **启动生产服务器**
```bash
pnpm start
```

## 📖 使用指南

### 内容管理

#### 创建文章
1. 登录后台：访问 `/login` 使用管理员账号登录
2. 进入文章管理：点击"文章管理"
3. 新建文章：点击"新建文章"按钮
4. 编写内容：
   - 使用 Markdown 编辑器编写文章
   - 拖拽图片到编辑器自动上传
   - 使用工具栏快速插入格式
   - 实时预览效果
5. 设置分类标签：选择或创建分类和标签
6. 发布文章：切换状态为"已发布"

#### 管理评论
1. 进入评论管理：点击"评论管理"
2. 审核评论：
   - 查看待审核评论
   - 点击"通过"或"拒绝"
   - 支持批量操作
3. 管理已审核评论：查看、删除不当评论

#### 分类标签管理
1. 分类管理：创建、编辑、删除文章分类
2. 标签管理：创建、编辑、删除文章标签
3. 批量操作：支持批量删除（需确保无文章使用）

### 站点配置

#### 基本设置
1. 进入站点设置：点击"站点设置"
2. 配置基本信息：
   - 站点标题和描述
   - 作者信息
   - 关键词
   - 站点 URL
3. 编辑关于页面：在"关于页面内容"中编写 Markdown

#### 统计信息
- 查看文章、评论、分类、标签统计
- 查看最近文章和评论
- 监控待审核评论数量

### 备份与恢复

#### 导出备份
1. 进入站点设置 → 备份管理
2. 点击"导出备份"
3. 下载包含所有数据和文件的 ZIP 备份

#### 导入备份
1. 准备备份文件（ZIP 格式）
2. 点击"选择文件"上传备份
3. 确认导入（将覆盖现有数据）
4. 等待导入完成

### 前台功能

#### 浏览内容
- **首页**：查看最新文章，享受炫酷动画
- **分类浏览**：点击分类查看相关文章
- **标签浏览**：通过标签云发现感兴趣的内容
- **归档浏览**：按时间线浏览历史文章
- **搜索功能**：输入关键词搜索文章

#### 评论互动
1. 在文章详情页点击"发表评论"
2. 填写昵称、邮箱（可选）、评论内容
3. 提交后等待管理员审核
4. 审核通过后评论将显示在文章下方

## 🔧 维护指南

### 日常维护

#### 内容维护
- 定期发布新文章保持活跃度
- 及时审核和回复评论
- 整理分类标签，保持结构清晰
- 更新关于页面信息

#### 数据维护
- 定期导出备份（建议每周一次）
- 监控磁盘空间使用情况
- 清理无用的上传文件
- 检查数据库完整性

#### 安全维护
- 定期更新管理员密码
- 监控异常登录尝试
- 检查评论中的垃圾内容
- 更新敏感词过滤列表

### 故障排除

#### 常见问题

**1. 无法登录后台**
- 检查用户名密码是否正确
- 确认 `.env` 文件配置正确
- 重启应用服务

**2. 图片上传失败**
- 检查 `uploads` 目录权限
- 确认磁盘空间充足
- 检查文件大小是否超过 5MB

**3. 评论无法提交**
- 检查是否触发限流（每分钟最多 3 条）
- 确认内容未包含敏感词
- 检查网络连接

**4. RSS 或 sitemap 无法访问**
- 确认应用正常运行
- 检查路由配置
- 清除浏览器缓存

#### 数据恢复
如果数据丢失或损坏：
1. 停止应用服务
2. 使用最新备份文件
3. 通过后台导入备份功能恢复
4. 重启应用服务
5. 验证数据完整性

### 性能优化

#### 服务器优化
- 使用 PM2 管理 Node.js 进程
- 配置 Nginx 反向代理
- 启用 gzip 压缩
- 设置静态文件缓存

#### 数据库优化
- 定期清理过期数据
- 监控数据库大小
- 考虑迁移到 PostgreSQL（大量数据时）

#### 前端优化
- 启用图片懒加载
- 压缩上传图片
- 使用 CDN 加速静态资源

## 🚀 部署指南

### 📖 详细部署教程

我们为不同技术水平的用户准备了详细的部署教程：

- **[📚 完整部署教程（小白版）](docs/04-deployment-tutorial.md)** - 适合完全不懂技术的用户，每一步都有详细说明
- **[⚡ 5分钟快速部署指南](docs/05-quick-deploy-guide.md)** - 适合有一定基础的用户，快速上线
- **[🛠️ 开发指南](docs/02-development-guide.md)** - 适合开发者，包含开发环境搭建和自定义开发

### 🎯 一键部署（推荐）

我们提供了自动化部署脚本，让部署变得超级简单：

```bash
# 上传代码到服务器后，运行一键部署脚本
cd /var/www/blog
chmod +x scripts/deploy.sh
sudo bash scripts/deploy.sh
```

### 手动部署（简化版）

如果你有一定基础，也可以手动部署：

#### 1. 服务器准备
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2 pnpm
```

#### 2. 部署应用
```bash
# 克隆代码
git clone <your-repo> /var/www/blog
cd /var/www/blog

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 初始化数据库
pnpm run init

# 构建应用
pnpm build

# 启动应用
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 3. Nginx 配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /uploads/ {
        alias /var/www/blog/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 4. SSL 配置
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

### Docker 部署

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  blog:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

### 静态导出部署

对于不需要评论等动态功能的场景：

```bash
# 配置静态导出
# 在 next.config.js 中添加：
# output: 'export'

# 构建静态文件
pnpm build

# 部署到静态托管服务
# 如 Vercel、Netlify、GitHub Pages 等
```

## 📝 开发指南

### 项目结构
```
personal-blog/
├── app/                    # Next.js App Router
│   ├── (site)/            # 前台页面
│   ├── admin/             # 后台管理
│   ├── api/               # API 路由
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── ui/               # 通用 UI 组件
│   ├── site/             # 前台组件
│   └── admin/            # 后台组件
├── lib/                   # 工具库
├── prisma/               # 数据库相关
├── public/               # 静态资源
├── scripts/              # 脚本文件
└── uploads/              # 上传文件
```

### 开发命令
```bash
# 开发
pnpm dev

# 构建
pnpm build

# 启动生产服务器
pnpm start

# 数据库操作
pnpm db:init      # 初始化数据库
pnpm db:reset     # 重置数据库
pnpm db:seed      # 填充示例数据
pnpm db:studio    # 打开数据库管理界面

# 代码检查
pnpm lint
pnpm lint:fix
```

### 自定义开发

#### 添加新页面
1. 在 `app/` 目录下创建页面文件
2. 使用 TypeScript 和 Tailwind CSS
3. 遵循 Next.js App Router 约定

#### 修改样式
1. 编辑 `app/globals.css` 修改全局样式
2. 使用 Tailwind CSS 类名
3. 支持暗色模式

#### 扩展 API
1. 在 `app/api/` 目录下创建路由
2. 使用 Prisma 操作数据库
3. 添加适当的错误处理和验证

#### 添加组件
1. 在 `components/` 相应目录下创建组件
2. 使用 TypeScript 定义 props
3. 导出到 `index.ts` 文件

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 提交 Issue
- 详细描述问题或建议
- 提供复现步骤
- 包含环境信息

### 提交 PR
- Fork 项目并创建功能分支
- 遵循现有代码风格
- 添加必要的测试
- 更新相关文档

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢所有开源项目的贡献者，特别是：
- Next.js 团队
- Prisma 团队  
- Tailwind CSS 团队
- Framer Motion 团队

---

如有问题或建议，欢迎提交 Issue 或联系作者！
