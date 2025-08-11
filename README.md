# 个人博客（Next.js + SQLite + Prisma + Tailwind3）

一个“简单、可维护、傻瓜部署”的个人博客项目，使用 Next.js App Router、SQLite、Prisma 与 Tailwind CSS 3。目标是提供顺滑的写作与展示体验，支持云服务器部署与静态导出。

## 项目概览
- 技术栈：Next.js 15（App Router, React 18）+ SQLite + Prisma + Tailwind CSS 3
- 设计风格：简洁大方、细节精致；首页可加入炫酷动画，其它页面以流畅过渡为主
- 部署环境：云服务器（Node SSR）；支持静态导出（部分功能受限）

## 已完成功能（V2.0 完整版）
- 工程化：TypeScript、Tailwind3、PostCSS、ESM 配置、生产构建通过
- 数据层：Prisma + SQLite（schema、迁移、Client 单例）
- 鉴权与保护：
  - Cookie 会话（jose）
  - /admin 路由中间件保护
  - 登录/登出 API 与登录页面
  - 支持从 .env 初始化管理员，或首次登录时自动创建
- 文章完整闭环：
  - 后台文章管理（增强编辑器：Markdown 工具栏、实时预览、图片拖拽上传）
  - 文章 API（GET/POST/GET(id)/PUT/DELETE）
  - 前台首页文章列表（仅显示已发布）、文章详情页（含分类/标签/发布时间）
- 图片上传：
  - /api/upload 接口（类型校验、大小限制、安全文件名）
  - 静态文件服务（/uploads 路径，按年月分层存储）
- Markdown 渲染：remark + rehype + 代码高亮，保存时转 contentHtml
- SEO 与订阅：
  - RSS feed（/feed.xml）与 sitemap（/sitemap.xml）
  - generateMetadata 配置（首页、文章详情页动态标题/描述/OG/Twitter 卡片）
- 动画与 UI：
  - 首页 Hero 动画（Framer Motion，背景粒子、渐变文字）
  - 文章卡片 cascade 动画（错位入场、hover 效果）
  - 支持 prefers-reduced-motion（自动检测并禁用动画）
  - 响应式设计与暗色模式支持
- 评论系统（本地自建）：
  - 前台评论提交表单（限流、敏感词过滤、垃圾评论检测）
  - 后台评论审核页面（批量操作、状态管理：待审/通过/拒绝）
  - 评论展示与管理（IP 哈希保护隐私）
- 内容页面：
  - 分类页面（/categories、/categories/[slug]）
  - 标签页面（/tags、/tags/[slug]，包含标签云）
  - 归档页面（/archive，按年月分组）
  - 搜索页面（/search，前端全文检索）
  - 关于页面（/about，可自定义内容）
- 脚本：
  - scripts/init.ts 初始化站点配置、创建管理员（读取 .env）
  - prisma/seed.ts 生成示例分类、标签、文章与评论

