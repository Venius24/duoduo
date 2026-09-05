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

export function recognizeOnce(lang: Lang): Promise<RecognitionResult> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as Record<string, unknown>
    const Ctor = (w.SpeechRecognition || w.webkitSpeechRecognition) as
      | (new () => {
          lang: string
          interimResults: boolean
          maxAlternatives: number
          onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
          onerror: ((e: unknown) => void) | null
          onend: (() => void) | null
          start: () => void
        })
      | undefined
    if (!Ctor) {
      reject(new Error('unsupported'))
      return
    }
    const rec = new Ctor()
    rec.lang = lang === 'zh' ? 'zh-CN' : 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 3
    rec.onresult = (e) => {
      const alt = e.results[0][0]
      resolve({ transcript: alt.transcript })
    }
    rec.onerror = (e) => reject(e)
    rec.start()
  })
}
