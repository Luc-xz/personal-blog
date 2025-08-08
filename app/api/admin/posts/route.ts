import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const posts = await prisma.post.findMany({ orderBy: { id: 'desc' }, take: 50 })
  return NextResponse.json({ success: true, data: posts })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { title, slug, contentMd } = body
  if (!title || !slug || !contentMd) return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: '缺少字段' } }, { status: 400 })
  const { renderMarkdown } = await import('@/lib/markdown')
  const contentHtml = await renderMarkdown(contentMd)
  const post = await prisma.post.create({ data: { title, slug, contentMd, contentHtml, status: 'DRAFT' } as any })
  return NextResponse.json({ success: true, data: post })
}

