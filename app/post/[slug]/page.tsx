import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await prisma.post.findUnique({ where: { slug } })
  if (!post) return notFound()
  return (
    <main className="prose dark:prose-invert max-w-3xl mx-auto p-6">
      <h1>{post.title}</h1>
      <article dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
    </main>
  )
}

