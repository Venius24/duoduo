import { NextResponse, type NextRequest } from 'next/server'
import { getSessionUser } from '@/server/auth'
import { getDueItems } from '@/server/services/review'

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const limitParam = Number(req.nextUrl.searchParams.get('limit') || 12)
  const limit = Math.max(4, Math.min(30, Math.floor(limitParam) || 12))
  const items = await getDueItems(user, limit)
  return NextResponse.json({ items })
}
