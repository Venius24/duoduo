import type { User } from '@prisma/client'
import { findLesson } from '@/content'
import type { Lesson } from '@/content/types'
import { db } from '../db'

/** Сколько живёт незакрытая попытка. Дольше урок пройти нельзя. */
export const ATTEMPT_TTL_MS = 2 * 60 * 60 * 1000

/** Быстрее этого на одно задание человек не отвечает (инфо-слайд — один клик). */
export const MIN_MS_PER_ANSWER = 700

/** Сколько раз неверное задание может вернуться в очередь (см. LessonRunner). */
const MAX_RETRIES = 6

/** Предел очереди босса в LessonRunner. */
const BOSS_QUEUE_CAP = 26

export class AttemptError extends Error {
  constructor(public code: 'LESSON_NOT_FOUND' | 'ATTEMPT_INVALID' | 'ATTEMPT_USED' | 'SCORE_IMPLAUSIBLE') {
    super(code)
  }
}

export async function startAttempt(user: User, courseId: string, unitId: string, lessonId: string) {
  if (!findLesson(courseId, unitId, lessonId)) throw new AttemptError('LESSON_NOT_FOUND')

  // Брошенные попытки не копим: чистим просроченные у этого пользователя.
  await db.lessonAttempt.deleteMany({
    where: { userId: user.id, finishedAt: null, startedAt: { lt: new Date(Date.now() - ATTEMPT_TTL_MS) } }
  })

  const attempt = await db.lessonAttempt.create({
    data: { userId: user.id, courseId, unitId, lessonId }
  })
  return { attemptId: attempt.id }
}

/** Допустимый диапазон `total`, который клиент мог получить, честно проходя урок. */
export function totalBounds(lesson: Lesson): { min: number; max: number } {
  const n = lesson.exercises.length
  if (lesson.isBoss) {
    // Босс идёт по таймеру и может завершиться раньше; очередь — удвоенный пул, не длиннее 26.
    return { min: 1, max: Math.min(BOSS_QUEUE_CAP, n * 2) }
  }
  return { min: n, max: n + MAX_RETRIES }
}

/**
 * Проверяет и атомарно закрывает попытку. Бросает AttemptError, если попытка
 * чужая, просроченная, уже использованная или счёт физически невозможен.
 * Возвращает фактическую длительность по часам сервера.
 */
export async function consumeAttempt(
  user: User,
  ref: { attemptId: string; courseId: string; unitId: string; lessonId: string },
  score: { correct: number; total: number },
  now = new Date()
): Promise<{ elapsedMs: number }> {
  const found = findLesson(ref.courseId, ref.unitId, ref.lessonId)
  if (!found) throw new AttemptError('LESSON_NOT_FOUND')

  const attempt = await db.lessonAttempt.findUnique({ where: { id: ref.attemptId } })
  if (
    !attempt ||
    attempt.userId !== user.id ||
    attempt.courseId !== ref.courseId ||
    attempt.unitId !== ref.unitId ||
    attempt.lessonId !== ref.lessonId
  ) {
    throw new AttemptError('ATTEMPT_INVALID')
  }
  if (attempt.finishedAt) throw new AttemptError('ATTEMPT_USED')

  const elapsedMs = now.getTime() - attempt.startedAt.getTime()
  if (elapsedMs > ATTEMPT_TTL_MS) throw new AttemptError('ATTEMPT_INVALID')

  const { min, max } = totalBounds(found.lesson)
  if (score.total < min || score.total > max) throw new AttemptError('SCORE_IMPLAUSIBLE')
  if (elapsedMs < score.total * MIN_MS_PER_ANSWER) throw new AttemptError('SCORE_IMPLAUSIBLE')

  // Закрываем условным апдейтом: два параллельных запроса не пройдут оба.
  const closed = await db.lessonAttempt.updateMany({
    where: { id: attempt.id, finishedAt: null },
    data: { finishedAt: now }
  })
  if (closed.count !== 1) throw new AttemptError('ATTEMPT_USED')

  return { elapsedMs }
}
