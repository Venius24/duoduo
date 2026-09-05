import { NextResponse } from 'next/server'
import { getSessionUser } from '@/server/auth'
import { getLeaderboard } from '@/server/services/leaderboard'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const entries = await getLeaderboard(user)
  return NextResponse.json({ entries, weekXp: user.weeklyXp })
}
