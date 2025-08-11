import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const tagSchema = z.object({
  name: z.string().min(1).max(30),
  slug: z.string().min(1).max(30)
})

// 获取单个标签
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const id = parseInt(params.id)

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        posts: {
          include: {
            post: {
              select: { id: true, title: true, slug: true, status: true }
            }
          }
        }
      }
    })

    if (!tag) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: '标签不存在' }
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...tag,
        postCount: tag.posts.length
      }
    })
  } catch (error) {
    console.error('Get tag error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '获取标签失败' }
    }, { status: 500 })
  }
}

// 更新标签
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const id = parseInt(params.id)
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

    // 检查 slug 是否已被其他标签使用
    const existing = await prisma.tag.findFirst({
      where: { slug, id: { not: id } }
    })
    if (existing) {
      return NextResponse.json({
        success: false,
        error: { code: 'SLUG_EXISTS', message: 'Slug 已被其他标签使用' }
      }, { status: 400 })
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: { name, slug }
    })

    return NextResponse.json({
      success: true,
      data: tag,
      message: '标签更新成功'
    })
  } catch (error) {
    console.error('Update tag error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '更新标签失败' }
    }, { status: 500 })
  }
}

// 删除单个标签
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const id = parseInt(params.id)

    // 检查是否有文章使用此标签
    const postsUsingTag = await prisma.postTag.findMany({
      where: { tagId: id },
      include: { post: { select: { title: true } } }
    })

    if (postsUsingTag.length > 0) {
      return NextResponse.json({
        success: false,
        error: { 
          code: 'TAG_IN_USE', 
          message: '无法删除正在使用的标签，请先移除相关文章的标签关联' 
        }
      }, { status: 400 })
    }

    await prisma.tag.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '标签删除成功'
    })
  } catch (error) {
    console.error('Delete tag error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '删除标签失败' }
    }, { status: 500 })
  }
}
