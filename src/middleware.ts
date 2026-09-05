import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const PROTECTED_PREFIXES = ['/learn', '/lesson', '/review', '/profile', '/leaderboard', '/settings']

async function isAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('dd_token')?.value
  if (!token) return false
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me'))
    return true
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
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