## 目录结构（节选）
- app/
  - admin/（后台页面）
  - login/
  - post/[slug]/
  - api/auth/*、api/admin/posts/*
- lib/
  - db.ts（PrismaClient 单例）
  - auth.ts（会话签名/读取）
  - markdown.ts（MD 渲染）
- prisma/
  - schema.prisma
  - seed.ts（示例数据）
- scripts/
  - init.ts（初始化）

## 快速开始
1) 环境要求
- Node.js 18+
- pnpm（推荐）

2) 克隆与安装
- 安装依赖：pnpm install

3) 配置环境变量
- 复制 .env.example 为 .env，并修改：
```
SESSION_SECRET=强随机值
ADMIN_USERNAME=你的管理员用户名
ADMIN_PASSWORD=你的管理员密码
```

4) 数据库初始化与管理员创建
- 迁移与客户端：pnpm prisma:migrate && pnpm prisma:generate
- 初始化：pnpm init（创建 uploads、site 配置、管理员）
- 示例数据：pnpm seed（插入分类、标签、文章、评论）

5) 运行
- 开发：pnpm dev
- 生产构建：pnpm build
- 生产启动：pnpm start

6) 登录后台
- 打开 /login 使用 .env 中的管理员账号登录
- 登录成功后跳转 /admin（后台首页），进入 /admin/posts 进行内容管理

## 详细使用方法

### 前台功能
- **首页**（/）：展示最新文章列表，包含炫酷 Hero 动画、文章卡片 cascade 动画
- **文章详情**（/post/[slug]）：完整文章内容，支持 Markdown 渲染、代码高亮、分类标签显示、评论区
- **分类页面**（/categories、/categories/[slug]）：浏览所有分类，查看分类下的文章
- **标签页面**（/tags、/tags/[slug]）：标签云展示，查看标签下的文章
- **归档页面**（/archive）：按年月分组显示所有文章，时间线浏览
- **搜索页面**（/search）：前端全文搜索，支持标题、摘要、分类、标签检索
- **关于页面**（/about）：站点介绍和联系方式
- **RSS 订阅**（/feed.xml）：最新 20 篇文章的 RSS feed，支持订阅器订阅
- **站点地图**（/sitemap.xml）：SEO 友好的站点地图，包含所有页面链接

### 后台管理功能
- **登录页面**（/login）：管理员登录入口
- **后台首页**（/admin）：管理概览，统一导航
- **文章管理**（/admin/posts）：
  - 新建文章：支持 Markdown 编辑器、实时预览、图片拖拽上传
  - 工具栏：粗体、斜体、标题、列表、代码块、图片上传按钮
  - 发布流程：草稿 → 发布（一键切换状态）
  - 文章列表：显示标题、slug、摘要、状态（草稿/已发布）
- **评论管理**（/admin/comments）：
  - 评论审核：查看待审核、已通过、已拒绝的评论
  - 批量操作：批量通过、拒绝、删除评论
  - 状态管理：单个评论状态切换
  - 安全保护：显示 IP 哈希，保护用户隐私

### 图片上传功能
- **拖拽上传**：在编辑器中直接拖拽图片文件
- **按钮上传**：点击工具栏"图片"按钮选择文件
- **自动处理**：
  - 类型校验：仅支持 jpg、png、gif、webp 格式
  - 大小限制：最大 5MB
  - 安全存储：UUID 文件名，按年月分层存储（/uploads/YYYY/MM/）
  - 自动插入：上传成功后自动插入 Markdown 图片语法

### 动画与交互
- **首页动画**：
  - Hero 区域：背景粒子动画、渐变文字效果
  - 文章卡片：错位入场动画、hover 缩放效果
  - 标签交互：hover 放大效果
- **响应式支持**：自动检测用户的 `prefers-reduced-motion` 设置，禁用动画
- **性能优化**：动画使用 transform/opacity，避免重排重绘

### SEO 优化
- **动态 metadata**：每个页面自动生成合适的标题、描述、关键词
- **Open Graph**：支持社交媒体分享卡片（Facebook、Twitter）
- **结构化数据**：文章页面包含发布时间、作者、分类标签信息
- **搜索引擎友好**：sitemap.xml 自动更新，robots.txt 支持

### 数据管理
- **示例数据**：运行 `pnpm seed` 可插入示例分类、标签、文章
- **数据持久化**：SQLite 数据库文件存储在 ./data/ 目录
- **媒体文件**：上传的图片存储在 ./uploads/ 目录，支持直接访问

### 开发与调试
- **热重载**：开发模式下代码修改自动刷新
- **类型安全**：TypeScript 全覆盖，编译时错误检查
- **构建验证**：`pnpm build` 检查所有路由和组件的正确性
- **日志输出**：上传、登录等关键操作有详细日志

## 详细使用方法

### 前台功能
- **首页**（/）：展示最新文章列表，包含炫酷 Hero 动画、文章卡片 cascade 动画
- **文章详情**（/post/[slug]）：完整文章内容，支持 Markdown 渲染、代码高亮、分类标签显示
- **RSS 订阅**（/feed.xml）：最新 20 篇文章的 RSS feed，支持订阅器订阅
- **站点地图**（/sitemap.xml）：SEO 友好的站点地图，包含所有页面链接

### 后台管理
- **登录页面**（/login）：管理员登录入口
- **后台首页**（/admin）：管理概览
- **文章管理**（/admin/posts）：
  - 新建文章：支持标题、slug、摘要、Markdown 内容
  - Markdown 编辑器：工具栏（粗体、斜体、标题、列表、代码、图片）
  - 实时预览：编辑/预览模式切换
  - 图片上传：拖拽上传或点击上传，自动插入 Markdown 语法
  - 发布管理：草稿/已发布状态切换
  - 文章列表：显示所有文章及状态

### 图片上传功能
- **支持格式**：JPEG、PNG、GIF、WebP
- **大小限制**：5MB
- **存储方式**：按年月分层存储（/uploads/YYYY/MM/）
- **安全特性**：UUID 文件名、类型校验、大小限制
- **使用方法**：
  1. 在编辑器中点击"图片"按钮或直接拖拽图片到编辑区
  2. 自动上传并插入 Markdown 语法：`![filename](url)`

### SEO 功能
- **动态 Meta**：每篇文章自动生成标题、描述、关键词
- **社交分享**：OpenGraph 和 Twitter 卡片支持
- **搜索引擎**：robots.txt、sitemap.xml 自动生成
- **RSS 订阅**：标准 RSS 2.0 格式

### 动画与交互
- **首页动画**：Hero 区域背景粒子、渐变文字、按钮 hover 效果
- **文章卡片**：错位入场动画、hover 缩放、标签交互
- **无障碍支持**：自动检测 prefers-reduced-motion 并禁用动画
- **响应式设计**：移动端优先，适配各种屏幕尺寸

## 下一步开发计划（V3 路线图）
- 编辑体验优化
  - 自动保存草稿功能
  - 文章编辑页面（独立路由，更好的编辑体验）
  - 批量操作（删除、发布、分类管理）
  - 后台分类/标签管理页面
- 内容与 SEO
  - RSS（app/feed.xml/route.ts）与 sitemap.xml
  - generateMetadata（标题/描述/OG）与社交分享卡片
- 动画与 UI 打磨
  - 首页 Hero 动画与卡片 cascade 动画（Framer Motion）
  - 页面切换基础过渡；支持 prefers-reduced-motion 与“轻量模式”
- 评论系统（本地）
  - 提交 API（限流/待审）、前台展示与审核后台页面
- 备份与运维
  - 后台导出/导入备份 ZIP（db.sqlite + uploads）
  - 数据统计面板（文章数、评论数、访问量）
  - 站点设置页面（可在后台编辑关于页面等）
  - Nginx 反代与 HTTPS 部署示例完善
- 性能优化
  - 图片压缩与 WebP 转换
  - 静态页面缓存策略
  - CDN 集成支持
- 功能增强
  - 评论回复功能（嵌套评论）
  - 文章置顶功能
  - 阅读量统计
  - 相关文章推荐

## 常见问题（FAQ）
- 登录失败？
  - 确认已运行 pnpm init（或首次登录自动创建）
  - 确认 .env 的 ADMIN_USERNAME/ADMIN_PASSWORD 与登录表单一致
  - 生产环境请设置强随机 SESSION_SECRET
- 构建失败（Tailwind/PostCSS）？
  - 本项目使用 Tailwind CSS 3 与 postcss.config.cjs，若调整 Tailwind 版本需同步修改 PostCSS 配置

## 许可
- 仅用于个人项目与学习用途；如需商用或扩展，请自查依赖许可并二次评估

