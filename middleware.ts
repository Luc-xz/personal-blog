import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const cookieName = 'session'
const secret = new TextEncoder().encode(process.env.SESSION_SECRET || 'dev-secret')

const ADMIN_PREFIX = '/admin'

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith(ADMIN_PREFIX)) return NextResponse.next()
  const token = req.cookies.get(cookieName)?.value
  if (!token) return NextResponse.redirect(new URL('/login', req.url))
  try {
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = { matcher: ['/admin/:path*'] }

