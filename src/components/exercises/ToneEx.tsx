'use client'

import type { Exercise, Lang } from '@/content/types'
import { toneOf } from '@/content/builders'
import { shuffleSeeded } from '@/lib/utils'
import { AudioButton, OptionButton, Prompt } from './shared'

const TONE_COLORS = ['#9AA3A8', '#FF4B4B', '#58CC02', '#1CB0F6', '#CE82FF']

interface Props {
  ex: Extract<Exercise, { kind: 'tone' }>
  lang: Lang
  value: unknown
  onChange: (v: string) => void
  locked: boolean
  seed: number
  ttsRate: number
}

export function ToneEx({ ex, value, onChange, locked, seed, ttsRate }: Props) {
  const options = shuffleSeeded(ex.options, seed)
  const tone = toneOf(ex.syllable)
  const color = TONE_COLORS[Math.max(0, tone)]

  return (
    <div>
      <Prompt note={`«${ex.ru}»`}>Какой это тон?</Prompt>

      <div className="mb-6 flex items-center justify-center gap-4">
        <AudioButton text={ex.syllable} lang="zh-CN" rate={Math.min(0.8, ttsRate)} />
        <div className="text-center">
          <p className="text-5xl font-extrabold tracking-wide" style={{ color }}>
            {ex.word}
          </p>
          <p className="mt-1 text-lg font-extrabold" style={{ color }}>
            {ex.syllable}
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-md gap-2.5">
        {options.map((opt) => (
          <OptionButton key={opt} selected={value === opt} locked={locked} onClick={() => onChange(opt)}>
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: TONE_COLORS[Number(opt.slice(0, 1))] }}
              />
              {opt}
            </span>
          </OptionButton>
        ))}
      </div>
    </div>
  )
}
