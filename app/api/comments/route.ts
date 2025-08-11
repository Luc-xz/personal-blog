import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { rateLimit, getClientIP } from '@/lib/rate-limit'
import { z } from 'zod'

const commentSchema = z.object({
  postId: z.number().int().positive(),
  author: z.string().min(1).max(50),
  email: z.string().email().optional().or(z.literal('')),
  content: z.string().min(1).max(1000)
})

// 简单的敏感词过滤
const sensitiveWords = ['垃圾', '广告', 'spam', '色情']

function containsSensitiveWords(content: string): boolean {
  return sensitiveWords.some(word => content.toLowerCase().includes(word.toLowerCase()))
}

export async function POST(request: NextRequest) {
  try {
    // 限流检查
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`comment:${clientIP}`, {
      windowMs: 15 * 60 * 1000, // 15分钟
      maxRequests: 5 // 最多5条评论
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `评论过于频繁，请${Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000)}分钟后再试`
        }
      }, { status: 429 })
    }

    // 解析请求体
    const body = await request.json()
    const validationResult = commentSchema.safeParse(body)
    
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

    const { postId, author, email, content } = validationResult.data

    // 检查文章是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId, status: 'PUBLISHED' as any }
    })

    if (!post) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: '文章不存在或未发布'
        }
      }, { status: 404 })
    }

    // 敏感词检查
    if (containsSensitiveWords(content) || containsSensitiveWords(author)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CONTENT_REJECTED',
          message: '评论内容包含敏感词，请修改后重试'
        }
      }, { status: 400 })
    }

    // 创建评论（默认待审核状态）
    const comment = await prisma.comment.create({
      data: {
        postId,
        author,
        email: email || null,
        content,
        status: 'PENDING',
        ipHash: clientIP,
        createdAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: comment.id,
        author: comment.author,
        content: comment.content,
        createdAt: comment.createdAt,
        status: comment.status
      },
      message: '评论提交成功，等待审核'
    })

  } catch (error) {
    console.error('Comment submission error:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '提交失败，请稍后重试'
      }
    }, { status: 500 })
  }
}

// 获取文章评论列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json({
        success: false,
        error: { code: 'MISSING_POST_ID', message: '缺少文章ID' }
      }, { status: 400 })
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId: parseInt(postId),
        status: 'APPROVED'
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        author: true,
        content: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: comments
    })

  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '获取评论失败' }
    }, { status: 500 })
  }
}
