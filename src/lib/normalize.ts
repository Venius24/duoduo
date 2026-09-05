import type { Lang } from '@/content/types'

export function normalizeAnswer(input: string, lang: Lang): string {
  let s = input.toLowerCase().trim()
  s = s.replace(/ё/g, 'е')
  s = s.replace(/[.,!?;:"'`()\[\]«»—–…、，。！？]/g, ' ')
  s = s.replace(/\s+/g, ' ').trim()
  if (lang === 'zh') {
    s = s.replace(/\s+/g, '')
    s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }
  return s
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev = cur
  }
  return prev[b.length]
}

export type TypedResult = { correct: boolean; typo: boolean }

export function checkTyped(userInput: string, answers: string[], lang: Lang): TypedResult {
  const nu = normalizeAnswer(userInput, lang)
  if (!nu) return { correct: false, typo: false }
  for (const ans of answers) {
    const na = normalizeAnswer(ans, lang)
    if (nu === na) return { correct: true, typo: false }
  }
  for (const ans of answers) {
    const na = normalizeAnswer(ans, lang)
    if (lang !== 'zh' && na.length >= 5 && levenshtein(nu, na) <= 1) {
      return { correct: true, typo: true }
    }
  }
  return { correct: false, typo: false }
}

export function similarity(a: string, b: string): number {
  const max = Math.max(a.length, b.length)
  if (!max) return 1
  return 1 - levenshtein(a, b) / max
}

export function checkWordbank(selected: string[], answer: string, lang: Lang): boolean {
  return normalizeAnswer(selected.join(' '), lang) === normalizeAnswer(answer, lang)
}
