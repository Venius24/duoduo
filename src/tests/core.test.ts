import { describe, expect, it } from 'vitest'
import { freshSrsState, nextSchedule } from '@/lib/srs'
import { gemsForLesson, levelInfo, starsFor, xpForLevel, xpForLesson } from '@/lib/levels'
import { buildQuests } from '@/lib/quests'
import { evaluateAchievements } from '@/lib/achievements'
import { toneOf, tokensOf, stripPunct } from '@/content/builders'
import { hashStr, shuffleSeeded, weekKeyStr, dateStr } from '@/lib/utils'

describe('SRS nextSchedule', () => {
  const now = new Date('2026-01-10T12:00:00Z')

  it('новое слово с оценкой 5 → интервал 1 день', () => {
    const s = freshSrsState(5, now)
    expect(s.reps).toBe(1)
    expect(s.interval).toBe(1)
  })

  it('второй повтор → 3 дня, третий — с учётом ease', () => {
    const s1 = nextSchedule({ ease: 2.5, interval: 0, reps: 0, lapses: 0 }, 5, now)
    const s2 = nextSchedule(s1, 5, now)
    expect(s2.interval).toBe(3)
    const s3 = nextSchedule(s2, 4, now)
    expect(s3.interval).toBe(Math.round(3 * s2.ease))
    expect(s3.reps).toBe(3)
  })

  it('провал сбрасывает прогресс и ставит due через ~10 минут', () => {
    const s = nextSchedule({ ease: 2.5, interval: 20, reps: 5, lapses: 0 }, 1, now)
    expect(s.reps).toBe(0)
    expect(s.lapses).toBe(1)
    const diffMs = s.dueAt.getTime() - now.getTime()
    expect(diffMs).toBeGreaterThan(9 * 60 * 1000)
    expect(diffMs).toBeLessThanOrEqual(11 * 60 * 1000)
  })

  it('ease зажат в [1.3, 2.8]', () => {
    let s = { ease: 2.8, interval: 10, reps: 5, lapses: 0 }
    for (let i = 0; i < 20; i++) s = nextSchedule(s, 5, now)
    expect(s.ease).toBeLessThanOrEqual(2.8)
    let f = { ease: 1.3, interval: 10, reps: 5, lapses: 0 }
    for (let i = 0; i < 20; i++) f = nextSchedule(f, 0, now)
    expect(f.ease).toBeGreaterThanOrEqual(1.3)
  })
})

describe('levels & xp', () => {
  it('xpForLevel растёт линейно', () => {
    expect(xpForLevel(1)).toBe(100)
    expect(xpForLevel(2)).toBe(150)
  })

  it('levelInfo считает уровни', () => {
    const l0 = levelInfo(0)
    expect(l0.level).toBe(1)
    expect(l0.current).toBe(0)

    const l99 = levelInfo(99)
    expect(l99.level).toBe(1)

    const l150 = levelInfo(150)
    expect(l150.level).toBe(2)
    expect(l150.current).toBe(50)
    expect(l150.progress).toBeCloseTo(50 / 150)
  })

  it('xp за урок: первый раз больше, босс дороже', () => {
    expect(xpForLesson(false, true, true)).toBe(18)
    expect(xpForLesson(true, false, true)).toBe(30)
    expect(xpForLesson(false, false, false)).toBe(4)
    expect(xpForLesson(false, true, false)).toBeLessThan(xpForLesson(false, true, true))
    expect(gemsForLesson(true, true)).toBe(25)
  })

  it('звёзды по проценту', () => {
    expect(starsFor(100)).toBe(3)
    expect(starsFor(90)).toBe(2)
    expect(starsFor(50)).toBe(1)
  })
})

describe('quests', () => {
  it('считает прогресс и завершение', () => {
    const quests = buildQuests(
      40,
      { xp: 40, lessons: 2, correct: 15, perfectLessons: 1, reviews: 10 },
      []
    )
    expect(quests.every((q) => q.done)).toBe(true)
    expect(quests.find((q) => q.id === 'xp')?.claimed).toBe(false)
  })

  it('частичный прогресс ограничен таргетом', () => {
    const quests = buildQuests(50, { xp: 999, lessons: 0, correct: 3, perfectLessons: 0, reviews: 0 }, ['xp'])
    const xpQ = quests.find((q) => q.id === 'xp')!
    expect(xpQ.claimed).toBe(true)
    expect(xpQ.done).toBe(true)
    const correctQ = quests.find((q) => q.id === 'correct')!
    expect(correctQ.progress).toBe(3)
    expect(correctQ.done).toBe(false)
  })
})

describe('achievements evaluate', () => {
  it('базовые правила', () => {
    const unlocked = evaluateAchievements({
      totalLessons: 3,
      hasPerfect: true,
      hasBossWin: true,
      streak: 7,
      xp: 600,
      srsCount: 30,
      coursesStarted: 2,
      lastHour: 14,
      gems: 1200
    })
    expect(unlocked).toContain('first_lesson')
    expect(unlocked).toContain('perfect_lesson')
    expect(unlocked).toContain('boss_slayer')
    expect(unlocked).toContain('streak_7')
    expect(unlocked).toContain('xp_500')
    expect(unlocked).toContain('words_25')
    expect(unlocked).toContain('polyglot')
    expect(unlocked).not.toContain('night_owl')
    expect(unlocked).toContain('rich')
  })

  it('ночная сова только ночью', () => {
    const night = evaluateAchievements({
      totalLessons: 1, hasPerfect: false, hasBossWin: false, streak: 0,
      xp: 0, srsCount: 0, coursesStarted: 1, lastHour: 3, gems: 0
    })
    expect(night).toContain('night_owl')
  })
})

describe('builders utils', () => {
  it('toneOf определяет тон по диакритике', () => {
    expect(toneOf('mā')).toBe(1)
    expect(toneOf('má')).toBe(2)
    expect(toneOf('mǎ')).toBe(3)
    expect(toneOf('mà')).toBe(4)
    expect(toneOf('ma')).toBe(0)
  })

  it('tokensOf режет и чистит пунктуацию', () => {
    expect(tokensOf('Я люблю тебя!')).toEqual(['Я', 'люблю', 'тебя'])
    expect(tokensOf('你 好 吗 ？')).toEqual(['你', '好', '吗'])
  })

  it('stripPunct', () => {
    expect(stripPunct('привет,')).toBe('привет')
  })
})

describe('utils', () => {
  it('shuffleSeeded детерминирован', () => {
    const a = shuffleSeeded([1, 2, 3, 4, 5], 42)
    const b = shuffleSeeded([1, 2, 3, 4, 5], 42)
    expect(a).toEqual(b)
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('hashStr стабилен', () => {
    expect(hashStr('duo')).toBe(hashStr('duo'))
    expect(hashStr('duo')).not.toBe(hashStr('duo2'))
  })

  it('даты', () => {
    expect(dateStr(new Date('2026-08-25T10:00:00Z'))).toBe('2026-08-25')
    expect(weekKeyStr(new Date('2026-01-01T00:00:00Z'))).toMatch(/-W\d+/)
  })
})
