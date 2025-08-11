import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 获取评论列表（后台管理）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // PENDING, APPROVED, REJECTED
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where = status ? { status: status as any } : {}

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          post: {
            select: { id: true, title: true, slug: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.comment.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get admin comments error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '获取评论失败' }
    }, { status: 500 })
  }
}

// 批量操作评论
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { commentIds, action } = body // action: 'approve', 'reject', 'delete'

    if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_INPUT', message: '请选择要操作的评论' }
      }, { status: 400 })
    }

    let result
    switch (action) {
      case 'approve':
        result = await prisma.comment.updateMany({
          where: { id: { in: commentIds } },
          data: { status: 'APPROVED' }
        })
        break
      case 'reject':
        result = await prisma.comment.updateMany({
          where: { id: { in: commentIds } },
          data: { status: 'REJECTED' }
        })
        break
      case 'delete':
        result = await prisma.comment.deleteMany({
          where: { id: { in: commentIds } }
        })
        break
      default:
        return NextResponse.json({
          success: false,
          error: { code: 'INVALID_ACTION', message: '无效的操作' }
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: { affected: result.count },
      message: `成功${action === 'approve' ? '通过' : action === 'reject' ? '拒绝' : '删除'}了 ${result.count} 条评论`
    })
  } catch (error) {
    console.error('Batch comment operation error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '操作失败' }
    }, { status: 500 })
  }
}
