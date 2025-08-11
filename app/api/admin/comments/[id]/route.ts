import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 更新单个评论状态
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const id = parseInt(params.id)
    const body = await request.json()
    const { status } = body

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_STATUS', message: '无效的状态' }
      }, { status: 400 })
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { status },
      include: {
        post: {
          select: { title: true, slug: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: comment,
      message: `评论已${status === 'APPROVED' ? '通过' : status === 'REJECTED' ? '拒绝' : '设为待审'}`
    })
  } catch (error) {
    console.error('Update comment error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '更新失败' }
    }, { status: 500 })
  }
}

// 删除单个评论
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const id = parseInt(params.id)

    await prisma.comment.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '评论已删除'
    })
  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '删除失败' }
    }, { status: 500 })
  }
}
