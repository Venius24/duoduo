import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import type { NextResponse } from 'next/server'
import type { User } from '@prisma/client'
import { db } from './db'
import { cookieSecure, getJwtSecretKey } from './env'

const SECRET = getJwtSecretKey

export const AUTH_COOKIE = 'dd_token'

export async function signToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('30d').sign(SECRET())
}

export async function attachAuthCookie(res: NextResponse, token: string, req?: Request) {
  const isHttps = cookieSecure(req)
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isHttps,
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  })
}

export async function clearAuthCookie(res: NextResponse) {
  res.cookies.set(AUTH_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
}

export async function getSessionUser(): Promise<User | null> {
  const jar = await cookies()
  const token = jar.get(AUTH_COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, SECRET())
    if (!payload.sub || typeof payload.sub !== 'string') return null
    return await db.user.findUnique({ where: { id: payload.sub } })
  } catch {
    return null
  }
}
