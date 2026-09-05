import type { User } from '@prisma/client'
import { nextSchedule } from '@/lib/srs'
import { weekKeyStr } from '@/lib/utils'
import { getItem } from '@/content'
import { db } from '../db'
import { getOrCreateDayStat } from './users'

export async function getDueItems(user: User, limit = 12) {
  const rows = await db.srsItem.findMany({
    where: { userId: user.id, courseId: user.activeCourse, dueAt: { lte: new Date() } },
    orderBy: { dueAt: 'asc' },
    take: limit
  })
  return rows
    .map((r) => {
      const item = getItem(r.itemId)
      return item ? { ...item, dueAt: r.dueAt.toISOString() } : null
    })
    .filter((x): x is NonNullable<typeof x> => !!x)
}

export async function gradeReview(user: User, itemId: string, grade: number) {
  const row = await db.srsItem.findUnique({
    where: { userId_itemId: { userId: user.id, itemId } }
  })
  if (!row) throw new Error('ITEM_NOT_FOUND')

  const clamped = Math.max(0, Math.min(5, Math.floor(grade)))
  const scheduled = nextSchedule(row, clamped)
  await db.srsItem.update({
    where: { id: row.id },
    data: {
      ease: scheduled.ease,
      interval: scheduled.interval,
      reps: scheduled.reps,
      lapses: scheduled.lapses,
      dueAt: scheduled.dueAt
    }
  })

  if (clamped >= 3) {
    const stat = await getOrCreateDayStat(user.id)
    await db.$transaction([
      db.dayStat.update({ where: { id: stat.id }, data: { reviews: { increment: 1 }, correct: { increment: 1 }, xp: { increment: 2 } } }),
      db.user.update({ where: { id: user.id }, data: { xp: { increment: 2 }, weeklyXp: { increment: 2 }, weekKey: weekKeyStr() } })
    ])
  }

  return {
    intervalDays: scheduled.interval,
    dueAt: scheduled.dueAt.toISOString(),
    ease: scheduled.ease
  }
}
