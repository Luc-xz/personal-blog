'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Comment {
  id: number
  author: string
  content: string
  createdAt: string
}

interface CommentSectionProps {
  postId: number
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  // 表单状态
  const [author, setAuthor] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // 加载评论
  useEffect(() => {
    fetchComments()
  }, [postId])

  async function fetchComments() {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`)
      const data = await res.json()
      if (data.success) {
        setComments(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          author: author.trim(),
          email: email.trim() || undefined,
          content: content.trim()
        })
      })

      const data = await res.json()
      
      if (data.success) {
        setMessage(data.message || '评论提交成功，等待审核')
        setAuthor('')
        setEmail('')
        setContent('')
        setShowForm(false)
        // 可选：刷新评论列表（如果评论立即显示）
        // fetchComments()
      } else {
        setError(data.error?.message || '提交失败')
      }
    } catch (error) {
      setError('网络错误，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.section 
      className="mt-12 border-t pt-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">
          评论 {comments.length > 0 && `(${comments.length})`}
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? '取消' : '发表评论'}
        </button>
      </motion.div>

      {/* 消息提示 */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg"
          >
            {message}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 评论表单 */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={submitComment}
            className="mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="昵称 *"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="邮箱（可选）"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <textarea
              placeholder="写下你的评论..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting || !author.trim() || !content.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? '提交中...' : '发表评论'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* 评论列表 */}
      <div className="space-y-4">
        {loading ? (
          <motion.div variants={itemVariants} className="text-center py-8 text-gray-500">
            加载中...
          </motion.div>
        ) : comments.length === 0 ? (
          <motion.div variants={itemVariants} className="text-center py-8 text-gray-500">
            暂无评论，来发表第一条评论吧！
          </motion.div>
        ) : (
          comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              variants={itemVariants}
              custom={index}
              className="p-4 border rounded-lg bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {comment.author}
                </span>
                <time className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </time>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {comment.content}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </motion.section>
  )
}
