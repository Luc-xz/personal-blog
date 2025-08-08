# 个人博客（Next.js + SQLite + Prisma + Tailwind3）

一个“简单、可维护、傻瓜部署”的个人博客项目，使用 Next.js App Router、SQLite、Prisma 与 Tailwind CSS 3。目标是提供顺滑的写作与展示体验，支持云服务器部署与静态导出。

## 项目概览
- 技术栈：Next.js 15（App Router, React 18）+ SQLite + Prisma + Tailwind CSS 3
- 设计风格：简洁大方、细节精致；首页可加入炫酷动画，其它页面以流畅过渡为主
- 部署环境：云服务器（Node SSR）；支持静态导出（部分功能受限）

## 已完成功能（V1 基线）
- 工程化：TypeScript、Tailwind3、PostCSS、ESM 配置、生产构建通过
- 数据层：Prisma + SQLite（schema、迁移、Client 单例）
- 鉴权与保护：
  - Cookie 会话（jose）
  - /admin 路由中间件保护
  - 登录/登出 API 与登录页面
  - 支持从 .env 初始化管理员，或首次登录时自动创建
- 文章最小闭环：
  - 后台文章列表（占位，支持创建与发布）
  - 文章 API（GET/POST/GET(id)/PUT/DELETE）
  - 前台首页文章列表（仅显示已发布）、文章详情页
- Markdown 渲染：remark + rehype + 代码高亮，保存时转 contentHtml
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

## 下一步开发计划
- 编辑体验
  - Markdown 编辑器增强：预览分栏、图片粘贴上传、快捷工具栏、自动保存草稿
  - 图片上传接口（/api/upload）与安全校验（类型/大小/命名）
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
  - Nginx 反代与 HTTPS 部署示例完善

## 常见问题（FAQ）
- 登录失败？
  - 确认已运行 pnpm init（或首次登录自动创建）
  - 确认 .env 的 ADMIN_USERNAME/ADMIN_PASSWORD 与登录表单一致
  - 生产环境请设置强随机 SESSION_SECRET
- 构建失败（Tailwind/PostCSS）？
  - 本项目使用 Tailwind CSS 3 与 postcss.config.cjs，若调整 Tailwind 版本需同步修改 PostCSS 配置

## 许可
- 仅用于个人项目与学习用途；如需商用或扩展，请自查依赖许可并二次评估

