import Link from 'next/link'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findUnique({ where: { slug } })

  if (!category) return {}

  return {
    title: `${category.name} - 分类`,
    description: category.description || `查看 ${category.name} 分类下的所有文章`,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        where: {
          post: { status: 'PUBLISHED' as any },
        },
        include: {
          post: {
            include: {
              tags: { include: { tag: true } },
            },
          },
        },
        orderBy: {
          post: { publishedAt: 'desc' },
        },
      },
    },
  })

  if (!category) {
    notFound()
  }

  const posts = category.posts.map((pc: any) => pc.post)

  return (
    <main className="max-w-4xl mx-auto p-6">
      <header className="mb-12">
        <nav className="text-sm text-gray-500 mb-4">
          <Link
            href="/"
            className="hover:text-gray-700">
            首页
          </Link>
          <span className="mx-2">/</span>
          <Link
            href="/categories"
            className="hover:text-gray-700">
            分类
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-gray-100">{category.name}</span>
        </nav>

        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold">{category.name}</h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{posts.length} 篇文章</span>
        </div>

        {category.description && <p className="text-gray-600 dark:text-gray-300 text-lg">{category.description}</p>}
      </header>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">该分类下暂无文章</div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="border rounded-xl p-6 hover:shadow-md transition-shadow">
              <Link
                href={`/post/${post.slug}`}
                className="block">
                <h2 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">{post.title}</h2>
                {post.summary && <p className="text-gray-600 dark:text-gray-300 mb-3">{post.summary}</p>}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    {post.publishedAt && (
                      <time dateTime={post.publishedAt.toISOString()}>{new Date(post.publishedAt).toLocaleDateString('zh-CN')}</time>
                    )}
                  </div>
                  {post.tags.length > 0 && (
                    <div className="flex gap-1">
                      {post.tags.slice(0, 3).map((pt) => (
                        <Link
                          key={pt.tag.id}
                          href={`/tags/${pt.tag.slug}`}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                          {pt.tag.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
          ← 返回分类列表
        </Link>
      </div>
    </main>
  )
}
