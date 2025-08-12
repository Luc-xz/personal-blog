import Link from 'next/link'
import { prisma } from '@/lib/db'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '归档',
  description: '按时间浏览所有文章',
}

interface PostsByYear {
  [year: string]: {
    [month: string]: Array<{
      id: number
      title: string
      slug: string
      publishedAt: Date | null
    }>
  }
}

export default async function ArchivePage() {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' as any },
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: 'desc' },
  })

  // 按年月分组
  const postsByYear: PostsByYear = {}
  posts.forEach((post: any) => {
    if (!post.publishedAt) return

    const date = new Date(post.publishedAt)
    const year = date.getFullYear().toString()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')

    if (!postsByYear[year]) {
      postsByYear[year] = {}
    }
    if (!postsByYear[year][month]) {
      postsByYear[year][month] = []
    }

    postsByYear[year][month].push(post)
  })

  const years = Object.keys(postsByYear).sort((a, b) => parseInt(b) - parseInt(a))
  const totalPosts = posts.length

  return (
    <main className="max-w-4xl mx-auto p-6">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">文章归档</h1>
        <p className="text-gray-600 dark:text-gray-300">共 {totalPosts} 篇文章</p>
      </header>

      {years.length === 0 ? (
        <div className="text-center py-12 text-gray-500">暂无文章</div>
      ) : (
        <div className="space-y-12">
          {years.map((year) => {
            const months = Object.keys(postsByYear[year]).sort((a, b) => parseInt(b) - parseInt(a))
            const yearPostCount = months.reduce((sum, month) => sum + postsByYear[year][month].length, 0)

            return (
              <section
                key={year}
                className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold">{year}</h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{yearPostCount} 篇</span>
                </div>

                <div className="space-y-8">
                  {months.map((month) => {
                    const monthPosts = postsByYear[year][month]
                    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('zh-CN', { month: 'long' })

                    return (
                      <div
                        key={`${year}-${month}`}
                        className="space-y-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{monthName}</h3>
                          <span className="text-sm text-gray-500">{monthPosts.length} 篇</span>
                        </div>

                        <div className="space-y-3 ml-6">
                          {monthPosts.map((post) => (
                            <div
                              key={post.id}
                              className="flex items-center gap-4 group">
                              <time className="text-sm text-gray-500 font-mono min-w-[60px]">
                                {new Date(post.publishedAt!).toLocaleDateString('zh-CN', {
                                  month: '2-digit',
                                  day: '2-digit',
                                })}
                              </time>
                              <Link
                                href={`/post/${post.slug}`}
                                className="text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors group-hover:underline">
                                {post.title}
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
          ← 返回首页
        </Link>
      </div>
    </main>
  )
}
