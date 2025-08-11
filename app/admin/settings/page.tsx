'use client'
import { useEffect, useState } from 'react'

interface SiteSettings {
  title: string
  description: string
  keywords: string
  author: string
  baseUrl: string
  aboutContent: string
}

interface Stats {
  totalPosts: number
  publishedPosts: number
  totalComments: number
  pendingComments: number
  totalCategories: number
  totalTags: number
}

interface RecentPost {
  id: number
  title: string
  status: string
  createdAt: string
}

interface RecentComment {
  id: number
  author: string
  content: string
  status: string
  createdAt: string
  post: {
    title: string
    slug: string
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    title: '',
    description: '',
    keywords: '',
    author: '',
    baseUrl: '',
    aboutContent: ''
  })
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
  const [recentComments, setRecentComments] = useState<RecentComment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'settings' | 'stats' | 'backup'>('settings')

  useEffect(() => {
    fetchSettings()
    fetchStats()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data.success) {
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/settings', { method: 'PUT' })
      const data = await res.json()
      if (data.success) {
        setStats(data.data.stats)
        setRecentPosts(data.data.recentPosts)
        setRecentComments(data.data.recentComments)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      const data = await res.json()
      if (data.success) {
        setMessage(data.message)
        setTimeout(() => setMessage(''), 3000)
      } else {
        alert(data.error?.message || '保存失败')
      }
    } catch (error) {
      console.error('Save settings error:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  function updateSetting(key: keyof SiteSettings, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return <div className="text-center py-8">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">站点设置</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'settings' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            基本设置
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'stats'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            统计信息
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'backup'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            备份管理
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-green-100 text-green-800 rounded-lg">
          {message}
        </div>
      )}

      {activeTab === 'settings' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">站点标题</label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => updateSetting('title', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">作者</label>
              <input
                type="text"
                value={settings.author}
                onChange={(e) => updateSetting('author', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">站点描述</label>
            <textarea
              value={settings.description}
              onChange={(e) => updateSetting('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">关键词</label>
              <input
                type="text"
                value={settings.keywords}
                onChange={(e) => updateSetting('keywords', e.target.value)}
                placeholder="用逗号分隔"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">站点 URL</label>
              <input
                type="url"
                value={settings.baseUrl}
                onChange={(e) => updateSetting('baseUrl', e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">关于页面内容</label>
            <textarea
              value={settings.aboutContent}
              onChange={(e) => updateSetting('aboutContent', e.target.value)}
              rows={8}
              placeholder="支持 Markdown 格式"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存设置'}
            </button>
          </div>
        </form>
      ) : activeTab === 'stats' ? (
        <div className="space-y-6">
          {/* 统计卡片 */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalPosts}</div>
                <div className="text-sm text-gray-600">总文章数</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.publishedPosts}</div>
                <div className="text-sm text-gray-600">已发布</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.totalComments}</div>
                <div className="text-sm text-gray-600">总评论数</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingComments}</div>
                <div className="text-sm text-gray-600">待审评论</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{stats.totalCategories}</div>
                <div className="text-sm text-gray-600">分类数</div>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">{stats.totalTags}</div>
                <div className="text-sm text-gray-600">标签数</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 最近文章 */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">最近文章</h3>
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{post.title}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      post.status === 'PUBLISHED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status === 'PUBLISHED' ? '已发布' : '草稿'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 最近评论 */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">最近评论</h3>
              <div className="space-y-3">
                {recentComments.map((comment) => (
                  <div key={comment.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{comment.author}</span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        comment.status === 'APPROVED' 
                          ? 'bg-green-100 text-green-800' 
                          : comment.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {comment.status === 'APPROVED' ? '已通过' : 
                         comment.status === 'REJECTED' ? '已拒绝' : '待审核'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {comment.content}
                    </div>
                    <div className="text-xs text-gray-500">
                      文章：{comment.post.title} • {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <BackupManagement />
      )}
    </div>
  )
}

function BackupManagement() {
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState('')

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch('/api/backup/export')
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = res.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'backup.zip'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setMessage('备份导出成功')
      } else {
        const data = await res.json()
        alert(data.error?.message || '导出失败')
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('导出失败')
    } finally {
      setExporting(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!confirm('导入备份将覆盖现有数据，确定要继续吗？')) {
      e.target.value = ''
      return
    }

    setImporting(true)
    try {
      const formData = new FormData()
      formData.append('backup', file)

      const res = await fetch('/api/backup/import', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (data.success) {
        setMessage(`备份导入成功！导入了 ${data.data.stats.posts} 篇文章、${data.data.stats.comments} 条评论、${data.data.stats.files} 个文件`)
        setTimeout(() => window.location.reload(), 2000)
      } else {
        alert(data.error?.message || '导入失败')
      }
    } catch (error) {
      console.error('Import error:', error)
      alert('导入失败')
    } finally {
      setImporting(false)
      e.target.value = ''
      setTimeout(() => setMessage(''), 5000)
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="p-3 bg-green-100 text-green-800 rounded-lg">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 导出备份 */}
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">导出备份</h3>
          <p className="text-gray-600 mb-4">
            导出包含所有文章、评论、分类、标签和上传文件的完整备份。
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {exporting ? '导出中...' : '导出备份'}
          </button>
        </div>

        {/* 导入备份 */}
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">导入备份</h3>
          <p className="text-gray-600 mb-4">
            从备份文件恢复数据。<span className="text-red-600 font-medium">注意：这将覆盖现有数据！</span>
          </p>
          <input
            type="file"
            accept=".zip"
            onChange={handleImport}
            disabled={importing}
            className="w-full px-3 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {importing && (
            <div className="mt-2 text-sm text-blue-600">导入中，请稍候...</div>
          )}
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-yellow-50">
        <h3 className="text-lg font-semibold mb-2 text-yellow-800">重要提示</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 导出的备份文件包含完整的数据库数据和上传文件</li>
          <li>• 导入备份前请确保已备份当前数据</li>
          <li>• 导入过程中请勿关闭浏览器或刷新页面</li>
          <li>• 建议定期导出备份以防数据丢失</li>
        </ul>
      </div>
    </div>
  )
}
