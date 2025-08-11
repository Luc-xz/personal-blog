import Link from 'next/link'
import { prisma } from '@/lib/db'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '分类',
  description: '浏览所有文章分类',
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      posts: {
        where: {
          post: { status: 'PUBLISHED' as any }
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <main className="max-w-4xl mx-auto p-6">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">文章分类</h1>
        <p className="text-gray-600 dark:text-gray-300">
          共 {categories.length} 个分类
        </p>
      </header>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          暂无分类
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group block p-6 border rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {category.posts.length}
                </span>
              </div>
              {category.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {category.description}
                </p>
              )}
            </Link>
          ))}
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
