'use client'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="text-xl font-semibold text-gray-900">
                管理后台
              </Link>
              <div className="flex space-x-4">
                <Link href="/admin/posts" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  文章管理
                </Link>
                <Link href="/admin/comments" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  评论管理
                </Link>
                <Link href="/admin/categories" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  分类管理
                </Link>
                <Link href="/admin/tags" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  标签管理
                </Link>
                <Link href="/admin/settings" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  站点设置
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
                查看网站
              </Link>
              <button
                onClick={() => {
                  fetch('/api/auth/logout', { method: 'POST' })
                    .then(() => window.location.href = '/login')
                }}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  )
}

