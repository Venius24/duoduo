import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/server/db'
import { signToken, userFromToken } from '@/server/auth'
import { AuthError, loginUser, registerUser } from '@/server/services/authService'
import { AttemptError, startAttempt } from '@/server/services/attempts'
import { completeLesson } from '@/server/services/lessons'
import { gradeReview, getDueItems } from '@/server/services/review'
import { getLeaderboard } from '@/server/services/leaderboard'
import { buildMePayload, refreshUserState } from '@/server/services/users'
import { findLesson } from '@/content'
import type { CompleteLessonInput } from '@/lib/types'
import type { User } from '@prisma/client'

/** Проходит урок как настоящий клиент: сначала попытка, затем результат. */
async function playLesson(
  user: User,
  input: Omit<CompleteLessonInput, 'attemptId'>,
  opts: { elapsedMs?: number } = {}
) {
  const { attemptId } = await startAttempt(user, input.courseId, input.unitId, input.lessonId)
  await db.lessonAttempt.update({
    where: { id: attemptId },
    data: { startedAt: new Date(Date.now() - (opts.elapsedMs ?? 10 * 60 * 1000)) }
  })
  return completeLesson(user, { ...input, attemptId })
}

async function cleanup() {
  await db.lessonAttempt.deleteMany()
  await db.achievement.deleteMany()
  await db.dayStat.deleteMany()
  await db.srsItem.deleteMany()
  await db.lessonProgress.deleteMany()
  await db.user.deleteMany()
}

beforeEach(() => cleanup())

describe('authService', () => {
  it('регистрирует и находит пользователя', async () => {
    const u = await registerUser('Test@Mail.ru', 'Тест', 'secret1', '#58CC02')
    expect(u.email).toBe('test@mail.ru')
    expect(u.name).toBe('Тест')
    expect(await loginUser('test@mail.ru', 'secret1')).toBeTruthy()
  })

  it('отклоняет дубликат и мусор', async () => {
    await registerUser('dup@mail.ru', 'Дуп', 'secret1', '#000')
    await expect(registerUser('dup@mail.ru', 'Два', 'secret2', '#000')).rejects.toThrow(AuthError)
    await expect(registerUser('не-email', 'Кто', 'secret1', '#000')).rejects.toThrow('BAD_EMAIL')
    await expect(loginUser('ghost@mail.ru', 'whatever')).rejects.toThrow('BAD_CREDENTIALS')
    const u = await registerUser('pw@mail.ru', 'Пароль', 'secret1', '#000')
    await expect(loginUser('pw@mail.ru', 'wrong!')).rejects.toThrow('BAD_CREDENTIALS')
    expect(u.passwordHash).not.toContain('secret1')
  })
})

describe('completeLesson', () => {
  it('идеальное первое прохождение: xp, звёзды, SRS, статистика', async () => {
    const user = await registerUser('flow@mail.ru', 'Флоу', 'secret1', '#111')
    const l = findLesson('en', 'u1', 'l1')!
    const total = l.lesson.exercises.length

    const res = await playLesson(user, {
      courseId: 'en',
      unitId: 'u1',
      lessonId: 'l1',
      correct: total,
      total,
      seconds: 90
    })

    expect(res.passed).toBe(true)
    expect(res.firstTime).toBe(true)
    expect(res.percent).toBe(100)
    expect(res.stars).toBe(3)
    expect(res.xpGained).toBe(18)
    expect(res.gemsGained).toBe(10)
    expect(res.streak).toBe(1)

    const progress = await db.lessonProgress.findUnique({
      where: {
        userId_courseId_unitId_lessonId: {
          userId: user.id,
          courseId: 'en',
          unitId: 'u1',
          lessonId: 'l1'
        }
      }
    })
    expect(progress?.completedAt).toBeTruthy()
    expect(progress?.stars).toBe(3)

    const srsRows = await db.srsItem.findMany({ where: { userId: user.id } })
    expect(srsRows.length).toBe(l.lesson.items.length)
    expect(srsRows.every((r) => r.dueAt > new Date())).toBe(true)

    const stat = await db.dayStat.findFirst({ where: { userId: user.id } })
    expect(stat?.xp).toBe(18)
    expect(stat?.lessons).toBe(1)
    expect(stat?.perfectLessons).toBe(1)

    expect(res.newAchievements.map((a) => a.code)).toContain('first_lesson')
    expect(res.newAchievements.map((a) => a.code)).toContain('perfect_lesson')
  })

  it('повторное прохождение даёт меньше XP', async () => {
    const user = await registerUser('rep@mail.ru', 'Репит', 'secret1', '#222')
    const l = findLesson('en', 'u1', 'l1')!
    const total = l.lesson.exercises.length
    const input = { courseId: 'en', unitId: 'u1', lessonId: 'l1', correct: total - 2, total, seconds: 50 } as const

    const first = await playLesson(user, input)
    const second = await playLesson(user, input)

    expect(first.firstTime).toBe(true)
    expect(second.firstTime).toBe(false)
    expect(second.xpGained).toBeLessThan(first.xpGained)
    expect(second.stars).toBe(first.stars)
  })

  it('проигранный босс не завершает урок', async () => {
    const user = await registerUser('boss@mail.ru', 'Боссов', 'secret1', '#333')
    const boss = findLesson('en', 'u1', 'boss')!
    const total = 26

    const res = await playLesson(user, {
      courseId: 'en',
      unitId: 'u1',
      lessonId: 'boss',
      correct: 3,
      total,
      seconds: 95
    })

    expect(boss.lesson.isBoss).toBe(true)
    expect(res.passed).toBe(false)
    expect(res.stars).toBe(0)

    const row = await db.lessonProgress.findFirst({ where: { userId: user.id } })
    expect(row).toBeNull()

    const win = await playLesson(user, {
      courseId: 'en',
      unitId: 'u1',
      lessonId: 'boss',
      correct: boss.lesson.passScore ?? 10,
      total,
      seconds: 80
    })
    expect(win.passed).toBe(true)
    expect(win.newAchievements.map((a) => a.code)).toContain('boss_slayer')
  })
})

