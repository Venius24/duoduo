'use client'

import type { Lang } from '@/content/types'

let voicesCache: SpeechSynthesisVoice[] | null = null

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return []
  if (!voicesCache) voicesCache = window.speechSynthesis.getVoices()
  return voicesCache
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    voicesCache = null
  }
}

export function speak(text: string, lang: Lang | string, rate = 1) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const synth = window.speechSynthesis
  synth.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  const target = lang === 'zh' ? 'zh' : lang === 'en' ? 'en' : String(lang)
  utter.lang = lang === 'zh' ? 'zh-CN' : lang === 'en' ? 'en-US' : String(lang)
  utter.rate = rate
  const voices = loadVoices()
  const voice =
    voices.find((v) => v.lang.toLowerCase().replace('_', '-') === utter.lang.toLowerCase()) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(target))
  if (voice) utter.voice = voice
  synth.speak(utter)
}

export function speechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!((window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition)
  )
}

interface RecognitionResult {
  transcript: string
}

/** Сколько ждём ответа распознавателя, прежде чем сдаться. */
export const RECOGNITION_TIMEOUT_MS = 10_000

type Recognizer = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((e: unknown) => void) | null
  onend: (() => void) | null
  start: () => void
  abort?: () => void
}

/**
 * Одно распознавание. Всегда завершается: некоторые сборки Chromium (Brave,
 * Electron, headless) отдают конструктор SpeechRecognition, но не присылают ни
 * result, ни error, — без таймаута и обработки `onend` упражнение «Произнеси»
 * зависало бы на «Слушаю…» навсегда.
 */
export function recognizeOnce(lang: Lang, timeoutMs = RECOGNITION_TIMEOUT_MS): Promise<RecognitionResult> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as Record<string, unknown>
    const Ctor = (w.SpeechRecognition || w.webkitSpeechRecognition) as (new () => Recognizer) | undefined
    if (!Ctor) {
      reject(new Error('unsupported'))
      return
    }

    let settled = false
    const settle = (fn: () => void) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      fn()
    }

    const rec = new Ctor()
    const timer = setTimeout(() => {
      settle(() => reject(new Error('timeout')))
      try {
        rec.abort?.()
      } catch {
        /* уже остановлен */
      }
    }, timeoutMs)

    rec.lang = lang === 'zh' ? 'zh-CN' : 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 3
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript
      settle(() => (transcript ? resolve({ transcript }) : reject(new Error('empty'))))
    }
    rec.onerror = (e) => settle(() => reject(e))
    rec.onend = () => settle(() => reject(new Error('no-speech')))
    try {
      rec.start()
    } catch (e) {
      settle(() => reject(e))
    }
  })
}
