'use client'
import { useEffect, useState } from 'react'

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [contentMd, setContentMd] = useState('')

  useEffect(() => { fetch('/api/admin/posts').then(r => r.json()).then(j => setPosts(j.data || [])) }, [])

  async function createPost() {
    const res = await fetch('/api/admin/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, slug, contentMd }) })
    const j = await res.json()
    if (j.success) setPosts([j.data, ...posts])
  }

  async function publish(id: number) {
    const res = await fetch(`/api/admin/posts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'PUBLISHED', publishedAt: new Date().toISOString() }) })
    const j = await res.json()
    if (j.success) setPosts(posts.map(p => p.id === id ? j.data : p))
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">文章管理</h1>
      <div className="grid gap-2">
        <input className="border rounded px-3 py-2" placeholder="标题" value={title} onChange={e=>setTitle(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="slug" value={slug} onChange={e=>setSlug(e.target.value)} />
        <textarea className="border rounded px-3 py-2" placeholder="contentMd" value={contentMd} onChange={e=>setContentMd(e.target.value)} />
        <button onClick={createPost} className="bg-black text-white px-4 py-2 rounded w-fit">新建</button>
      </div>
      <ul className="divide-y">
        {posts.map(p => (
          <li key={p.id} className="py-2 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-gray-500">{p.slug}</div>
            </div>
            {p.status !== 'PUBLISHED' && (
              <button onClick={() => publish(p.id)} className="px-3 py-1 rounded bg-emerald-600 text-white">发布</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

