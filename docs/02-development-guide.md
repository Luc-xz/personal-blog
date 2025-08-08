# 个人博客项目开发与运维指南（基于 Next.js + SQLite + Prisma + Tailwind3）

> 目标：面向“简单可维护、可傻瓜部署”的个人博客，采用 Next.js（App Router）、SQLite、Prisma、Tailwind3；首页具备炫酷动画，其它页面以流畅过渡为主。

## 1. 技术栈与架构
- 前端/应用：Next.js 14+（App Router，React 18）
  - 渲染：SSG/ISR 为主，必要页面 SSR
  - 路由：app/ 目录路由；API Routes 使用 app/api
  - 动画：Framer Motion + Tailwind 过渡工具类；支持 prefers-reduced-motion
- 样式：Tailwind CSS 3（可加 @tailwindcss/typography, @tailwindcss/forms）
- 数据库：SQLite（./data/blog.sqlite）
- ORM：Prisma（schema.prisma；migrations/）
- 鉴权：基于 Cookie Session（iron-session 或 NextAuth Credentials）
- 日志：Pino/Winston（按日滚动）
- 备份：导出 zip（db + uploads）
- 运行时要求：Node.js 18+，pnpm 8+（或 npm 9+）；建议启用 ES 模块（next.config.mjs）


## 2. 目录结构（建议）
```
project-root/
  app/
    (site)/
      layout.tsx
      page.tsx                # 首页（炫酷动画）
      archive/page.tsx
      about/page.tsx
      search/page.tsx
      categories/page.tsx
      categories/[slug]/page.tsx
      tags/page.tsx
      tags/[slug]/page.tsx
      post/[slug]/page.tsx
      feed.xml/route.ts       # RSS 输出
    (admin)/
      layout.tsx
      page.tsx                # 仪表盘
      posts/
        page.tsx
        new/page.tsx
        [id]/edit/page.tsx
      categories/page.tsx
      tags/page.tsx
      comments/page.tsx
      settings/page.tsx
    api/
      auth/login/route.ts
      auth/logout/route.ts
      upload/route.ts
      comments/route.ts
      backup/export/route.ts
      backup/import/route.ts
  components/
    ui/...
    site/...
    admin/...
  lib/
    db.ts                    # PrismaClient 单例
    auth.ts                  # 会话/鉴权工具
    rss.ts                   # RSS 生成
    sitemap.ts               # sitemap 生成
    middleware.ts              # 保护 /app/(admin) 路由（会话校验）

    markdown.ts              # MD 渲染（remark/rehype）
    rate-limit.ts            # 简易限流
  prisma/
    schema.prisma
  public/
    favicon.ico
  uploads/                  # 媒体文件（持久化）
  scripts/
    init.ts                 # 初始化管理员/配置
    backup.ts               # 备份
    restore.ts              # 恢复
  .env.example
  tailwind.config.ts
  postcss.config.js
  README.md
```

