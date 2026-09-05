'use client'

import { Check } from 'lucide-react'
import type { QuestView } from '@/lib/quests'
import { ProgressBar } from '@/components/ui/ProgressBar'

export function QuestList({ quests }: { quests: QuestView[] }) {
  return (
    <div className="rounded-2xl border-2 border-black/5 bg-white p-4 dark:border-white/10 dark:bg-duo-night-700">
      <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-duo-gray">
        Квесты дня
      </h3>
      <div className="space-y-3">
        {quests.map((q) => (
          <div key={q.id} className="flex items-center gap-3">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${
                q.claimed ? 'bg-duo-greenlight dark:bg-duo-green/20' : 'bg-duo-bluelight/60 dark:bg-white/5'
              }`}
            >
              {q.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold">{q.title}</p>
              <div className="mt-1 flex items-center gap-2">
                <ProgressBar value={q.progress} max={q.target} color="#FFC800" className="h-3" />
                <span className="shrink-0 text-[11px] font-extrabold text-duo-gray">
                  {q.progress}/{q.target}
                </span>
              </div>
            </div>
            <div className="w-14 shrink-0 text-right">
              {q.claimed ? (
                <span className="inline-flex items-center gap-0.5 text-xs font-extrabold text-duo-green">
                  <Check size={13} strokeWidth={3} /> +{q.reward}
                </span>
              ) : (
                <span className="text-xs font-extrabold text-duo-blue">💎{q.reward}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
