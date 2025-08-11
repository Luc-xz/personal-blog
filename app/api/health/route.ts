import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // 检查数据库连接
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: (error as Error).message
    }, { status: 500 })
  }
}
