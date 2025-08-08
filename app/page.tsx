import Link from 'next/link'
import { prisma } from '@/lib/db'

export default async function HomePage() {
  const posts = await prisma.post.findMany({ where: { status: 'PUBLISHED' as any }, orderBy: { publishedAt: 'desc' }, take: 10 })
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">最新文章</h1>
      <ul className="space-y-3">
        {posts.map(p => (
          <li key={p.id} className="group">
            <Link className="text-lg font-medium group-hover:underline" href={{ pathname: '/post/[slug]', query: { slug: p.slug } }}>{p.title}</Link>
            <div className="text-sm text-gray-500">{p.summary || ''}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}