describe('SRS review flow', () => {
  it('grade двигает интервалы, провал возвращает слово скоро', async () => {
    const user = await registerUser('srs@mail.ru', 'ЭсЭрЭс', 'secret1', '#444')
    const l = findLesson('zh', 'u1', 'l1')!
    await playLesson(user, {
      courseId: 'zh',
      unitId: 'u1',
      lessonId: 'l1',
      correct: l.lesson.exercises.length,
      total: l.lesson.exercises.length,
      seconds: 60
    })

    let row = await db.srsItem.findFirst({ where: { userId: user.id } })!
    const itemId = row!.itemId

    const g1 = await gradeReview(user, itemId, 5)
    expect(g1.intervalDays).toBeGreaterThanOrEqual(1)
    row = await db.srsItem.findUnique({ where: { userId_itemId: { userId: user.id, itemId } } })
    expect(row?.reps).toBe(2)

    const gFail = await gradeReview(user, itemId, 0)
    expect(gFail.intervalDays).toBe(0)
    row = await db.srsItem.findUnique({ where: { userId_itemId: { userId: user.id, itemId } } })
    expect(row?.reps).toBe(0)
    expect(row?.lapses).toBe(1)
    expect(row!.dueAt.getTime() - Date.now()).toBeLessThan(15 * 60 * 1000)

    await db.srsItem.update({ where: { id: row!.id }, data: { dueAt: new Date(Date.now() - 1000) } })
    const due = await getDueItems({ ...user, activeCourse: 'zh' }, 12)
    expect(due.some((d) => d.id === itemId)).toBe(true)
  })
})

describe('leaderboard', () => {
  it('сортирует по weeklyXp и включает ботов', async () => {
    const me = await registerUser('me@mail.ru', 'ЯСам', 'secret1', '#555')
    await db.user.update({ where: { id: me.id }, data: { weeklyXp: 120 } })
    await db.user.create({
      data: { email: 'b1@local', name: 'Бот1', passwordHash: 'x', role: 'bot', color: '#000', weeklyXp: 400, xp: 900 }
    })
    await db.user.create({
      data: { email: 'b2@local', name: 'Бот2', passwordHash: 'x', role: 'bot', color: '#111', weeklyXp: 50, xp: 300 }
    })

    const entries = await getLeaderboard(me)
    expect(entries.length).toBeGreaterThanOrEqual(3)
    expect(entries[0].name).toBe('Бот1')
    expect(entries[0].weeklyXp).toBeLessThanOrEqual(400)
    const mine = entries.find((e) => e.isMe)!
    expect(mine.weeklyXp).toBe(120)
  })
})

describe('buildMePayload: квесты начисляют алмазы один раз', () => {
  it('клеймит квестов идемпотентен', async () => {
    const user = await registerUser('quest@mail.ru', 'Квестер', 'secret1', '#666')
    const stat = await db.dayStat.create({
      data: { userId: user.id, date: new Date().toISOString().slice(0, 10), xp: 100, lessons: 5, correct: 30, perfectLessons: 1, reviews: 10 }
    })

    const p1 = await buildMePayload(user)
    expect(p1.quests.every((q) => q.claimed)).toBe(true)
    expect(p1.user.gems).toBe(500 + 105)

    const p2 = await buildMePayload(await db.user.findUniqueOrThrow({ where: { id: user.id } }))
    expect(p2.user.gems).toBe(500 + 105)
    void stat
  })
})

