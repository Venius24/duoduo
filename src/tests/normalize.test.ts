import { describe, expect, it } from 'vitest'
import { checkTyped, checkWordbank, levenshtein, normalizeAnswer, similarity } from '@/lib/normalize'

describe('normalizeAnswer', () => {
  it('приводит к нижнему регистру и убирает пунктуацию', () => {
    expect(normalizeAnswer('Hello, World!', 'en')).toBe('hello world')
    expect(normalizeAnswer('  Привет!  ', 'en')).toBe('привет')
  })

  it('заменяет ё на е', () => {
    expect(normalizeAnswer('Ёлка', 'en')).toBe('елка')
  })

  it('для китайского убирает все пробелы', () => {
    expect(normalizeAnswer('Ni  Hao', 'zh')).toBe('nihao')
    expect(normalizeAnswer('你 好', 'zh')).toBe('你好')
  })
})

describe('levenshtein / similarity', () => {
  it('считает расстояние', () => {
    expect(levenshtein('cat', 'cat')).toBe(0)
    expect(levenshtein('cat', 'cut')).toBe(1)
    expect(levenshtein('hello', 'helo')).toBe(1)
  })

  it('similarity в диапазоне 0..1', () => {
    expect(similarity('abc', 'abc')).toBe(1)
    expect(similarity('abc', 'xyz')).toBeLessThan(0.5)
  })
})

describe('checkTyped', () => {
  it('точное совпадение без учёта регистра и пунктуации', () => {
    expect(checkTyped('Thank you!', ['thank you'], 'en').correct).toBe(true)
  })

  it('прощает одну опечатку в длинных словах (typo)', () => {
    const r = checkTyped('helso world', ['hello world'], 'en')
    expect(r.correct).toBe(true)
    expect(r.typo).toBe(true)
  })

  it('не прощает опечатки в коротких словах', () => {
    expect(checkTyped('hi', ['no'], 'en').correct).toBe(false)
  })

  it('китайский: пиньинь с пробелами = слитно, иероглифы тоже', () => {
    expect(checkTyped('ni hao', ['nǐ hǎo'], 'zh').correct).toBe(true)
    expect(checkTyped('nihao', ['nǐ hǎo'], 'zh').correct).toBe(true)
    expect(checkTyped('你好', ['nǐ hǎo'], 'zh').correct).toBe(false)
    expect(checkTyped('你好', ['你好'], 'zh').correct).toBe(true)
  })

  it('китайский не прощает опечаток', () => {
    expect(checkTyped('cháa', ['chá'], 'zh').correct).toBe(false)
  })

  it('accept-массивы работают', () => {
    expect(checkTyped('bye!', ['goodbye'], 'en').correct).toBe(false)
    expect(checkTyped('bye!', ['goodbye', 'bye'], 'en').correct).toBe(true)
  })
})

describe('checkWordbank', () => {
  it('порядок слов важен для сборки фразы', () => {
    expect(checkWordbank(['He', 'is', 'my', 'friend'], 'He is my friend.', 'en')).toBe(true)
    expect(checkWordbank(['my', 'friend', 'is', 'he'], 'He is my friend.', 'en')).toBe(false)
  })

  it('китайский склеивает без пробелов и пунктуации', () => {
    expect(checkWordbank(['我', '很', '好'], '我 很 好 ！', 'zh')).toBe(true)
    expect(checkWordbank(['很', '我', '好'], '我 很 好 ！', 'zh')).toBe(false)
  })
})