## 3. 数据库与 Prisma
- 连接：DATABASE_URL="file:./data/blog.sqlite"
- schema.prisma（示例草案）：
```prisma:prisma/schema.prisma
// SQLite + Prisma schema (简化示例)
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String   // 存哈希
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id          Int       @id @default(autoincrement())
  title       String
  slug        String    @unique
  summary     String?
  coverUrl    String?
  contentMd   String
  contentHtml String
  status      PostStatus @default(DRAFT)
  isPinned    Boolean    @default(false)
  publishedAt DateTime?
  updatedAt   DateTime   @updatedAt
  categories  PostCategory[]
  tags        PostTag[]
  comments    Comment[]
}

enum PostStatus {
  DRAFT
  PUBLISHED
}

model Category {
  id          Int    @id @default(autoincrement())
  name        String @unique
  slug        String @unique
  description String?
  posts       PostCategory[]
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  slug  String @unique
  posts PostTag[]
}

model PostCategory {
  id         Int      @id @default(autoincrement())
  post       Post     @relation(fields: [postId], references: [id])
  postId     Int
  category   Category @relation(fields: [categoryId], references: [id])
  categoryId Int
  @@unique([postId, categoryId])
}

model PostTag {
  id     Int  @id @default(autoincrement())
  post   Post @relation(fields: [postId], references: [id])
  postId Int
  tag    Tag  @relation(fields: [tagId], references: [id])
  tagId  Int
  @@unique([postId, tagId])
}

model Comment {
  id        Int      @id @default(autoincrement())
  post      Post     @relation(fields: [postId], references: [id])
  postId    Int
  author    String
  email     String?
  content   String
  status    CommentStatus @default(PENDING)
  createdAt DateTime @default(now())
  ipHash    String?
}

enum CommentStatus {
  PENDING
  APPROVED
  REJECTED
}

model SiteConfig {
  id    Int    @id @default(autoincrement())
  key   String @unique
  value String  // JSON string
}
```
- PrismaClient 单例（避免热重载多实例）：
```ts:lib/db.ts
import { PrismaClient } from '@prisma/client';
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- 初始化与迁移：
  - npx prisma migrate dev --name init
  - npx prisma generate

## 4. API 设计（App Router /api）
- 鉴权：管理员区域使用中间件校验 Cookie；API 需要 CSRF 防护（可使用同源 + 双提交 Cookie 策略）
- 端点（示例）：
  - POST /api/auth/login：登录（username, password）
- 中间件与会话校验：
```ts:lib/auth.ts
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);
const cookieName = 'session';
export async function createSession(payload: { uid: number }) {
  const jwt = await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(secret);
  cookies().set(cookieName, jwt, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV==='production' });
}
export async function getSession() {
  const token = cookies().get(cookieName)?.value; if (!token) return null;
  try { const { payload } = await jwtVerify(token, secret); return payload as any; } catch { return null; }
}
export function clearSession(){ cookies().delete(cookieName); }
```

```ts:middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);
const cookieName = 'session';
const ADMIN_PREFIX = '/(admin)';
export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith(ADMIN_PREFIX)) return NextResponse.next();
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));
  try { await jwtVerify(token, secret); return NextResponse.next(); } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