describe('refreshUserState: регенерация сердец и смена недели', () => {
  it('восстанавливает сердца по времени', async () => {
    const user = await registerUser('hearts@mail.ru', 'Хартс', 'secret1', '#777')
    const stale = await db.user.update({
      where: { id: user.id },
      data: { hearts: 3, heartsUpdated: new Date(Date.now() - 45 * 60 * 1000) }
    })

    const refreshed = await refreshUserState(stale)
    expect(refreshed.hearts).toBe(5)

    const capped = await refreshUserState(refreshed)
    expect(capped.hearts).toBe(5)
  })

  it('сбрасывает недельный XP при смене недели', async () => {
    const user = await registerUser('week@mail.ru', 'Вик', 'secret1', '#888')
    const stale = await db.user.update({
      where: { id: user.id },
      data: { weekKey: '1999-W1', weeklyXp: 500 }
    })
    const refreshed = await refreshUserState(stale)
    expect(refreshed.weeklyXp).toBe(0)
    expect(refreshed.weekKey).not.toBe('1999-W1')
  })
})

describe('верификация попытки урока', () => {
  const base = { courseId: 'en', unitId: 'u1', lessonId: 'l1' }

  async function setup(email: string) {
    const user = await registerUser(email, 'Проверяемый', 'secret1', '#777')
    const n = findLesson('en', 'u1', 'l1')!.lesson.exercises.length
    return { user, n }
  }

  it('попытка закрывается один раз: повторная отправка отклоняется', async () => {
    const { user, n } = await setup('replay@mail.ru')
    const { attemptId } = await startAttempt(user, 'en', 'u1', 'l1')
    await db.lessonAttempt.update({ where: { id: attemptId }, data: { startedAt: new Date(Date.now() - 600_000) } })
    const input = { ...base, attemptId, correct: n, total: n, seconds: 60 }

    await completeLesson(user, input)
    await expect(completeLesson(user, input)).rejects.toThrow('ATTEMPT_USED')

    const stat = await db.dayStat.findFirst({ where: { userId: user.id } })
    expect(stat?.lessons).toBe(1)
  })

  it('чужая и выдуманная попытки не принимаются', async () => {
    const { user, n } = await setup('owner@mail.ru')
    const thief = await registerUser('thief@mail.ru', 'Вор', 'secret1', '#888')
    const { attemptId } = await startAttempt(user, 'en', 'u1', 'l1')
    await db.lessonAttempt.update({ where: { id: attemptId }, data: { startedAt: new Date(Date.now() - 600_000) } })

    const input = { ...base, correct: n, total: n, seconds: 60 }
    await expect(completeLesson(thief, { ...input, attemptId })).rejects.toThrow('ATTEMPT_INVALID')
    await expect(completeLesson(user, { ...input, attemptId: 'nope' })).rejects.toThrow('ATTEMPT_INVALID')
    // Попытка на другой урок не подходит для этого.
    await expect(completeLesson(user, { ...input, lessonId: 'l2', attemptId })).rejects.toThrow('ATTEMPT_INVALID')
  })

  it('невозможные счёт и скорость отклоняются, прогресс не меняется', async () => {
    const { user, n } = await setup('cheat@mail.ru')

    // Меньше заданий, чем в уроке — пройти нельзя.
    await expect(playLesson(user, { ...base, correct: 1, total: 1, seconds: 5 })).rejects.toThrow('SCORE_IMPLAUSIBLE')
    // Больше, чем допускает очередь с повторами.
    await expect(playLesson(user, { ...base, correct: 999, total: 999, seconds: 60 })).rejects.toThrow('SCORE_IMPLAUSIBLE')
    // Физически нереальная скорость: весь урок за секунду.
    await expect(playLesson(user, { ...base, correct: n, total: n, seconds: 1 }, { elapsedMs: 1000 })).rejects.toThrow(
      AttemptError
    )

    expect(await db.lessonProgress.count({ where: { userId: user.id } })).toBe(0)
  })

  it('просроченная попытка не принимается', async () => {
    const { user, n } = await setup('stale@mail.ru')
    await expect(
      playLesson(user, { ...base, correct: n, total: n, seconds: 60 }, { elapsedMs: 3 * 60 * 60 * 1000 })
    ).rejects.toThrow('ATTEMPT_INVALID')
  })

  it('неизвестный урок не получает попытку', async () => {
    const { user } = await setup('ghost@mail.ru')
    await expect(startAttempt(user, 'en', 'u1', 'no-such')).rejects.toThrow('LESSON_NOT_FOUND')
  })
})

describe('отзыв сессий', () => {
  it('«выйти везде» делает ранее выданные токены недействительными', async () => {
    const user = await registerUser('revoke@mail.ru', 'Отзыв', 'secret1', '#999')
    const old = await signToken(user.id, user.tokenVersion)
    expect((await userFromToken(old))?.id).toBe(user.id)

    const bumped = await db.user.update({ where: { id: user.id }, data: { tokenVersion: { increment: 1 } } })
    expect(await userFromToken(old)).toBeNull()

    const fresh = await signToken(bumped.id, bumped.tokenVersion)
    expect((await userFromToken(fresh))?.id).toBe(user.id)
  })

  it('мусорный токен не даёт пользователя', async () => {
    expect(await userFromToken('not.a.jwt')).toBeNull()
  })
})
