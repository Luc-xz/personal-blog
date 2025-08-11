import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50),
  description: z.string().optional()
})

// 获取分类列表
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
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
      data: categories.map(cat => ({
        ...cat,
        postCount: cat.posts.length
      }))
    })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '获取分类失败' }
    }, { status: 500 })
  }
}

// 创建分类
export async function POST(request: NextRequest) {
  try {
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

    // 检查 slug 是否已存在
    const existing = await prisma.category.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({
        success: false,
        error: { code: 'SLUG_EXISTS', message: 'Slug 已存在' }
      }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: { name, slug, description }
    })

    return NextResponse.json({
      success: true,
      data: category,
      message: '分类创建成功'
    })
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '创建分类失败' }
    }, { status: 500 })
  }
}

// 批量删除分类
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoryIds } = body

    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_INPUT', message: '请选择要删除的分类' }
      }, { status: 400 })
    }

    // 检查是否有文章使用这些分类
    const postsUsingCategories = await prisma.postCategory.findMany({
      where: { categoryId: { in: categoryIds } },
      include: { post: { select: { title: true } } }
    })

    if (postsUsingCategories.length > 0) {
      return NextResponse.json({
        success: false,
        error: { 
          code: 'CATEGORY_IN_USE', 
          message: '无法删除正在使用的分类，请先移除相关文章的分类关联' 
        }
      }, { status: 400 })
    }

    const result = await prisma.category.deleteMany({
      where: { id: { in: categoryIds } }
    })

    return NextResponse.json({
      success: true,
      data: { affected: result.count },
      message: `成功删除了 ${result.count} 个分类`
    })
  } catch (error) {
    console.error('Delete categories error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '删除分类失败' }
    }, { status: 500 })
  }
}
