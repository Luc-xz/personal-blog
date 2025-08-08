import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { NextResponse } from 'next/server'

export const cookieName = 'session'
const secret = new TextEncoder().encode(process.env.SESSION_SECRET || 'dev-secret')

export async function signSession(payload: { uid: number }) {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
  return jwt
}

export async function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(cookieName, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' })
}

export async function getSession() {
  const store = await cookies()
  const token = store.get(cookieName)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as any
  } catch {
    return null
  }
}

export function clearSessionOnResponse(res: NextResponse) {
  res.cookies.delete(cookieName)
}

