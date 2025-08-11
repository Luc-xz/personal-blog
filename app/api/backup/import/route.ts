import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import AdmZip from 'adm-zip'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('backup') as File
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: { code: 'NO_FILE', message: '请选择备份文件' }
      }, { status: 400 })
    }

    if (!file.name.endsWith('.zip')) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_FILE', message: '请上传 ZIP 格式的备份文件' }
      }, { status: 400 })
    }

    // 读取 ZIP 文件
    const buffer = Buffer.from(await file.arrayBuffer())
    const zip = new AdmZip(buffer)
    const zipEntries = zip.getEntries()

    // 查找数据库文件
    const dbEntry = zipEntries.find(entry => entry.entryName === 'database.json')
    if (!dbEntry) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_BACKUP', message: '备份文件格式不正确，缺少数据库文件' }
      }, { status: 400 })
    }

    // 解析数据库数据
    const dbData = JSON.parse(dbEntry.getData().toString('utf8'))
    
    if (!dbData.data) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_DATA', message: '备份文件数据格式不正确' }
      }, { status: 400 })
    }

    // 开始事务导入
    await prisma.$transaction(async (tx) => {
      // 清空现有数据（谨慎操作）
      await tx.postTag.deleteMany()
      await tx.postCategory.deleteMany()
      await tx.comment.deleteMany()
      await tx.post.deleteMany()
      await tx.tag.deleteMany()
      await tx.category.deleteMany()
      await tx.siteConfig.deleteMany()

      // 导入分类
      if (dbData.data.categories?.length > 0) {
        for (const category of dbData.data.categories) {
          await tx.category.create({
            data: {
              id: category.id,
              name: category.name,
              slug: category.slug,
              description: category.description
            }
          })
        }
      }

      // 导入标签
      if (dbData.data.tags?.length > 0) {
        for (const tag of dbData.data.tags) {
          await tx.tag.create({
            data: {
              id: tag.id,
              name: tag.name,
              slug: tag.slug
            }
          })
        }
      }

      // 导入文章
      if (dbData.data.posts?.length > 0) {
        for (const post of dbData.data.posts) {
          const createdPost = await tx.post.create({
            data: {
              id: post.id,
              title: post.title,
              slug: post.slug,
              summary: post.summary,
              content: post.content,
              contentHtml: post.contentHtml,
              coverUrl: post.coverUrl,
              status: post.status,
              publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
              createdAt: new Date(post.createdAt),
              updatedAt: new Date(post.updatedAt)
            }
          })

          // 导入文章分类关联
          if (post.categories?.length > 0) {
            for (const pc of post.categories) {
              await tx.postCategory.create({
                data: {
                  postId: createdPost.id,
                  categoryId: pc.categoryId
                }
              })
            }
          }

          // 导入文章标签关联
          if (post.tags?.length > 0) {
            for (const pt of post.tags) {
              await tx.postTag.create({
                data: {
                  postId: createdPost.id,
                  tagId: pt.tagId
                }
              })
            }
          }
        }
      }

      // 导入评论
      if (dbData.data.comments?.length > 0) {
        for (const comment of dbData.data.comments) {
          await tx.comment.create({
            data: {
              id: comment.id,
              postId: comment.postId,
              author: comment.author,
              email: comment.email,
              content: comment.content,
              status: comment.status,
              ipHash: comment.ipHash,
              createdAt: new Date(comment.createdAt)
            }
          })
        }
      }

      // 导入站点配置
      if (dbData.data.siteConfigs?.length > 0) {
        for (const config of dbData.data.siteConfigs) {
          await tx.siteConfig.create({
            data: {
              key: config.key,
              value: config.value
            }
          })
        }
      }
    })

    // 恢复上传文件
    const uploadsDir = path.join(process.cwd(), 'uploads')
    const uploadEntries = zipEntries.filter(entry => entry.entryName.startsWith('uploads/'))
    
    if (uploadEntries.length > 0) {
      // 确保上传目录存在
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }

      for (const entry of uploadEntries) {
        if (!entry.isDirectory) {
          const filePath = path.join(process.cwd(), entry.entryName)
          const fileDir = path.dirname(filePath)
          
          // 确保目录存在
          if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, { recursive: true })
          }
          
          // 写入文件
          fs.writeFileSync(filePath, entry.getData())
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: '备份导入成功',
      data: {
        importDate: new Date().toISOString(),
        stats: {
          posts: dbData.data.posts?.length || 0,
          categories: dbData.data.categories?.length || 0,
          tags: dbData.data.tags?.length || 0,
          comments: dbData.data.comments?.length || 0,
          files: uploadEntries.filter(e => !e.isDirectory).length
        }
      }
    })

  } catch (error) {
    console.error('Import backup error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '导入备份失败: ' + (error as Error).message }
    }, { status: 500 })
  }
}
