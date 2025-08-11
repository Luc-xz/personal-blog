import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { lookup } from 'mime-types'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  try {
    const params = await context.params
    const filePath = path.join(UPLOAD_DIR, ...params.path)
    
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 })
    }

    const file = await readFile(filePath)
    const mimeType = lookup(filePath) || 'application/octet-stream'
    
    return new NextResponse(file as any, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error) {
    console.error('Static file serve error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
