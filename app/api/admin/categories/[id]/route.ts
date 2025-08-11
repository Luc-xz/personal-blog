import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50),
  description: z.string().optional()
})

// 获取单个分类
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const id = parseInt(params.id)

    const category = await prisma.category.findUnique({
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

    if (!category) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: '分类不存在' }
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...category,
        postCount: category.posts.length
      }
    })
  } catch (error) {
    console.error('Get category error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '获取分类失败' }
    }, { status: 500 })
  }
}

// 更新分类
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const id = parseInt(params.id)
    const body = await request.json()
    
    const validationResult = categorySchema.safeParse(body)
    
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

    const { name, slug, description } = validationResult.data

    // 检查 slug 是否已被其他分类使用
    const existing = await prisma.category.findFirst({
      where: { slug, id: { not: id } }
    })
    if (existing) {
      return NextResponse.json({
        success: false,
        error: { code: 'SLUG_EXISTS', message: 'Slug 已被其他分类使用' }
      }, { status: 400 })
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, description }
    })

    return NextResponse.json({
      success: true,
      data: category,
      message: '分类更新成功'
    })
  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '更新分类失败' }
    }, { status: 500 })
  }
}

// 删除单个分类
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const id = parseInt(params.id)

    // 检查是否有文章使用此分类
    const postsUsingCategory = await prisma.postCategory.findMany({
      where: { categoryId: id },
      include: { post: { select: { title: true } } }
    })

    if (postsUsingCategory.length > 0) {
      return NextResponse.json({
        success: false,
        error: { 
          code: 'CATEGORY_IN_USE', 
          message: '无法删除正在使用的分类，请先移除相关文章的分类关联' 
        }
      }, { status: 400 })
    }

    await prisma.category.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '分类删除成功'
    })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '删除分类失败' }
    }, { status: 500 })
  }
}
