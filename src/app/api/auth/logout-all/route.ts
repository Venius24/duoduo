import { NextResponse } from 'next/server'
import { clearAuthCookie, getSessionUser } from '@/server/auth'
import { db } from '@/server/db'

/** Отзывает все выданные токены пользователя, включая текущий. */
export async function POST() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  await db.user.update({ where: { id: user.id }, data: { tokenVersion: { increment: 1 } } })
  const res = NextResponse.json({ ok: true })
  await clearAuthCookie(res)
  return res
}
