import type { User } from '@prisma/client'
import { ACHIEVEMENT_MAP, evaluateAchievements } from '@/lib/achievements'
import { gemsForLesson, levelInfo, starsFor, xpForLesson } from '@/lib/levels'
import { freshSrsState } from '@/lib/srs'
import { dateStr, weekKeyStr, yesterdayStr } from '@/lib/utils'
import type { CompleteLessonInput, CompleteLessonResult } from '@/lib/types'
import { findLesson } from '@/content'
import { db } from '../db'

export async function completeLesson(
  user: User,
  input: CompleteLessonInput
): Promise<CompleteLessonResult> {
  const found = findLesson(input.courseId, input.unitId, input.lessonId)
  if (!found) throw new Error('LESSON_NOT_FOUND')

  const total = Math.max(1, Math.min(999, Math.floor(input.total)))
  const correct = Math.max(0, Math.min(total, Math.floor(input.correct)))
  const percent = Math.round((correct / total) * 100)
  const perfect = correct === total && total > 0
  const isBoss = !!found.lesson.isBoss

  let passed = true
  if (isBoss && found.lesson.passScore != null) {
    passed = correct >= found.lesson.passScore
  }

  const existing = await db.lessonProgress.findUnique({
    where: {
      userId_courseId_unitId_lessonId: {
        userId: user.id,
        courseId: input.courseId,
        unitId: input.unitId,
        lessonId: input.lessonId
      }
    }
  })
  const firstTime = !existing?.completedAt

  const xpGained = passed ? xpForLesson(isBoss, perfect, firstTime) : 0
  const gemsGained = passed ? gemsForLesson(isBoss, perfect) : 2
  const beforeLevel = levelInfo(user.xp).level

  const today = dateStr()
  let streak = user.streak
  if (user.lastActive !== today) {
    streak = user.lastActive === yesterdayStr() ? user.streak + 1 : 1
  }

  const stat = await db.dayStat.upsert({
    where: { userId_date: { userId: user.id, date: today } },
    create: { userId: user.id, date: today },
    update: {}
  })

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: {
        xp: { increment: xpGained },
        weeklyXp: { increment: xpGained },
        weekKey: weekKeyStr(),
        gems: { increment: gemsGained },
        streak,
        bestStreak: Math.max(user.bestStreak, streak),
        lastActive: today
      }
    }),
    db.dayStat.update({
      where: { id: stat.id },
      data: {
        xp: { increment: xpGained },
        lessons: { increment: passed ? 1 : 0 },
        correct: { increment: correct },
        perfectLessons: { increment: passed && perfect ? 1 : 0 }
      }
    }),
    ...(passed
      ? [
          db.lessonProgress.upsert({
            where: {
              userId_courseId_unitId_lessonId: {
                userId: user.id,
                courseId: input.courseId,
                unitId: input.unitId,
                lessonId: input.lessonId
              }
            },
            create: {
              userId: user.id,
              courseId: input.courseId,
              unitId: input.unitId,
              lessonId: input.lessonId,
              stars: starsFor(percent),
              bestPercent: percent,
              attempts: 1,
              completedAt: new Date()
            },
            update: {
              attempts: { increment: 1 },
              stars: Math.max(existing?.stars ?? 0, starsFor(percent)),
              bestPercent: Math.max(existing?.bestPercent ?? 0, percent),
              completedAt: new Date()
            }
          })
        ]
      : existing
        ? [db.lessonProgress.update({ where: { id: existing.id }, data: { attempts: { increment: 1 } } })]
        : [])
  ])

  const grade = perfect ? 5 : percent >= 60 ? 4 : 3
  for (const item of found.lesson.items) {
    const prev = await db.srsItem.findUnique({
      where: { userId_itemId: { userId: user.id, itemId: item.id } }
    })
    if (prev) continue
    const scheduled = freshSrsState(grade)
    await db.srsItem.create({
      data: {
        userId: user.id,
        itemId: item.id,
        courseId: input.courseId,
        ease: scheduled.ease,
        interval: scheduled.interval,
        reps: scheduled.reps,
        lapses: scheduled.lapses,
        dueAt: scheduled.dueAt
      }
    })
  }

  const finalUser = await db.user.findUniqueOrThrow({ where: { id: user.id } })
  const afterLevel = levelInfo(finalUser.xp).level
  const leveledUp = afterLevel > beforeLevel

  const [progressRows, srsCount] = await Promise.all([
    db.lessonProgress.findMany({ where: { userId: user.id } }),
    db.srsItem.count({ where: { userId: user.id } })
  ])
  const doneRows = progressRows.filter((r) => r.completedAt)
  const coursesStarted = new Set(progressRows.filter((r) => r.attempts > 0).map((r) => r.courseId)).size
  const hasBossWin = doneRows.some((r) => !!findLesson(r.courseId, r.unitId, r.lessonId)?.lesson.isBoss)

  const unlockedCodes = evaluateAchievements({
    totalLessons: doneRows.length,
    hasPerfect: doneRows.some((r) => r.stars === 3),
    hasBossWin,
    streak: finalUser.streak,
    xp: finalUser.xp,
    srsCount,
    coursesStarted,
    lastHour: new Date().getHours(),
    gems: finalUser.gems
  })

  const existingAch = await db.achievement.findMany({
    where: { userId: user.id, code: { in: unlockedCodes } },
    select: { code: true }
  })
  const haveSet = new Set(existingAch.map((a) => a.code))
  const toAdd = unlockedCodes.filter((c) => !haveSet.has(c))
  if (toAdd.length > 0) {
    await db.achievement.createMany({ data: toAdd.map((code) => ({ userId: user.id, code })) })
  }

  return {
    passed,
    firstTime,
    stars: passed ? starsFor(percent) : 0,
    percent,
    xpGained,
    gemsGained,
    streak,
    leveledUp,
    newLevel: leveledUp ? afterLevel : null,
    newAchievements: toAdd.map((code) => ACHIEVEMENT_MAP.get(code)).filter((d) => !!d),
    heartsLeft: finalUser.hearts,
    gemsLeft: finalUser.gems
  }
}
