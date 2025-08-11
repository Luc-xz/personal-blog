import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CommentSection } from '@/components/CommentSection'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } }
    }
  })

  if (!post) return {}

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  const url = `${baseUrl}/post/${slug}`
  const publishedTime = post.publishedAt?.toISOString()
  const modifiedTime = post.updatedAt.toISOString()

  return {
    title: post.title,
    description: post.summary || post.title,
    keywords: post.tags.map(pt => pt.tag.name),
    authors: [{ name: '博主' }],
    alternates: {
      canonical: url
    },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.summary || post.title,
      publishedTime,
      modifiedTime,
      authors: ['博主'],
      tags: post.tags.map(pt => pt.tag.name),
      images: post.coverUrl ? [{ url: post.coverUrl }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary || post.title,
      images: post.coverUrl ? [post.coverUrl] : undefined
    }
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } }
    }
  })
  if (!post) return notFound()

  return (
    <main className="prose dark:prose-invert max-w-3xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="mb-2">{post.title}</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          {post.publishedAt && (
            <div>发布于 {new Date(post.publishedAt).toLocaleDateString('zh-CN')}</div>
          )}
          {post.categories.length > 0 && (
            <div>
              分类：{post.categories.map(pc => pc.category.name).join(', ')}
            </div>
          )}
          {post.tags.length > 0 && (
            <div>
              标签：{post.tags.map(pt => pt.tag.name).join(', ')}
            </div>
          )}
        </div>
      </header>
      <article dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

      {/* 评论区 */}
      <CommentSection postId={post.id} />
    </main>
  )
}

