import { levelInfo } from '@/lib/levels'
import { buildQuests } from '@/lib/quests'
import { dateStr, weekKeyStr } from '@/lib/utils'
import type { DayStat, User } from '@prisma/client'
import type { MePayload } from '@/lib/types'
import { db } from '../db'

export const HEART_REGEN_MS = 20 * 60 * 1000

function cloneUser(u: User, patch: Partial<User>): User {
  return { ...u, ...patch }
}

export async function refreshUserState(user: User): Promise<User> {
  const patch: Partial<User> = {}
  let heartsUpdated = user.heartsUpdated

  if (user.hearts < user.heartsMax) {
    const elapsed = Date.now() - new Date(heartsUpdated).getTime()
    const gained = Math.floor(elapsed / HEART_REGEN_MS)
    if (gained > 0) {
      const hearts = Math.min(user.heartsMax, user.hearts + gained)
      patch.hearts = hearts
      heartsUpdated =
        hearts >= user.heartsMax
          ? new Date()
          : new Date(new Date(heartsUpdated).getTime() + gained * HEART_REGEN_MS)
      patch.heartsUpdated = heartsUpdated
    }
  }

  const wk = weekKeyStr()
  if (user.weekKey !== wk) {
    patch.weekKey = wk
    patch.weeklyXp = 0
  }

  if (Object.keys(patch).length === 0) return user
  const updated = await db.user.update({ where: { id: user.id }, data: patch })
  return cloneUser(user, updated)
}

export async function getOrCreateDayStat(userId: string): Promise<DayStat> {
  const date = dateStr()
  const existing = await db.dayStat.findUnique({ where: { userId_date: { userId, date } } })
  if (existing) return existing
  return db.dayStat.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date },
    update: {}
  })
}

export async function buildMePayload(input: User): Promise<MePayload> {
  let user = await refreshUserState(input)
  let stat = await getOrCreateDayStat(user.id)

  const claimedIds = stat.questClaimed ? stat.questClaimed.split(',').filter(Boolean) : []
  const quests = buildQuests(user.dailyGoal, stat, claimedIds)
  const newlyDone = quests.filter((q) => q.done && !q.claimed)

  if (newlyDone.length > 0) {
    const reward = newlyDone.reduce((sum, q) => sum + q.reward, 0)
    const claimedSet = new Set(claimedIds)
    newlyDone.forEach((q) => claimedSet.add(q.id))
    const [updatedStat, updatedUser] = await db.$transaction([
      db.dayStat.update({
        where: { id: stat.id },
        data: { questClaimed: [...claimedSet].join(',') }
      }),
      db.user.update({ where: { id: user.id }, data: { gems: { increment: reward } } })
    ])
    stat = updatedStat
    user = cloneUser(user, { gems: updatedUser.gems })
    for (const q of quests) {
      if (claimedSet.has(q.id)) q.claimed = true
    }
  }

  const [progressRows, dueCount] = await Promise.all([
    db.lessonProgress.findMany({ where: { userId: user.id } }),
    db.srsItem.count({ where: { userId: user.id, dueAt: { lte: new Date() } } })
  ])

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      color: user.color,
      xp: user.xp,
      gems: user.gems,
      hearts: user.hearts,
      heartsMax: user.heartsMax,
      streak: user.streak,
      bestStreak: user.bestStreak,
      dailyGoal: user.dailyGoal,
      ttsRate: user.ttsRate,
      activeCourse: user.activeCourse,
      level: levelInfo(user.xp)
    },
    today: {
      xp: stat.xp,
      lessons: stat.lessons,
      correct: stat.correct,
      perfectLessons: stat.perfectLessons,
      reviews: stat.reviews
    },
    quests,
    progress: progressRows.map((p) => ({
      courseId: p.courseId,
      unitId: p.unitId,
      lessonId: p.lessonId,
      stars: p.stars,
      completed: !!p.completedAt
    })),
    dueCount,
    weekXp: user.weeklyXp
  }
}
