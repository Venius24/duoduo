'use client'

import { Lock, Star, Swords } from 'lucide-react'
import { useState } from 'react'
import { sfxTap } from '@/lib/sfx'
import { cn } from '@/lib/utils'
import { ProgressBar } from '@/components/ui/ProgressBar'

export interface PathNodeState {
  lessonId: string
  title: string
  isBoss: boolean
  state: 'done' | 'current' | 'locked'
  stars: number
}

export function UnitSection({
  color,
  title,
  subtitle,
  doneCount,
  totalCount,
  nodes,
  onStart
}: {
  color: string
  title: string
  subtitle: string
  doneCount: number
  totalCount: number
  nodes: PathNodeState[]
  onStart: (lessonId: string) => void
}) {
  const [shakeId, setShakeId] = useState<string | null>(null)
  const OFFSETS = [-64, 0, 64, 0]

  return (
    <section className="mb-10">
      <div
        className="mb-8 flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-white shadow-md"
        style={{ background: color }}
      >
        <div>
          <h2 className="text-lg font-black leading-tight">{title}</h2>
          <p className="text-xs font-bold opacity-90">{subtitle}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">
          {doneCount}/{totalCount}
        </span>
      </div>

      <div className="relative flex flex-col items-center gap-5">
        <div className="absolute bottom-6 left-1/2 top-2 -translate-x-1/2 border-l-4 border-dotted border-black/10 dark:border-white/15" />
        {nodes.map((n, i) => {
          const offset = n.isBoss ? 0 : OFFSETS[i % OFFSETS.length]
          const size = n.isBoss ? 'h-24 w-24 text-3xl' : 'h-[72px] w-[72px] text-2xl'
          return (
            <div key={n.lessonId} className="relative" style={{ transform: `translateX(${offset}px)` }}>
              {n.state === 'current' && (
                <div
                  className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl border-2 px-2.5 py-0.5 text-[11px] font-extrabold uppercase"
                  style={{ borderColor: color, color, background: '#fff' }}
                >
                  Старт
                  <span
                    className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border-b-2 border-r-2"
                    style={{ borderColor: color, background: '#fff' }}
                  />
                </div>
              )}
              <button
                onClick={() => {
                  if (n.state === 'locked') {
                    setShakeId(n.lessonId)
                    setTimeout(() => setShakeId(null), 500)
                    return
                  }
                  sfxTap()
                  onStart(n.lessonId)
                }}
                className={cn(
                  'flex items-center justify-center rounded-full font-black text-white shadow-[0_5px_0_0_rgba(0,0,0,.25)] transition-transform hover:scale-105 active:translate-y-[4px] active:shadow-none',
                  size,
                  n.state === 'locked' && 'bg-slate-300 text-slate-400 shadow-none dark:bg-duo-night-600 dark:text-white/30',
                  n.state === 'locked' && shakeId === n.lessonId && 'animate-shake',
                  n.state !== 'locked' && '',
                  n.state === 'current' && 'animate-pulsering scale-110'
                )}
                style={n.state !== 'locked' ? { background: color } : undefined}
                aria-label={n.title}
              >
                {n.state === 'locked' ? (
                  <Lock size={26} />
                ) : n.isBoss ? (
                  <Swords size={34} />
                ) : (
                  <Star size={30} fill="currentColor" />
                )}
              </button>
              {n.state === 'done' && (
                <div className="mt-1.5 flex justify-center gap-0.5">
                  {[0, 1, 2].map((s) => (
                    <Star
                      key={s}
                      size={13}
                      className={s < n.stars ? 'fill-duo-yellow text-duo-yellowdark' : 'fill-black/10 text-transparent'}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mx-auto mt-6 max-w-xs">
        <ProgressBar value={doneCount} max={totalCount} color={color} />
      </div>
    </section>
  )
}
