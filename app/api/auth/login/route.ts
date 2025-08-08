import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { signSession, setSessionCookie } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const { username, password } = await req.json()
  if (!username || !password) return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: '缺少参数' } }, { status: 400 })

  // 若数据库无用户且 .env 提供管理员，则首登时自动创建管理员（便于 .env 初始化场景）
  const userCount = await prisma.user.count()
  if (userCount === 0 && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      const hash = await bcrypt.hash(password, 10)
      const created = await prisma.user.create({ data: { username, password: hash } })
      const token = await signSession({ uid: created.id })
      const res = NextResponse.json({ success: true, data: { uid: created.id, username: created.username } })
      await setSessionCookie(res, token)
      return res
    }
  }

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) return NextResponse.json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: '用户名或密码错误' } }, { status: 401 })
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return NextResponse.json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: '用户名或密码错误' } }, { status: 401 })
  const token = await signSession({ uid: user.id })
  const res = NextResponse.json({ success: true, data: { uid: user.id, username: user.username } })
  await setSessionCookie(res, token)
  return res
}

