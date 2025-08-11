'use client'
import { useEffect, useState, useRef } from 'react'

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [summary, setSummary] = useState('')
  const [contentMd, setContentMd] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetch('/api/admin/posts').then(r => r.json()).then(j => setPosts(j.data || [])) }, [])

  async function createPost() {
    const res = await fetch('/api/admin/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, slug, summary, contentMd }) })
    const j = await res.json()
    if (j.success) {
      setPosts([j.data, ...posts])
      setTitle(''); setSlug(''); setSummary(''); setContentMd('')
    }
  }

  async function publish(id: number) {
    const res = await fetch(`/api/admin/posts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'PUBLISHED', publishedAt: new Date().toISOString() }) })
    const j = await res.json()
    if (j.success) setPosts(posts.map(p => p.id === id ? j.data : p))
  }

  async function uploadImage(file: File) {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const j = await res.json()
      if (j.success) {
        const imageMarkdown = `![${file.name}](${j.data.url})`
        setContentMd(prev => prev + '\n' + imageMarkdown)
      } else {
        alert(j.error?.message || '上传失败')
      }
    } catch (error) {
      alert('上传失败')
    } finally {
      setUploading(false)
    }
  }

  function handleImageUpload() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadImage(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) uploadImage(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function insertMarkdown(syntax: string) {
    setContentMd(prev => prev + syntax)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">文章管理</h1>

      {/* 新建文章表单 */}
      <div className="border rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-medium">新建文章</h2>
        <div className="grid grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="标题" value={title} onChange={e=>setTitle(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="URL slug" value={slug} onChange={e=>setSlug(e.target.value)} />
        </div>
        <input className="w-full border rounded px-3 py-2" placeholder="摘要（可选）" value={summary} onChange={e=>setSummary(e.target.value)} />

        {/* Markdown 工具栏 */}
        <div className="flex items-center gap-2 p-2 border-b">
          <button onClick={() => insertMarkdown('**粗体**')} className="px-2 py-1 text-sm border rounded hover:bg-gray-50">粗体</button>
          <button onClick={() => insertMarkdown('*斜体*')} className="px-2 py-1 text-sm border rounded hover:bg-gray-50">斜体</button>
          <button onClick={() => insertMarkdown('\n## 标题\n')} className="px-2 py-1 text-sm border rounded hover:bg-gray-50">标题</button>
          <button onClick={() => insertMarkdown('\n- 列表项\n')} className="px-2 py-1 text-sm border rounded hover:bg-gray-50">列表</button>
          <button onClick={() => insertMarkdown('\n```\n代码\n```\n')} className="px-2 py-1 text-sm border rounded hover:bg-gray-50">代码</button>
          <button onClick={handleImageUpload} disabled={uploading} className="px-2 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50">
            {uploading ? '上传中...' : '图片'}
          </button>
          <button onClick={() => setIsPreview(!isPreview)} className={`px-2 py-1 text-sm border rounded ${isPreview ? 'bg-blue-100' : 'hover:bg-gray-50'}`}>
            {isPreview ? '编辑' : '预览'}
          </button>
        </div>

        {/* 编辑器区域 */}
        <div className="grid grid-cols-1 gap-3" style={{ gridTemplateColumns: isPreview ? '1fr 1fr' : '1fr' }}>
          {!isPreview && (
            <textarea
              className="border rounded px-3 py-2 font-mono text-sm min-h-[300px]"
              placeholder="Markdown 内容（支持拖拽图片上传）"
              value={contentMd}
              onChange={e=>setContentMd(e.target.value)}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            />
          )}
          {isPreview && (
            <>
              <textarea
                className="border rounded px-3 py-2 font-mono text-sm min-h-[300px]"
                placeholder="Markdown 内容"
                value={contentMd}
                onChange={e=>setContentMd(e.target.value)}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              />
              <div className="border rounded px-3 py-2 min-h-[300px] prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: contentMd.replace(/\n/g, '<br>') }} />
              </div>
            </>
          )}
        </div>

        <button onClick={createPost} className="bg-black text-white px-4 py-2 rounded">新建文章</button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>

      {/* 文章列表 */}
      <div>
        <h2 className="text-lg font-medium mb-3">文章列表</h2>
        <ul className="divide-y border rounded-lg">
          {posts.map(p => (
            <li key={p.id} className="p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-sm text-gray-500">{p.slug}</div>
                {p.summary && <div className="text-sm text-gray-400 mt-1">{p.summary}</div>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded ${p.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {p.status === 'PUBLISHED' ? '已发布' : '草稿'}
                </span>
                {p.status !== 'PUBLISHED' && (
                  <button onClick={() => publish(p.id)} className="px-3 py-1 rounded bg-emerald-600 text-white text-sm">发布</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