export const config = { matcher: ['/((admin)(.*))'] };
```

  - POST /api/auth/logout：登出
  - CRUD /api/admin/posts：文章管理
  - CRUD /api/admin/categories：分类管理
  - CRUD /api/admin/tags：标签管理
  - GET/POST /api/admin/settings：站点设置
  - POST /api/upload：图片上传（保存到 /uploads，返回 URL）
  - POST /api/comments：发表评论（限流/敏感词/验证码可选，默认待审）
  - GET /feed.xml：RSS（Route Handler）

- 请求/响应规范：
  - 统一返回 { success, data, error }
  - 失败含 error.code 与 error.message；前端根据 code 做友好提示

## 5. 组件与页面设计
- 首页（page.tsx）：
  - 模块：头图/主视觉（Hero）+ 最新文章 + 推荐/置顶 + 页脚
  - 动画：
    - Hero 使用 Framer Motion（入场、视差/粒子、渐变背景）
    - 列表卡片 hover/cascade 动画；首屏动画延迟加载
- 文章页：
  - Markdown 渲染（remark/rehype + rehype-highlight）
  - 目录（自动提取 heading）
  - 评论区（本地自建：表单 + 列表 + 审核状态显示）
  - SEO：动态生成 metadata
- 列表页（分类/标签/归档）：
  - 基础过渡动画；骨架屏
- 后台：
  - 富文本（Markdown）编辑器：实时预览、图片粘贴上传、自动保存
  - 列表筛选、批量操作、状态标记

## 6. 动画规范与性能
- 工具：Framer Motion + Tailwind 过渡类
- 规范：
  - 优先 transform/opacity；避免频繁重排
  - 支持 prefers-reduced-motion：禁用非必要动画
  - 首页动画异步/延迟加载；组件分割 + 动态导入
  - 提供“轻量模式”开关（LocalStorage + class 控制）
- 性能预算：
- Nginx 反代（示例）：
```nginx:deploy/nginx.conf
server {
  listen 80;
  server_name your.domain.com;
  location / {
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Host $host;
    proxy_pass http://127.0.0.1:3000;
  }
}
```

  - LCP < 2.5s；CLS < 0.1；FID/INP 达标
  - 图片使用 next/image；合理尺寸与懒加载

## 7. 安全与风控
- 登录：密码哈希（bcrypt/argon2）、登录失败限流
- CSRF：同源策略 + 双提交 Cookie
- XSS：严格内容校验与转义；评论内容过滤
- SSRF/上传：限制文件类型与大小；生成唯一文件名；校验扩展名+MIME
- 速率限制：基于 IP + Cookie（/api/comments）

## 8. 配置与环境变量
- .env 示例：
```dotenv:.env.example
NODE_ENV=development
PORT=3000
DATABASE_URL="file:./data/blog.sqlite"
SESSION_SECRET="please-change-me"
UPLOAD_DIR="./uploads"
BASE_URL="http://localhost:3000"
```
- 脚本与命令（建议）：
```bash
# 安装依赖（pnpm示例）
pnpm install
# 开发
pnpm dev
# 构建与启动
pnpm build && pnpm start
# Prisma 迁移
pnpm prisma migrate dev --name init && pnpm prisma generate
# 初始化脚本（可选）
pnpm tsx scripts/init.ts
```


## 9. 开发流程
- 初始化：
  - pnpm/npm/yarn 安装依赖
  - npx prisma migrate dev && npx prisma generate
  - pnpm dev 启动本地
- 代码规范：
  - TypeScript、ESLint、Prettier、commitlint（可选）
  - 目录与命名遵循约定；组件小而清晰
- 测试：
  - 单元：Vitest/Jest（服务器与工具函数）
  - 端到端：Playwright（关键流程：登录、发文、评论）

## 10. 部署与运维
- 云服务器（Node SSR）
  - 构建：pnpm build
  - 运行：pnpm start（或 pm2/forever 管理进程）
  - 反代：Nginx -> Node（支持 gzip/brotli，HTTP/2）
  - 数据持久化：./data、./uploads
- 静态导出（可选）
  - next export（受限于动态路由与评论；可混合 ISR）
- 备份/恢复：
  - 备份脚本将 data、uploads 打包 zip
  - 恢复脚本校验版本与结构，提供预览清单
- 监控与日志：
  - 健康检查 /api/health（可选）
  - 错误日志收集（Pino/Winston）

## 11. 安装脚本与一键启动（建议）
- scripts/init.ts：
  - 检查 DATABASE_URL、初始化数据库与管理员账号
  - 创建 uploads 目录
- 一键脚本：
  - Windows：init-and-start.ps1
  - Unix：init-and-start.sh

## 12. 迁移与升级
- 使用 Prisma Migrate 维护版本
- 发布前执行 migrate + backup
- 兼容性：避免破坏性更改；必要时提供数据迁移脚本

## 13. 备份策略与数据生命周期
- 每日定时备份（可选）
- 管理端手动导出/导入
- 上传文件采用日期分层目录：/uploads/YYYY/MM/

## 14. 安全基线检查表
- [ ] SESSION_SECRET 已设置为强随机
- [ ] 管理路由加鉴权中间件
- [ ] 上传仅允许安全白名单后缀
- [ ] 生产环境启用 HTTPS（Nginx 证书）
- [ ] 定期升级依赖并审计（npm audit/pnpm audit）

## 15. 附录：包与工具（建议）
- 运行时：next, react, react-dom
- 样式：tailwindcss, @tailwindcss/typography, @tailwindcss/forms, clsx
- 动画：framer-motion
- ORM：prisma, @prisma/client
- 工具：zod（校验）, bcrypt/argon2（密码）, formidable 或 uploadthing（上传）
- 日志：pino
- 测试：vitest/playwright

---
本指南为 V1 基线；后续可根据实际需求继续细化（例如：组件库规范、主题系统、多语言扩展、CDN 策略等）。
