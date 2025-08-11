import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import archiver from 'archiver'
import { Readable } from 'stream'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // 导出数据库数据
    const [posts, categories, tags, comments, siteConfigs] = await Promise.all([
      prisma.post.findMany({
        include: {
          categories: { include: { category: true } },
          tags: { include: { tag: true } }
        }
      }),
      prisma.category.findMany(),
      prisma.tag.findMany(),
      prisma.comment.findMany(),
      prisma.siteConfig.findMany()
    ])

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        posts,
        categories,
        tags,
        comments,
        siteConfigs
      }
    }

    // 创建 ZIP 文件
    const archive = archiver('zip', { zlib: { level: 9 } })
    
    // 添加数据库导出文件
    archive.append(JSON.stringify(exportData, null, 2), { name: 'database.json' })

    // 添加上传的文件（如果存在）
    const uploadsDir = path.join(process.cwd(), 'uploads')
    if (fs.existsSync(uploadsDir)) {
      archive.directory(uploadsDir, 'uploads')
    }

    // 添加 README
    const readme = `# 博客备份文件

导出时间: ${new Date().toLocaleString('zh-CN')}
版本: ${exportData.version}

## 文件说明
- database.json: 数据库数据导出
- uploads/: 上传的媒体文件

## 恢复说明
使用后台的"导入备份"功能恢复数据。
`
    archive.append(readme, { name: 'README.md' })

    // 完成归档
    archive.finalize()

    // 转换为 ReadableStream
    const chunks: Buffer[] = []
    archive.on('data', (chunk) => chunks.push(chunk))
    
    return new Promise<NextResponse>((resolve, reject) => {
      archive.on('end', () => {
        const buffer = Buffer.concat(chunks)
        const filename = `blog-backup-${new Date().toISOString().split('T')[0]}.zip`
        
        resolve(new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length.toString()
          }
        }))
      })
      
      archive.on('error', (err) => {
        console.error('Archive error:', err)
        reject(new NextResponse(JSON.stringify({
          success: false,
          error: { code: 'ARCHIVE_ERROR', message: '创建备份文件失败' }
        }), { status: 500 }))
      })
    })

  } catch (error) {
    console.error('Export backup error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '导出备份失败' }
    }, { status: 500 })
  }
}
