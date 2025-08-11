'use client'
import { useEffect, useState } from 'react'

interface Tag {
  id: number
  name: string
  slug: string
  postCount: number
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [message, setMessage] = useState('')
  
  // 表单状态
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  useEffect(() => {
    fetchTags()
  }, [])

  async function fetchTags() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/tags')
      const data = await res.json()
      if (data.success) {
        setTags(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setName('')
    setSlug('')
    setEditingTag(null)
    setShowForm(false)
  }

  function startEdit(tag: Tag) {
    setEditingTag(tag)
    setName(tag.name)
    setSlug(tag.slug)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const tagData = { name, slug }
    
    try {
      const url = editingTag 
        ? `/api/admin/tags/${editingTag.id}`
        : '/api/admin/tags'
      const method = editingTag ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tagData)
      })
      
      const data = await res.json()
      if (data.success) {
        setMessage(data.message)
        resetForm()
        fetchTags()
        setTimeout(() => setMessage(''), 3000)
      } else {
        alert(data.error?.message || '操作失败')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('操作失败')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('确定要删除这个标签吗？')) return
    
    try {
      const res = await fetch(`/api/admin/tags/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setMessage(data.message)
        fetchTags()
        setTimeout(() => setMessage(''), 3000)
      } else {
        alert(data.error?.message || '删除失败')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('删除失败')
    }
  }

  async function handleBatchDelete() {
    if (selectedTags.length === 0) {
      alert('请选择要删除的标签')
      return
    }
    
    if (!confirm(`确定要删除选中的 ${selectedTags.length} 个标签吗？`)) return
    
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagIds: selectedTags })
      })
      const data = await res.json()
      if (data.success) {
        setMessage(data.message)
        setSelectedTags([])
        fetchTags()
        setTimeout(() => setMessage(''), 3000)
      } else {
        alert(data.error?.message || '删除失败')
      }
    } catch (error) {
      console.error('Batch delete error:', error)
      alert('删除失败')
    }
  }

  function toggleSelectTag(id: number) {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    )
  }

  function toggleSelectAll() {
    setSelectedTags(prev =>
      prev.length === tags.length ? [] : tags.map(t => t.id)
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">标签管理</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? '取消' : '新建标签'}
        </button>
      </div>

      {message && (
        <div className="p-3 bg-green-100 text-green-800 rounded-lg">
          {message}
        </div>
      )}

      {/* 标签表单 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">
            {editingTag ? '编辑标签' : '新建标签'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="标签名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="URL Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingTag ? '更新' : '创建'}
            </button>
          </div>
        </form>
      )}

      {/* 批量操作 */}
      {selectedTags.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <span className="text-sm">已选择 {selectedTags.length} 个标签</span>
          <button
            onClick={handleBatchDelete}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            批量删除
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : tags.length === 0 ? (
        <div className="text-center py-8 text-gray-500">暂无标签</div>
      ) : (
        <div className="space-y-4">
          {/* 表头 */}
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={selectedTags.length === tags.length && tags.length > 0}
              onChange={toggleSelectAll}
              className="mr-3"
            />
            <span className="text-sm font-medium">全选</span>
          </div>

          {/* 标签列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags.map((tag) => (
              <div key={tag.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => toggleSelectTag(tag.id)}
                  />
                  <span className="text-sm text-gray-500">
                    {tag.postCount} 篇文章
                  </span>
                </div>
                
                <div className="mb-3">
                  <h3 className="font-semibold">{tag.name}</h3>
                  <p className="text-sm text-gray-500">Slug: {tag.slug}</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(tag)}
                    className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="flex-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
