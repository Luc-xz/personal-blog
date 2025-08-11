import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const tagSchema = z.object({
  name: z.string().min(1).max(30),
  slug: z.string().min(1).max(30)
})

// 获取标签列表
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        posts: {
          where: {
            post: { status: 'PUBLISHED' as any }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: tags.map(tag => ({
        ...tag,
        postCount: tag.posts.length
      }))
    })
  } catch (error) {
    console.error('Get tags error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '获取标签失败' }
    }, { status: 500 })
  }
}

// 创建标签
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = tagSchema.safeParse(body)
    
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

    const { name, slug } = validationResult.data

    // 检查 slug 是否已存在
    const existing = await prisma.tag.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({
        success: false,
        error: { code: 'SLUG_EXISTS', message: 'Slug 已存在' }
      }, { status: 400 })
    }

    const tag = await prisma.tag.create({
      data: { name, slug }
    })

    return NextResponse.json({
      success: true,
      data: tag,
      message: '标签创建成功'
    })
  } catch (error) {
    console.error('Create tag error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '创建标签失败' }
    }, { status: 500 })
  }
}

// 批量删除标签
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { tagIds } = body

    if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_INPUT', message: '请选择要删除的标签' }
      }, { status: 400 })
    }

    // 检查是否有文章使用这些标签
    const postsUsingTags = await prisma.postTag.findMany({
      where: { tagId: { in: tagIds } },
      include: { post: { select: { title: true } } }
    })

    if (postsUsingTags.length > 0) {
      return NextResponse.json({
        success: false,
        error: { 
          code: 'TAG_IN_USE', 
          message: '无法删除正在使用的标签，请先移除相关文章的标签关联' 
        }
      }, { status: 400 })
    }

    const result = await prisma.tag.deleteMany({
      where: { id: { in: tagIds } }
    })

    return NextResponse.json({
      success: true,
      data: { affected: result.count },
      message: `成功删除了 ${result.count} 个标签`
    })
  } catch (error) {
    console.error('Delete tags error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '删除标签失败' }
    }, { status: 500 })
  }
}
