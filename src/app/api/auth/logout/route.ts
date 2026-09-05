import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/server/auth'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  await clearAuthCookie(res)
  return res
}
