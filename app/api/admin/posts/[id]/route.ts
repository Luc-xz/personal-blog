import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) { const params = await context.params;
  const id = Number(params.id)
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: '未找到' } }, { status: 404 })
  return NextResponse.json({ success: true, data: post })
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) { const params = await context.params;
  const id = Number(params.id)
  const body = await req.json()
  if (body.contentMd) {
    const { renderMarkdown } = await import('@/lib/markdown')
    body.contentHtml = await renderMarkdown(body.contentMd)
  }
  const post = await prisma.post.update({ where: { id }, data: body })
  return NextResponse.json({ success: true, data: post })
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) { const params = await context.params;
  const id = Number(params.id)
  await prisma.post.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

