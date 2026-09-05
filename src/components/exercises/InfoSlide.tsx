'use client'

import type { Exercise, Lang } from '@/content/types'
import { AudioButton, Prompt } from './shared'

interface Props {
  ex: Extract<Exercise, { kind: 'info' }>
  lang: Lang
  ttsRate: number
}

export function InfoSlide({ ex }: Props) {
  return (
    <div>
      <Prompt note="Грамматическая минутка">{ex.title}</Prompt>
      <div className="mx-auto max-w-xl space-y-3">
        {ex.body.map((p, i) => (
          <p key={i} className="rounded-xl bg-duo-bluelight/50 p-3.5 text-sm font-semibold leading-relaxed dark:bg-duo-blue/10">
            {p}
          </p>
        ))}
        {ex.example && (
          <div className="rounded-2xl border-2 border-duo-green/30 bg-white p-4 text-center dark:bg-duo-night-600">
            <div className="flex items-center justify-center gap-3">
              <AudioButton text={ex.example.t} lang={ex.example.roman ? 'zh-CN' : 'en-US'} size="sm" />
              <div>
                <p className="text-lg font-extrabold">{ex.example.t}</p>
                {ex.example.roman && (
                  <p className="text-xs font-bold text-duo-gray">{ex.example.roman}</p>
                )}
                <p className="text-sm font-semibold text-duo-gray">{ex.example.ru}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
