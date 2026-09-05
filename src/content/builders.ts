import type { Course, Exercise, Item, Lang, Lesson, Sentence, Unit } from './types'

const TONE_MAP: Record<string, number> = {
  'ā': 1, 'ē': 1, 'ī': 1, 'ō': 1, 'ū': 1, 'ǖ': 1,
  'á': 2, 'é': 2, 'í': 2, 'ó': 2, 'ú': 2, 'ǘ': 2,
  'ǎ': 3, 'ě': 3, 'ǐ': 3, 'ǒ': 3, 'ǔ': 3, 'ǚ': 3,
  'à': 4, 'è': 4, 'ì': 4, 'ò': 4, 'ù': 4, 'ǜ': 4
}

export function toneOf(syllable: string): number {
  for (const ch of syllable.toLowerCase()) {
    if (TONE_MAP[ch]) return TONE_MAP[ch]
  }
  return 0
}

export function stripPunct(token: string): string {
  return token.replace(/[.,!?;:«»"'()—–…，。！？、]/g, '')
}

export function tokensOf(text: string): string[] {
  return text.split(/\s+/).map(stripPunct).filter(Boolean)
}

const idSeen = new Map<string, number>()

export function item(courseId: Lang, ru: string, t: string, roman?: string): Item {
  let base = (roman || t).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '')
  if (!base) base = 'w'
  const n = (idSeen.get(base) || 0) + 1
  idSeen.set(base, n)
  return { id: `${courseId}.${n === 1 ? base : base + n}`, ru, t, roman }
}

export function sen(ru: string, t: string, roman?: string): Sentence {
  return { ru, t, roman }
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export class ExF {
  constructor(
    public lang: Lang,
    public pool: Item[],
    private sentPool: Sentence[] = []
  ) {}

  private dist(correct: string, field: 't' | 'ru', n = 3): string[] {
    const seen = new Set<string>([correct])
    const list = this.pool.map((i) => i[field]).filter((v) => !seen.has(v))
    const uniq: string[] = []
    for (const v of list) {
      if (!seen.has(v)) {
        seen.add(v)
        uniq.push(v)
      }
    }
    const off = correct.length % Math.max(1, uniq.length)
    const out: string[] = []
    for (let k = 0; k < uniq.length && out.length < n; k++) {
      out.push(uniq[(off + k) % uniq.length])
    }
    return out
  }

  choiceNew(items: Item[]): Exercise[] {
    return items.map((it) => ({
      kind: 'choice' as const,
      prompt: `Выбери перевод: «${it.ru}»`,
      options: [it.t, ...this.dist(it.t, 't')],
      answer: it.t,
      speak: it.t,
      promptNote: it.roman,
      explain: it.roman ? `${it.t} — ${it.roman}` : undefined
    }))
  }

  choiceRev(items: Item[]): Exercise[] {
    return items.map((it) => ({
      kind: 'choice' as const,
      prompt: `Что означает «${it.t}»?`,
      promptNote: it.roman,
      options: [it.ru, ...this.dist(it.ru, 'ru')],
      answer: it.ru,
      explain: `${it.t} — ${it.ru}`
    }))
  }

  listenChoice(items: Item[]): Exercise[] {
    return items.map((it) => ({
      kind: 'listen-choice' as const,
      speak: it.t,
      lang: this.lang,
      options: [it.ru, ...this.dist(it.ru, 'ru')],
      answer: it.ru,
      explain: `${it.t} — ${it.ru}`
    }))
  }

  listenTyped(sens: Sentence[]): Exercise[] {
    return sens.map((s) => ({
      kind: 'listen-typed' as const,
      speak: s.t,
      lang: this.lang,
      answer: s.t,
      accept: s.roman ? [s.roman] : undefined,
      explain: `${s.t} — ${s.ru}`
    }))
  }

  typed(sens: Sentence[]): Exercise[] {
    return sens.map((s) => ({
      kind: 'typed' as const,
      prompt: `Переведи: «${s.ru}»`,
      answer: s.t,
      accept: s.roman ? [s.roman] : undefined,
      hintRoman: s.roman,
      placeholderHint: this.lang === 'zh' ? 'пиши пиньинь или иероглифы' : undefined,
      explain: `${s.t} — ${s.ru}`
    }))
  }

  wordbank(sens: Sentence[]): Exercise[] {
    return sens.map((s) => {
      const answerTokens = tokensOf(s.t)
      const answerSet = new Set(answerTokens.map((w) => w.toLowerCase()))
      const extras: string[] = []
      const pushExtra = (w: string) => {
        if (!answerSet.has(w.toLowerCase()) && !extras.includes(w)) extras.push(w)
      }
      for (const other of [...this.sentPool, ...sens]) {
        if (other === s) continue
        for (const w of tokensOf(other.t)) pushExtra(w)
        if (extras.length >= 3) break
      }
      if (extras.length < 3) {
        for (const it of this.pool) {
          for (const w of tokensOf(it.t)) {
            pushExtra(w)
            if (extras.length >= 3) break
          }
          if (extras.length >= 3) break
        }
      }
      return {
        kind: 'wordbank' as const,
        prompt: `Составь фразу: «${s.ru}»`,
        words: [...answerTokens, ...extras.slice(0, 3)],
        answer: s.t,
        roman: s.roman,
        explain: `${s.t} — ${s.ru}`
      }
    })
  }

  match(items: Item[]): Exercise[] {
    const out: Exercise[] = []
    for (let i = 0; i + 3 < items.length || (i < items.length && out.length === 0); i += 4) {
      const chunk = items.slice(i, i + 4)
      if (chunk.length < 2) break
      out.push({
        kind: 'match',
        pairs: chunk.map((it) => ({ a: it.ru, b: it.t, roman: it.roman }))
      })
    }
    return out
  }

  speak(entries: { t: string; ru: string; roman?: string }[]): Exercise[] {
    return entries.map((e) => ({
      kind: 'speak' as const,
      say: e.t,
      lang: this.lang,
      ru: e.ru,
      roman: e.roman
    }))
  }

  fillSen(sens: Sentence[], idx: number): Exercise[] {
    const s = sens[idx]
    if (!s) return []
    const toks = tokensOf(s.t)
    let best = ''
    for (const w of toks) if (w.length > best.length) best = w
    const lower = s.t.toLowerCase()
    const pos = lower.indexOf(best.toLowerCase())
    if (pos < 0) return []
    const before = s.t.slice(0, pos)
    const after = s.t.slice(pos + best.length)
    const opts = new Set<string>([best])
    for (const it of this.pool) {
      const cand = tokensOf(it.t)
      if (cand.length === 1 && !opts.has(cand[0])) opts.add(cand[0])
      if (opts.size >= 4) break
    }
    return [
      {
        kind: 'fill',
        before,
        after,
        options: [...opts],
        answer: best,
        roman: s.roman,
        explain: s.t
      }
    ]
  }

  fillRaw(before: string, after: string, answer: string, options: string[], explain?: string): Exercise {
    return { kind: 'fill', before, after, options, answer, explain }
  }

  tone(items: Item[]): Exercise[] {
    const labels = [
      '1 · высокий ровный (ā)',
      '2 · восходящий (á)',
      '3 · нисходяще-восходящий (ǎ)',
      '4 · нисходящий (à)'
    ]
    const out: Exercise[] = []
    for (const it of items) {
      if (!it.roman) continue
      const syl = it.roman.split(/[\s·\-]+/)[0]
      const tone = toneOf(syl)
      if (tone < 1) continue
      out.push({
        kind: 'tone',
        syllable: syl,
        word: it.t,
        ru: it.ru,
        options: labels,
        answer: labels[tone - 1]
      })
    }
    return out
  }
}

export interface LessonSpec extends Omit<Lesson, 'exercises'> {
  build: (f: ExF) => Exercise[]
}

export function unit(lang: Lang, id: string, title: string, subtitle: string, color: string, specs: LessonSpec[]): Unit {
  const pool = specs.flatMap((s) => s.items)
  const lessons: Lesson[] = specs.map((spec) => {
    const f = new ExF(lang, pool, spec.items.flatMap(() => []))
    return {
      id: spec.id,
      title: spec.title,
      isBoss: spec.isBoss,
      timeLimitSec: spec.timeLimitSec,
      passScore: spec.passScore,
      items: spec.items,
      exercises: spec.build(f)
    }
  })
  return { id, title, subtitle, color, lessons }
}

export function bossMix(f: ExF, items: Item[], sens: Sentence[], extra: Exercise[] = []): Exercise[] {
  const out: Exercise[] = []
  for (let i = 0; i < items.length; i += 4) {
    out.push(...f.choiceNew(items.slice(i, i + 2)))
    out.push(...f.listenChoice(items.slice(i + 2, i + 4)))
  }
  out.push(...extra)
  out.push(...f.wordbank(sens.slice(0, 2)))
  out.push(...f.listenTyped(sens.slice(2, 3)))
  out.push(...f.typed(sens.slice(3, 5)))
  out.push(...f.speak(sens.slice(5, 6).map((s) => ({ t: s.t, ru: s.ru, roman: s.roman }))))
  return out
}
