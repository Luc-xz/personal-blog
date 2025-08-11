import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ success: false, error: { code: 'NO_FILE', message: '未选择文件' } }, { status: 400 })
    }

    // 类型校验
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_TYPE', message: '仅支持图片格式' } }, { status: 400 })
    }

    // 大小校验
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: { code: 'FILE_TOO_LARGE', message: '文件大小不能超过 5MB' } }, { status: 400 })
    }

    // 创建上传目录（按年月分层）
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const uploadPath = path.join(UPLOAD_DIR, String(year), month)
    
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true })
    }

    // 生成安全文件名
    const ext = path.extname(file.name)
    const filename = `${uuidv4()}${ext}`
    const filepath = path.join(uploadPath, filename)

    // 保存文件
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // 返回可访问的 URL
    const url = `/uploads/${year}/${month}/${filename}`
    
    return NextResponse.json({
      success: true,
      data: {
        url,
        filename,
        size: file.size,
        type: file.type
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: { code: 'UPLOAD_FAILED', message: '上传失败' } }, { status: 500 })
  }
}
