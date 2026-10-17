import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import type { NextResponse } from 'next/server'
import type { User } from '@prisma/client'
import { db } from './db'
import { cookieSecure, getJwtSecretKey } from './env'

const SECRET = getJwtSecretKey

export const AUTH_COOKIE = 'dd_token'

/**
 * `v` — версия токенов пользователя. «Выйти на всех устройствах» увеличивает
 * `User.tokenVersion`, и все ранее выданные токены перестают приниматься.
 */
export async function signToken(userId: string, version = 0): Promise<string> {
  return new SignJWT({ sub: userId, v: version }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('30d').sign(SECRET())
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

/** Токен → пользователь. Отдельно от cookies(), чтобы проверять отзыв в тестах. */
export async function userFromToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET())
    if (!payload.sub || typeof payload.sub !== 'string') return null
    const user = await db.user.findUnique({ where: { id: payload.sub } })
    if (!user) return null
    const version = typeof payload.v === 'number' ? payload.v : 0
    return version === user.tokenVersion ? user : null
  } catch {
    return null
  }
}

export async function getSessionUser(): Promise<User | null> {
  const jar = await cookies()
  const token = jar.get(AUTH_COOKIE)?.value
  return token ? userFromToken(token) : null
}
