import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { getJwtSecretKey } from '@/server/env'

const PROTECTED_PREFIXES = ['/learn', '/lesson', '/review', '/profile', '/leaderboard', '/settings']

async function isAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('dd_token')?.value
  if (!token) return false
  // Ключ берём вне try: неверная конфигурация должна падать явно,
  // а не выглядеть как «просроченный токен» и молча редиректить на /auth.
  const key = getJwtSecretKey()
  try {
    await jwtVerify(token, key)
    return true
  } catch {
    return false
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const authed = await isAuthed(req)

  if (!authed && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (authed && pathname === '/auth') {
    const url = req.nextUrl.clone()
    url.pathname = '/learn'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/auth', '/learn/:path*', '/lesson/:path*', '/review/:path*', '/profile/:path*', '/leaderboard/:path*', '/settings/:path*']
}
