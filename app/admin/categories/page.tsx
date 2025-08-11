'use client'
import { useEffect, useState } from 'react'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  postCount: number
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [message, setMessage] = useState('')
  
  // 表单状态
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setName('')
    setSlug('')
    setDescription('')
    setEditingCategory(null)
    setShowForm(false)
  }

  function startEdit(category: Category) {
    setEditingCategory(category)
    setName(category.name)
    setSlug(category.slug)
    setDescription(category.description || '')
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const categoryData = { name, slug, description }
    
    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      const method = editingCategory ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      })
      
      const data = await res.json()
      if (data.success) {
        setMessage(data.message)
        resetForm()
        fetchCategories()
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
    if (!confirm('确定要删除这个分类吗？')) return
    
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setMessage(data.message)
        fetchCategories()
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
    if (selectedCategories.length === 0) {
      alert('请选择要删除的分类')
      return
    }
    
    if (!confirm(`确定要删除选中的 ${selectedCategories.length} 个分类吗？`)) return
    
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryIds: selectedCategories })
      })
      const data = await res.json()
      if (data.success) {
        setMessage(data.message)
        setSelectedCategories([])
        fetchCategories()
        setTimeout(() => setMessage(''), 3000)
      } else {
        alert(data.error?.message || '删除失败')
      }
    } catch (error) {
      console.error('Batch delete error:', error)
      alert('删除失败')
    }
  }

  function toggleSelectCategory(id: number) {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    )
  }

  function toggleSelectAll() {
    setSelectedCategories(prev =>
      prev.length === categories.length ? [] : categories.map(c => c.id)
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">分类管理</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? '取消' : '新建分类'}
        </button>
      </div>

      {message && (
        <div className="p-3 bg-green-100 text-green-800 rounded-lg">
          {message}
        </div>
      )}

      {/* 分类表单 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">
            {editingCategory ? '编辑分类' : '新建分类'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="分类名称"
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
          <textarea
            placeholder="分类描述（可选）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg mb-4"
          />
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
              {editingCategory ? '更新' : '创建'}
            </button>
          </div>
        </form>
      )}

      {/* 批量操作 */}
      {selectedCategories.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <span className="text-sm">已选择 {selectedCategories.length} 个分类</span>
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
      ) : categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">暂无分类</div>
      ) : (
        <div className="space-y-4">
          {/* 表头 */}
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={selectedCategories.length === categories.length && categories.length > 0}
              onChange={toggleSelectAll}
              className="mr-3"
            />
            <span className="text-sm font-medium">全选</span>
          </div>

          {/* 分类列表 */}
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => toggleSelectCategory(category.id)}
                  />
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-gray-500">Slug: {category.slug}</p>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {category.postCount} 篇文章
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(category)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
