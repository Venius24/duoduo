import { NextResponse } from 'next/server'
import { getSessionUser } from '@/server/auth'
import { getStats } from '@/server/services/stats'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  return NextResponse.json(await getStats(user))
}
