'use client'
import { useEffect, useState } from 'react'

interface Comment {
  id: number
  author: string
  email?: string
  content: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  ipHash?: string
  post: {
    id: number
    title: string
    slug: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedComments, setSelectedComments] = useState<number[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 })
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchComments()
  }, [statusFilter, pagination.page])

  async function fetchComments() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })
      if (statusFilter !== 'all') {
        params.append('status', statusFilter.toUpperCase())
      }

      const res = await fetch(`/api/admin/comments?${params}`)
      const data = await res.json()
      if (data.success) {
        setComments(data.data.comments)
        setPagination(data.data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateCommentStatus(id: number, status: string) {
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      const data = await res.json()
      if (data.success) {
        setMessage(data.message)
        fetchComments()
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Failed to update comment:', error)
    }
  }

  async function batchOperation(action: string) {
    if (selectedComments.length === 0) {
      alert('请选择要操作的评论')
      return
    }

    if (!confirm(`确定要${action === 'approve' ? '通过' : action === 'reject' ? '拒绝' : '删除'}选中的 ${selectedComments.length} 条评论吗？`)) {
      return
    }

    try {
      const res = await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentIds: selectedComments, action })
      })
      const data = await res.json()
      if (data.success) {
        setMessage(data.message)
        setSelectedComments([])
        fetchComments()
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Batch operation failed:', error)
    }
  }

  function toggleSelectComment(id: number) {
    setSelectedComments(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    )
  }

  function toggleSelectAll() {
    setSelectedComments(prev =>
      prev.length === comments.length ? [] : comments.map(c => c.id)
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return '已通过'
      case 'REJECTED': return '已拒绝'
      default: return '待审核'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">评论管理</h1>
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">全部状态</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已拒绝</option>
          </select>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-green-100 text-green-800 rounded-lg">
          {message}
        </div>
      )}

      {/* 批量操作 */}
      {selectedComments.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <span className="text-sm">已选择 {selectedComments.length} 条评论</span>
          <button
            onClick={() => batchOperation('approve')}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            批量通过
          </button>
          <button
            onClick={() => batchOperation('reject')}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            批量拒绝
          </button>
          <button
            onClick={() => batchOperation('delete')}
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            批量删除
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">暂无评论</div>
      ) : (
        <div className="space-y-4">
          {/* 表头 */}
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={selectedComments.length === comments.length && comments.length > 0}
              onChange={toggleSelectAll}
              className="mr-3"
            />
            <span className="text-sm font-medium">全选</span>
          </div>

          {/* 评论列表 */}
          {comments.map((comment) => (
            <div key={comment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedComments.includes(comment.id)}
                  onChange={() => toggleSelectComment(comment.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comment.author}</span>
                      {comment.email && (
                        <span className="text-sm text-gray-500">({comment.email})</span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(comment.status)}`}>
                        {getStatusText(comment.status)}
                      </span>
                    </div>
                    <time className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleString('zh-CN')}
                    </time>
                  </div>
                  
                  <p className="text-gray-700 mb-2 whitespace-pre-wrap">{comment.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      文章：
                      <a href={`/post/${comment.post.slug}`} target="_blank" className="text-blue-600 hover:underline">
                        {comment.post.title}
                      </a>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {comment.status !== 'APPROVED' && (
                        <button
                          onClick={() => updateCommentStatus(comment.id, 'APPROVED')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          通过
                        </button>
                      )}
                      {comment.status !== 'REJECTED' && (
                        <button
                          onClick={() => updateCommentStatus(comment.id, 'REJECTED')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          拒绝
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('确定要删除这条评论吗？')) {
                            // 调用删除 API
                            fetch(`/api/admin/comments/${comment.id}`, { method: 'DELETE' })
                              .then(() => fetchComments())
                          }
                        }}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 分页 */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                上一页
              </button>
              <span className="px-3 py-1">
                第 {pagination.page} 页，共 {pagination.pages} 页
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
