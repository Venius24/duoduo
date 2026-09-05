'use client'

import { useEffect } from 'react'
import { Turtle } from 'lucide-react'
import type { Exercise, Lang } from '@/content/types'
import { speak } from '@/lib/speech'
import { shuffleSeeded } from '@/lib/utils'
import { TypedInput } from './TypedInput'
import { AudioButton, OptionButton, Prompt } from './shared'

interface BaseProps {
  lang: Lang
  value: unknown
  onChange: (v: string) => void
  locked: boolean
  seed: number
  ttsRate: number
  onEnter?: () => void
}

function useAutoPlay(text: string, lang: Lang, rate: number) {
  useEffect(() => {
    speak(text, lang, rate)
  }, [])
}

export function ListenChoiceEx({
  ex,
  value,
  onChange,
  locked,
  seed,
  ttsRate,
  lang
}: BaseProps & { ex: Extract<Exercise, { kind: 'listen-choice' }> }) {
  useAutoPlay(ex.speak, ex.lang, ttsRate)
  const options = shuffleSeeded(ex.options, seed)
  return (
    <div>
      <Prompt>Что ты услышал(а)?</Prompt>
      <div className="mb-6 flex items-center gap-3">
        <AudioButton text={ex.speak} lang={ex.lang} rate={ttsRate} size="lg" />
        <button
          aria-label="Медленно"
          onClick={() => speak(ex.speak, ex.lang, Math.max(0.5, ttsRate * 0.6))}
          className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-b-4 border-duo-blue/40 text-duo-blue transition active:translate-y-[3px] active:border-b-2"
        >
          <Turtle size={26} />
        </button>
      </div>
      <div className="grid gap-2.5">
        {options.map((opt, i) => (
          <OptionButton key={opt + i} selected={value === opt} locked={locked} onClick={() => onChange(opt)}>
            {opt}
          </OptionButton>
        ))}
      </div>
    </div>
  )
}

export function ListenTypedEx({
  ex,
  value,
  onChange,
  locked,
  ttsRate,
  onEnter,
  lang
}: BaseProps & { ex: Extract<Exercise, { kind: 'listen-typed' }> }) {
  useAutoPlay(ex.speak, ex.lang, ttsRate)
  const isZh = lang === 'zh'
  return (
    <div>
      <Prompt>Запиши, что услышал(а){isZh ? ' (пиньинь или иероглифы)' : ''}</Prompt>
      <div className="mb-6 flex items-center gap-3">
        <AudioButton text={ex.speak} lang={ex.lang} rate={ttsRate} size="lg" />
        <button
          aria-label="Медленно"
          onClick={() => speak(ex.speak, ex.lang, Math.max(0.5, ttsRate * 0.6))}
          className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-b-4 border-duo-blue/40 text-duo-blue transition active:translate-y-[3px] active:border-b-2"
        >
          <Turtle size={26} />
        </button>
      </div>
      <TypedInput
        value={(value as string) || ''}
        onChange={onChange}
        onEnter={onEnter}
        locked={locked}
        placeholder={isZh ? 'например: ni hao' : 'type what you hear…'}
      />
    </div>
  )
}
