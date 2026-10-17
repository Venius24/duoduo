import { NextResponse } from 'next/server'
import { getSessionUser } from '@/server/auth'
import { db } from '@/server/db'

export async function POST() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  await db.$transaction([
    db.lessonProgress.deleteMany({ where: { userId: user.id } }),
    db.srsItem.deleteMany({ where: { userId: user.id } }),
    db.dayStat.deleteMany({ where: { userId: user.id } }),
    db.achievement.deleteMany({ where: { userId: user.id } }),
    db.lessonAttempt.deleteMany({ where: { userId: user.id } }),
    db.user.update({
      where: { id: user.id },
      data: {
        xp: 0,
        gems: 500,
        hearts: user.heartsMax,
        streak: 0,
        bestStreak: 0,
        lastActive: null,
        weeklyXp: 0,
        weekKey: ''
      }
    })
  ])
  return NextResponse.json({ ok: true })
}
