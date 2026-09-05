import { describe, expect, it } from 'vitest'
import { courseList, findLesson, flatLessons, getCourse, getItem } from '@/content'
import type { Exercise } from '@/content/types'
import { tokensOf } from '@/content/builders'

function collectExercises(): { courseId: string; unitId: string; lessonId: string; ex: Exercise; idx: number }[] {
  const out: ReturnType<typeof collectExercises> = []
  for (const course of courseList) {
    for (const unit of course.units) {
      for (const lesson of unit.lessons) {
        lesson.exercises.forEach((ex, idx) => out.push({ courseId: course.id, unitId: unit.id, lessonId: lesson.id, ex, idx }))
      }
    }
  }
  return out
}

describe('структура курсов', () => {
  it('оба курса на месте: en и zh', () => {
    expect(getCourse('en')).toBeDefined()
    expect(getCourse('zh')).toBeDefined()
    expect(courseList).toHaveLength(2)
  })

  it('в каждом курсе минимум 5 юнитов по 4 урока + босс', () => {
    for (const course of courseList) {
      expect(course.units.length).toBeGreaterThanOrEqual(5)
      for (const unit of course.units) {
        expect(unit.lessons.length).toBeGreaterThanOrEqual(4)
        const bosses = unit.lessons.filter((l) => l.isBoss)
        expect(bosses).toHaveLength(1)
      }
    }
  })

  it('у боссов заданы время и проходной балл', () => {
    for (const course of courseList) {
      for (const unit of course.units) {
        for (const l of unit.lessons) {
          if (!l.isBoss) continue
          expect(l.timeLimitSec).toBeGreaterThan(0)
          expect(l.passScore).toBeGreaterThan(0)
          expect(l.exercises.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('уроки достаточно длинные', () => {
    for (const course of courseList) {
      for (const unit of course.units) {
        for (const lesson of unit.lessons) {
          if (lesson.isBoss) continue
          expect(lesson.exercises.length).toBeGreaterThanOrEqual(6)
          expect(lesson.items.length).toBeGreaterThan(0)
        }
      }
    }
  })
})

describe('валидность упражнений', () => {
  const all = collectExercises()

  it('ответы choice/listen-choice/fill/tone входят в options', () => {
    for (const { ex } of all) {
      if (ex.kind === 'choice' || ex.kind === 'listen-choice') {
        expect(ex.options).toContain(ex.answer)
        expect(new Set(ex.options).size).toBe(ex.options.length)
        expect(ex.options.length).toBeGreaterThanOrEqual(3)
      }
      if (ex.kind === 'fill') {
        expect(ex.options).toContain(ex.answer)
        expect(new Set(ex.options).size).toBe(ex.options.length)
      }
      if (ex.kind === 'tone') {
        expect(ex.options).toContain(ex.answer)
        expect(ex.syllable.length).toBeGreaterThan(0)
      }
    }
  })

  it('wordbank: все слова ответа есть в наборе', () => {
    for (const { ex } of all) {
      if (ex.kind !== 'wordbank') continue
      const answerWords = tokensOf(ex.answer)
      const bank = new Set(ex.words.map((w) => w.toLowerCase()))
      for (const w of answerWords) {
        expect(bank.has(w.toLowerCase())).toBe(true)
      }
      expect(ex.words.length).toBeGreaterThan(answerWords.length)
    }
  })

  it('match: пары уникальны и их минимум 2', () => {
    for (const { ex } of all) {
      if (ex.kind !== 'match') continue
      expect(ex.pairs.length).toBeGreaterThanOrEqual(2)
      const as = new Set(ex.pairs.map((p) => p.a))
      const bs = new Set(ex.pairs.map((p) => p.b))
      expect(as.size).toBe(ex.pairs.length)
      expect(bs.size).toBe(ex.pairs.length)
    }
  })

  it('speak-упражнения содержат текст и перевод', () => {
    for (const { ex } of all) {
      if (ex.kind !== 'speak') continue
      expect(ex.say.length).toBeGreaterThan(0)
      expect(ex.ru.length).toBeGreaterThan(0)
    }
  })

  it('info-карточки имеют контент', () => {
    const infos = all.filter(({ ex }) => ex.kind === 'info')
    expect(infos.length).toBeGreaterThanOrEqual(8)
    for (const { ex } of infos) {
      if (ex.kind !== 'info') continue
      expect(ex.title.length).toBeGreaterThan(3)
      expect(ex.body.length).toBeGreaterThan(0)
    }
  })

  it('tone-упражнения только в китайском курсе', () => {
    for (const { courseId, ex } of all) {
      if (ex.kind === 'tone') expect(courseId).toBe('zh')
    }
    const zhTones = all.filter(({ courseId, ex }) => courseId === 'zh' && ex.kind === 'tone')
    expect(zhTones.length).toBeGreaterThanOrEqual(20)
  })
})

describe('items и SRS-индекс', () => {
  it('один id всегда означает одно и то же слово; zh-слова с романизацией', () => {
    for (const course of courseList) {
      const seen = new Map<string, { ru: string; t: string }>()
      for (const unit of course.units) {
        for (const lesson of unit.lessons) {
          for (const item of lesson.items) {
            const prev = seen.get(item.id)
            if (prev) {
              expect(prev.ru === item.ru && prev.t === item.t).toBe(true)
            } else {
              seen.set(item.id, { ru: item.ru, t: item.t })
            }
            expect(item.ru.length).toBeGreaterThan(0)
            expect(item.t.length).toBeGreaterThan(0)
            if (course.id === 'zh') {
              expect(item.roman).toBeDefined()
              expect(item.roman!.length).toBeGreaterThan(0)
            }
          }
        }
      }
    }
  })

  it('getItem находит слово из любого курса', () => {
    const en = getCourse('en')!
    const firstEn = en.units[0].lessons[0].items[0]
    expect(getItem(firstEn.id)?.t).toBe(firstEn.t)
    const zh = getCourse('zh')!
    const firstZh = zh.units[0].lessons[0].items[0]
    expect(getItem(firstZh.id)?.ru).toBe(firstZh.ru)
  })
})

describe('навигация по курсу', () => {
  it('flatLessons последователен', () => {
    for (const course of courseList) {
      const flats = flatLessons(course)
      flats.forEach((f, i) => expect(f.index).toBe(i))
      expect(flats.at(-1)?.lesson.isBoss).toBe(true)
    }
  })

  it('findLesson находит урок и босса', () => {
    const found = findLesson('en', 'u1', 'l1')
    expect(found?.lesson.title).toBeTruthy()
    const boss = flatLessons(getCourse('en')!).find((f) => f.lesson.isBoss)!
    expect(findLesson('en', boss.unit.id, boss.lesson.id)?.lesson.isBoss).toBe(true)
    expect(findLesson('en', 'u1', 'nope')).toBeUndefined()
    expect(findLesson('xx', 'u1', 'l1')).toBeUndefined()
  })
})
