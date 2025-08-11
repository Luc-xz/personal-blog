import Link from 'next/link'
import { prisma } from '@/lib/db'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '标签',
  description: '浏览所有文章标签',
}

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    include: {
      posts: {
        where: {
          post: { status: 'PUBLISHED' as any }
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  // 按文章数量排序，热门标签在前
  const sortedTags = tags.sort((a, b) => b.posts.length - a.posts.length)

  return (
    <main className="max-w-4xl mx-auto p-6">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">文章标签</h1>
        <p className="text-gray-600 dark:text-gray-300">
          共 {tags.length} 个标签
        </p>
      </header>

      {tags.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          暂无标签
        </div>
      ) : (
        <div className="space-y-8">
          {/* 标签云 */}
          <section>
            <h2 className="text-xl font-semibold mb-6">标签云</h2>
            <div className="flex flex-wrap gap-3">
              {sortedTags.map((tag) => {
                const postCount = tag.posts.length
                const fontSize = Math.min(Math.max(postCount * 0.2 + 0.8, 0.8), 2) // 0.8rem - 2rem
                return (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    style={{ fontSize: `${fontSize}rem` }}
                  >
                    {tag.name}
                    <span className="ml-1 text-xs text-gray-500">({postCount})</span>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* 标签列表 */}
          <section>
            <h2 className="text-xl font-semibold mb-6">所有标签</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="group flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-200 hover:scale-105"
                >
                  <span className="font-medium group-hover:text-blue-600 transition-colors">
                    {tag.name}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                    {tag.posts.length}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          ← 返回首页
        </Link>
      </div>
    </main>
  )
}
