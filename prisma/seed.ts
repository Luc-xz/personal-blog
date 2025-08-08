import 'dotenv/config'
import { prisma } from '../lib/db'
import { renderMarkdown } from '../lib/markdown'

async function ensureCategory(name: string, slug: string, description?: string) {
  return prisma.category.upsert({
    where: { slug },
    update: { name, description },
    create: { name, slug, description },
  })
}

async function ensureTag(name: string, slug: string) {
  return prisma.tag.upsert({
    where: { slug },
    update: { name },
    create: { name, slug },
  })
}

async function ensurePost(data: {
  title: string
  slug: string
  summary?: string
  coverUrl?: string
  contentMd: string
  status?: 'DRAFT' | 'PUBLISHED'
  isPinned?: boolean
  publishedAt?: Date | null
  categories?: string[] // category slugs
  tags?: string[] // tag slugs
}) {
  const contentHtml = await renderMarkdown(data.contentMd)
  const post = await prisma.post.upsert({
    where: { slug: data.slug },
    update: {
      title: data.title,
      summary: data.summary,
      coverUrl: data.coverUrl,
      contentMd: data.contentMd,
      contentHtml,
      status: data.status ?? 'DRAFT',
      isPinned: data.isPinned ?? false,
      publishedAt: data.publishedAt ?? null,
    },
    create: {
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      coverUrl: data.coverUrl,
      contentMd: data.contentMd,
      contentHtml,
      status: data.status ?? 'DRAFT',
      isPinned: data.isPinned ?? false,
      publishedAt: data.publishedAt ?? null,
    },
  })

  // 清理并重建关联（为了幂等）
  await prisma.postCategory.deleteMany({ where: { postId: post.id } })
  await prisma.postTag.deleteMany({ where: { postId: post.id } })

  if (data.categories?.length) {
    const cats = await prisma.category.findMany({ where: { slug: { in: data.categories } } })
    for (const c of cats) {
      await prisma.postCategory.create({ data: { postId: post.id, categoryId: c.id } })
    }
  }
  if (data.tags?.length) {
    const tags = await prisma.tag.findMany({ where: { slug: { in: data.tags } } })
    for (const t of tags) {
      await prisma.postTag.create({ data: { postId: post.id, tagId: t.id } })
    }
  }
  return post
}

async function ensureComments(postId: number) {
  const count = await prisma.comment.count({ where: { postId } })
  if (count > 0) return
  await prisma.comment.createMany({
    data: [
      { postId, author: 'Alice', email: 'alice@example.com', content: '很棒的第一篇文章！', status: 'APPROVED' },
      { postId, author: 'Bob', content: '期待更多内容～', status: 'PENDING' },
    ],
  })
}

async function main() {
  // 基础分类与标签
  await ensureCategory('技术', 'tech', '技术相关内容')
  await ensureCategory('生活', 'life', '生活随笔')

  await ensureTag('Next.js', 'nextjs')
  await ensureTag('Prisma', 'prisma')
  await ensureTag('SQLite', 'sqlite')
  await ensureTag('Tailwind', 'tailwind')
  await ensureTag('随笔', 'essay')

  // 文章：已发布
  const hello = await ensurePost({
    title: 'Hello World：我的第一篇博客',
    slug: 'hello-world',
    summary: '从这里开始，记录技术与生活。',
    contentMd: '# Hello World\n\n这是我的第一篇博客。\n\n```ts\nconsole.log("hello blog")\n```',
    status: 'PUBLISHED',
    publishedAt: new Date(),
    categories: ['tech'],
    tags: ['nextjs', 'sqlite', 'tailwind'],
  })
  await ensureComments(hello.id)

  // 文章：草稿
  await ensurePost({
    title: '正在路上的功能计划',
    slug: 'roadmap-draft',
    summary: '记录项目的下一步计划与思考。',
    contentMd: '## 路线图\n\n- [ ] 评论系统\n- [ ] RSS 与 sitemap\n- [ ] 首页动效',
    status: 'DRAFT',
    categories: ['life'],
    tags: ['essay'],
  })

  // 文章：已发布（第二篇）
  await ensurePost({
    title: '使用 Prisma + SQLite 的轻量数据层',
    slug: 'prisma-sqlite-basics',
    summary: '为什么选择 SQLite 与 Prisma？如何迁移与备份？',
    contentMd: '使用 **SQLite** 可以降低部署复杂度，结合 **Prisma** 带来良好的开发体验。',
    status: 'PUBLISHED',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    categories: ['tech'],
    tags: ['prisma', 'sqlite'],
  })

  console.log('Seed completed.')
}

main().catch((e) => { console.error(e); process.exit(1) })

