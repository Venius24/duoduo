'use client'

import type { Exercise, Lang } from '@/content/types'
import { shuffleSeeded } from '@/lib/utils'
import { Prompt } from './shared'

interface Props {
  ex: Extract<Exercise, { kind: 'fill' }>
  lang: Lang
  value: unknown
  onChange: (v: string) => void
  locked: boolean
  seed: number
  ttsRate: number
}

export function FillEx({ ex, value, onChange, locked, seed }: Props) {
  const options = shuffleSeeded(ex.options, seed)
  const chosen = (value as string) || null

  return (
    <div>
      <Prompt>Заполни пропуск</Prompt>

      <p className="mb-6 text-center text-xl font-extrabold leading-relaxed sm:text-2xl">
        {ex.before}
        <span
          className={`mx-1 inline-block min-w-[72px] rounded-lg border-b-4 px-2 align-baseline ${
            chosen ? 'text-duo-blue' : 'text-duo-gray'
          } border-black/15 dark:border-white/25`}
        >
          {chosen || '_____'}
        </span>
        {ex.after}
      </p>
      {ex.roman && <p className="mb-4 text-center text-sm font-semibold text-duo-gray">{ex.roman}</p>}

      <div className="flex flex-wrap justify-center gap-2.5">
        {options.map((opt) => (
          <button
            key={opt}
            disabled={locked}
            onClick={() => onChange(opt)}
            className={`rounded-xl border-2 border-b-4 px-4 py-2.5 text-base font-bold transition ${
              chosen === opt
                ? 'border-duo-blue bg-duo-bluelight/70 text-duo-blue dark:bg-duo-blue/20 dark:text-duo-bluelight'
                : 'border-black/10 bg-white hover:-translate-y-0.5 hover:border-duo-blue/40 dark:border-white/15 dark:bg-duo-night-600'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
