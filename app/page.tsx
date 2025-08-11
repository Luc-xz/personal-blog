
import { prisma } from '@/lib/db'
import type { Metadata } from 'next'
import { HeroSection } from '@/components/site/HeroSection'
import { PostCard } from '@/components/site/PostCard'

export const metadata: Metadata = {
  title: '首页',
  description: '个人博客首页，分享技术与生活',
  openGraph: {
    title: '个人博客 - 首页',
    description: '个人博客首页，分享技术与生活'
  }
}

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' as any },
    orderBy: { publishedAt: 'desc' },
    take: 10,
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } }
    }
  })

  return (
    <main className="max-w-4xl mx-auto p-6">
      {/* Hero 区域 */}
      <HeroSection />

      {/* 最新文章 */}
      <section>
        <h2 className="text-2xl font-bold mb-8 text-center">最新文章</h2>
        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            暂无文章，请先在后台发布内容
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((p, index) => (
              <PostCard key={p.id} post={p} index={index} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

