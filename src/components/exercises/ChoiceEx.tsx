'use client'

import { useEffect } from 'react'
import type { Exercise, Lang } from '@/content/types'
import { shuffleSeeded } from '@/lib/utils'
import { speak } from '@/lib/speech'
import { Check } from 'lucide-react'
import { OptionButton, Prompt } from './shared'

interface Props {
  ex: Extract<Exercise, { kind: 'choice' }>
  lang: Lang
  value: unknown
  onChange: (v: string) => void
  locked: boolean
  seed: number
  ttsRate: number
}

export function ChoiceEx({ ex, lang, value, onChange, locked, seed, ttsRate }: Props) {
  const options = shuffleSeeded(ex.options, seed)

  useEffect(() => {
    if (ex.speak) speak(ex.speak, lang, ttsRate)
  }, [])

  return (
    <div>
      <Prompt note={ex.promptNote}>{ex.prompt}</Prompt>
      <div className="grid gap-2.5">
        {options.map((opt, i) => (
          <div key={opt + i} className="relative">
            <OptionButton
              selected={value === opt}
              locked={locked}
              onClick={() => onChange(opt)}
            >
              <span className="flex items-center justify-between gap-2">
                <span>{opt}</span>
                {value === opt && (
                  <Check size={16} strokeWidth={3} />
                )}
              </span>
            </OptionButton>
          </div>
        ))}
      </div>
    </div>
  )
}
