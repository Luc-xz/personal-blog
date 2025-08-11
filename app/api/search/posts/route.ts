import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' as any },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        publishedAt: true,
        categories: {
          include: {
            category: {
              select: { name: true, slug: true }
            }
          }
        },
        tags: {
          include: {
            tag: {
              select: { name: true, slug: true }
            }
          }
        }
      },
      orderBy: { publishedAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: posts
    })
  } catch (error) {
    console.error('Search posts error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '获取文章失败' }
    }, { status: 500 })
  }
}
