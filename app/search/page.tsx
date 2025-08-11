'use client'
import { useState, useEffect, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Post {
  id: number
  title: string
  slug: string
  summary?: string
  publishedAt: string
  categories: Array<{ category: { name: string; slug: string } }>
  tags: Array<{ tag: { name: string; slug: string } }>
}

function SearchContent() {
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(searchParams.get('q') || '')

  // 获取所有已发布文章（用于前端搜索）
  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/search/posts')
        const data = await res.json()
        if (data.success) {
          setPosts(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  // 前端搜索逻辑
  const searchResults = useMemo(() => {
    if (!query.trim()) return []
    
    const searchTerm = query.toLowerCase().trim()
    return posts.filter(post => {
      // 搜索标题
      if (post.title.toLowerCase().includes(searchTerm)) return true
      
      // 搜索摘要
      if (post.summary?.toLowerCase().includes(searchTerm)) return true
      
      // 搜索分类
      if (post.categories.some(pc => pc.category.name.toLowerCase().includes(searchTerm))) return true
      
      // 搜索标签
      if (post.tags.some(pt => pt.tag.name.toLowerCase().includes(searchTerm))) return true
      
      return false
    })
  }, [posts, query])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    // 更新 URL 参数
    const url = new URL(window.location.href)
    if (query.trim()) {
      url.searchParams.set('q', query.trim())
    } else {
      url.searchParams.delete('q')
    }
    window.history.replaceState({}, '', url.toString())
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <header className="mb-12">
        <h1 className="text-3xl font-bold mb-6">搜索文章</h1>
        
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文章标题、摘要、分类或标签..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            autoFocus
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </header>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">加载中...</p>
        </div>
      ) : !query.trim() ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>输入关键词开始搜索</p>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.007-5.824-2.709" />
          </svg>
          <p>没有找到包含 "{query}" 的文章</p>
          <p className="text-sm mt-2">试试其他关键词或浏览<Link href="/archive" className="text-blue-600 hover:underline">所有文章</Link></p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-gray-600 dark:text-gray-300 mb-6">
            找到 {searchResults.length} 篇包含 "{query}" 的文章
          </div>
          
          {searchResults.map((post) => (
            <article key={post.id} className="border rounded-xl p-6 hover:shadow-md transition-shadow">
              <Link href={`/post/${post.slug}`} className="block">
                <h2 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                {post.summary && (
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {post.summary}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString('zh-CN')}
                    </time>
                    {post.categories.length > 0 && (
                      <span>
                        分类：{post.categories.map(pc => pc.category.name).join(', ')}
                      </span>
                    )}
                  </div>
                  {post.tags.length > 0 && (
                    <div className="flex gap-1">
                      {post.tags.slice(0, 3).map(pt => (
                        <span
                          key={pt.tag.slug}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                        >
                          {pt.tag.name}
                        </span>
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
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          ← 返回首页
        </Link>
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto p-6 text-center py-12">加载中...</div>}>
      <SearchContent />
    </Suspense>
  )
}
