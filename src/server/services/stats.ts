import type { User } from '@prisma/client'
import { ACHIEVEMENT_DEFS } from '@/lib/achievements'
import { levelInfo } from '@/lib/levels'
import type { StatsPayload } from '@/lib/types'
import { courseList, flatLessons } from '@/content'
import { db } from '../db'
import { refreshUserState } from './users'

export async function getStats(input: User): Promise<StatsPayload> {
  const user = await refreshUserState(input)
  const [progressRows, srsCount, daysActive, agg] = await Promise.all([
    db.lessonProgress.findMany({ where: { userId: user.id }, select: { courseId: true, completedAt: true, stars: true } }),
    db.srsItem.count({ where: { userId: user.id } }),
    db.dayStat.count({ where: { userId: user.id } }),
    db.dayStat.aggregate({ where: { userId: user.id }, _max: { xp: true }, _sum: { correct: true } })
  ])

  const doneRows = progressRows.filter((r) => r.completedAt)
  const courseStats = courseList.map((course) => {
    const total = flatLessons(course).length
    const done = doneRows.filter((r) => r.courseId === course.id).length
    return { courseId: course.id, done, total, percent: total ? Math.round((done / total) * 100) : 0 }
  })

  const unlocked = await db.achievement.findMany({
    where: { userId: user.id },
    select: { code: true, unlockedAt: true }
  })
  const map = new Map(unlocked.map((a) => [a.code, a.unlockedAt]))

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
    lessonsDone: doneRows.length,
    perfectCount: doneRows.filter((r) => r.stars === 3).length,
    srsCount,
    daysActive,
    totalCorrect: agg._sum.correct ?? 0,
    maxXpDay: agg._max.xp ?? 0,
    courseStats,
    achievements: ACHIEVEMENT_DEFS.map((def) => ({
      def,
      unlockedAt: map.get(def.code)?.toISOString() ?? null
    }))
  }
}
