export type Lang = 'en' | 'zh'

export interface Item {
  id: string
  ru: string
  t: string
  roman?: string
}

export interface Sentence {
  ru: string
  t: string
  roman?: string
}

export type Exercise =
  | {
      kind: 'choice'
      prompt: string
      options: string[]
      answer: string
      speak?: string
      promptNote?: string
      explain?: string
    }
  | { kind: 'wordbank'; prompt: string; words: string[]; answer: string; roman?: string; explain?: string }
  | {
      kind: 'typed'
      prompt: string
      answer: string
      accept?: string[]
      hintRoman?: string
      placeholderHint?: string
      explain?: string
    }
  | { kind: 'listen-choice'; speak: string; lang: Lang; options: string[]; answer: string; explain?: string }
  | { kind: 'listen-typed'; speak: string; lang: Lang; answer: string; accept?: string[]; explain?: string }
  | { kind: 'match'; pairs: { a: string; b: string; roman?: string }[] }
  | { kind: 'speak'; say: string; lang: Lang; ru: string; roman?: string }
  | {
      kind: 'fill'
      before: string
      after: string
      options: string[]
      answer: string
      roman?: string
      explain?: string
    }
  | { kind: 'tone'; syllable: string; word: string; ru: string; options: string[]; answer: string }
  | { kind: 'info'; title: string; body: string[]; example?: { t: string; ru: string; roman?: string } }

export interface Lesson {
  id: string
  title: string
  isBoss?: boolean
  timeLimitSec?: number
  passScore?: number
  items: Item[]
  exercises: Exercise[]
}

export interface Unit {
  id: string
  title: string
  subtitle: string
  color: string
  lessons: Lesson[]
}

export interface Course {
  id: Lang
  flag: string
  name: string
  tagline: string
  ttsLang: string
  units: Unit[]
}
