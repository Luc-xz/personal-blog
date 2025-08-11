import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const siteSettingsSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500),
  keywords: z.string().max(200).optional(),
  author: z.string().max(50).optional(),
  baseUrl: z.string().url().optional(),
  aboutContent: z.string().optional()
})

// 获取站点设置
export async function GET() {
  try {
    const siteConfig = await prisma.siteConfig.findUnique({
      where: { key: 'site' }
    })

    let settings = {
      title: '个人博客',
      description: '分享技术与生活的点点滴滴',
      keywords: '',
      author: '',
      baseUrl: '',
      aboutContent: ''
    }

    if (siteConfig) {
      try {
        const configValue = JSON.parse(siteConfig.value)
        settings = { ...settings, ...configValue }
      } catch (error) {
        console.error('Parse site config error:', error)
      }
    }

    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '获取设置失败' }
    }, { status: 500 })
  }
}

// 更新站点设置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = siteSettingsSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '请检查输入内容',
          details: validationResult.error.issues
        }
      }, { status: 400 })
    }

    const settings = validationResult.data

    await prisma.siteConfig.upsert({
      where: { key: 'site' },
      update: { value: JSON.stringify(settings) },
      create: { key: 'site', value: JSON.stringify(settings) }
    })

    return NextResponse.json({
      success: true,
      data: settings,
      message: '设置保存成功'
    })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '保存设置失败' }
    }, { status: 500 })
  }
}

// 获取统计信息
export async function PUT() {
  try {
    const [postCount, commentCount, categoryCount, tagCount] = await Promise.all([
      prisma.post.count(),
      prisma.comment.count(),
      prisma.category.count(),
      prisma.tag.count()
    ])

    const publishedPostCount = await prisma.post.count({
      where: { status: 'PUBLISHED' as any }
    })

    const pendingCommentCount = await prisma.comment.count({
      where: { status: 'PENDING' as any }
    })

    const recentPosts = await prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true
      }
    })

    const recentComments = await prisma.comment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        author: true,
        content: true,
        status: true,
        createdAt: true,
        post: {
          select: { title: true, slug: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalPosts: postCount,
          publishedPosts: publishedPostCount,
          totalComments: commentCount,
          pendingComments: pendingCommentCount,
          totalCategories: categoryCount,
          totalTags: tagCount
        },
        recentPosts,
        recentComments
      }
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '获取统计信息失败' }
    }, { status: 500 })
  }
}
