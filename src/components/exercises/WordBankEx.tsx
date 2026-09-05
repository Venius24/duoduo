'use client'

import { useMemo, useState } from 'react'
import type { Exercise, Lang } from '@/content/types'
import { shuffleSeeded } from '@/lib/utils'
import { Prompt } from './shared'

interface Props {
  ex: Extract<Exercise, { kind: 'wordbank' }>
  lang: Lang
  value: unknown
  onChange: (v: string[]) => void
  locked: boolean
  seed: number
  ttsRate: number
}

export function WordBankEx({ ex, lang, value, onChange, locked, seed }: Props) {
  const bank = useMemo(() => shuffleSeeded(ex.words, seed), [ex.words, seed])
  const [picked, setPicked] = useState<number[]>([])

  const select = (i: number) => {
    if (locked || picked.includes(i)) return
    const next = [...picked, i]
    setPicked(next)
    onChange(next.map((n) => bank[n]))
  }

  const deselect = (i: number) => {
    if (locked) return
    const next = picked.filter((p) => p !== i)
    setPicked(next)
    onChange(next.map((n) => bank[n]))
  }

  return (
    <div>
      <Prompt note={ex.roman}>{ex.prompt}</Prompt>

      <div className="mb-6 flex min-h-[72px] flex-wrap content-start items-start gap-2 border-y-2 border-dashed border-black/10 py-3 dark:border-white/15">
        {picked.length === 0 && (
          <span className="text-sm font-semibold text-duo-gray">Нажимай на слова ниже…</span>
        )}
        {picked.map((i) => (
          <button
            key={`sel-${i}`}
            onClick={() => deselect(i)}
            disabled={locked}
            className="rounded-xl border-2 border-b-4 border-black/10 bg-white px-3 py-2 text-base font-bold shadow-sm transition hover:border-duo-red/60 dark:border-white/15 dark:bg-duo-night-600"
          >
            {bank[i]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {bank.map((w, i) =>
          picked.includes(i) ? (
            <div
              key={`ghost-${i}`}
              aria-hidden
              className="rounded-xl border-2 border-transparent bg-black/5 px-3 py-2 text-base font-bold opacity-0 dark:bg-white/5"
            >
              {w}
            </div>
          ) : (
            <button
              key={i}
              onClick={() => select(i)}
              disabled={locked}
              className="rounded-xl border-2 border-b-4 border-black/10 bg-white px-3 py-2 text-base font-bold transition hover:-translate-y-0.5 hover:border-duo-blue disabled:opacity-50 dark:border-white/15 dark:bg-duo-night-600"
            >
              {w}
            </button>
          )
        )}
      </div>
    </div>
  )
}
