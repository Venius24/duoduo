import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { recognizeOnce, speechSupported } from '@/lib/speech'

type Handlers = {
  onresult?: (e: unknown) => void
  onerror?: (e: unknown) => void
  onend?: () => void
}

let instance: FakeRecognition | null = null

class FakeRecognition {
  lang = ''
  interimResults = false
  maxAlternatives = 1
  onresult: Handlers['onresult'] = undefined
  onerror: Handlers['onerror'] = undefined
  onend: Handlers['onend'] = undefined
  abort = vi.fn()
  start = vi.fn()
  constructor() {
    instance = this
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  ;(window as unknown as Record<string, unknown>).webkitSpeechRecognition = FakeRecognition
})

afterEach(() => {
  vi.useRealTimers()
  delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition
  instance = null
})

describe('recognizeOnce', () => {
  it('отдаёт распознанный текст', async () => {
    const p = recognizeOnce('en')
    instance!.onresult!({ results: [[{ transcript: 'hello' }]] })
    await expect(p).resolves.toEqual({ transcript: 'hello' })
  })

  it('выставляет язык распознавания по курсу', () => {
    void recognizeOnce('zh').catch(() => {})
    expect(instance!.lang).toBe('zh-CN')
  })

  it('не зависает, если распознаватель молчит: таймаут и abort', async () => {
    const p = recognizeOnce('en', 5000)
    const assertion = expect(p).rejects.toThrow('timeout')
    await vi.advanceTimersByTimeAsync(5000)
    await assertion
    expect(instance!.abort).toHaveBeenCalled()
  })

  it('завершение без результата (onend) — это ошибка, а не вечное ожидание', async () => {
    const p = recognizeOnce('en')
    const assertion = expect(p).rejects.toThrow('no-speech')
    instance!.onend!()
    await assertion
  })

  it('результат после onend/таймаута игнорируется', async () => {
    const p = recognizeOnce('en')
    const assertion = expect(p).rejects.toThrow('no-speech')
    instance!.onend!()
    instance!.onresult!({ results: [[{ transcript: 'late' }]] })
    await assertion
  })

  it('исключение из start() превращается в отказ промиса', async () => {
    const start = vi.fn(() => {
      throw new Error('not-allowed')
    })
    ;(window as unknown as Record<string, unknown>).webkitSpeechRecognition = class extends FakeRecognition {
      start = start
    }
    await expect(recognizeOnce('en')).rejects.toThrow('not-allowed')
  })

  it('speechSupported отражает наличие API', () => {
    expect(speechSupported()).toBe(true)
    delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    expect(speechSupported()).toBe(false)
  })
})
