'use client'

import { useMemo, useState } from 'react'
import type { Exercise, Lang } from '@/content/types'
import { sfxCorrect, sfxWrong } from '@/lib/sfx'
import { speak } from '@/lib/speech'
import { shuffleSeeded } from '@/lib/utils'
import { Prompt } from './shared'

interface Props {
  ex: Extract<Exercise, { kind: 'match' }>
  lang: Lang
  value: unknown
  onChange: (v: string) => void
  locked: boolean
  seed: number
  ttsRate: number
}

export function MatchEx({ ex, lang, onChange, seed, ttsRate }: Props) {
  const left = useMemo(() => shuffleSeeded(ex.pairs.map((_, i) => i), seed), [ex.pairs, seed])
  const right = useMemo(() => shuffleSeeded(ex.pairs.map((_, i) => i), seed + 7), [ex.pairs, seed])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [selLeft, setSelLeft] = useState<number | null>(null)
  const [wrongRight, setWrongRight] = useState<number | null>(null)

  const tryMatch = (li: number, ri: number) => {
    if (li === ri) {
      speak(ex.pairs[li].b, lang, ttsRate)
      const next = new Set(matched)
      next.add(li)
      setMatched(next)
      setSelLeft(null)
      sfxCorrect(next.size)
      if (next.size === ex.pairs.length) {
        setTimeout(() => onChange('solved'), 350)
      }
    } else {
      setWrongRight(ri)
      sfxWrong()
      setTimeout(() => {
        setWrongRight(null)
        setSelLeft(null)
      }, 450)
    }
  }

  return (
    <div>
      <Prompt>Соедини пары</Prompt>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        <div className="flex flex-col gap-2.5">
          {left.map((i) => {
            const done = matched.has(i)
            return (
              <button
                key={`l-${i}`}
                disabled={done}
                onClick={() => setSelLeft(i)}
                className={`min-h-[56px] rounded-xl border-2 border-b-4 px-3 py-2.5 text-sm font-bold transition sm:text-base ${
                  done
                    ? 'border-duo-green bg-duo-greenlight/50 text-duo-greendark opacity-40 dark:bg-duo-green/15 dark:text-duo-greenlight'
                    : selLeft === i
                      ? 'border-duo-blue bg-duo-bluelight/70 text-duo-blue dark:bg-duo-blue/20'
                      : 'border-black/10 bg-white hover:border-duo-blue/40 dark:border-white/15 dark:bg-duo-night-600'
                }`}
              >
                {ex.pairs[i].a}
              </button>
            )
          })}
        </div>
        <div className="flex flex-col gap-2.5">
          {right.map((i) => {
            const done = matched.has(i)
            return (
              <button
                key={`r-${i}`}
                disabled={done}
                onClick={() => (selLeft != null ? tryMatch(selLeft, i) : undefined)}
                className={`min-h-[56px] rounded-xl border-2 border-b-4 px-3 py-2 text-sm font-bold transition sm:text-base ${
                  done
                    ? 'border-duo-green bg-duo-greenlight/50 opacity-40 dark:bg-duo-green/15'
                    : wrongRight === i
                      ? 'animate-shake border-duo-red bg-duo-redlight dark:bg-duo-red/20'
                      : 'border-black/10 bg-white hover:border-duo-purple/50 dark:border-white/15 dark:bg-duo-night-600'
                }`}
              >
                <span>{ex.pairs[i].b}</span>
                {ex.pairs[i].roman && (
                  <span className="block text-[11px] font-semibold text-duo-gray">{ex.pairs[i].roman}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
