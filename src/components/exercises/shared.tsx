'use client'

import { Volume2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { speak } from '@/lib/speech'
import { cn } from '@/lib/utils'

export function Prompt({ children, note }: { children: ReactNode; note?: string }) {
  return (
    <div className="mb-5 text-center">
      <h2 className="text-xl font-extrabold leading-snug sm:text-2xl">{children}</h2>
      {note && <p className="mt-1 text-sm font-semibold text-duo-gray">{note}</p>}
    </div>
  )
}

export function AudioButton({
  text,
  lang,
  rate = 1,
  size = 'md',
  className
}: {
  text: string
  lang: string
  rate?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const dims = size === 'lg' ? 'h-24 w-24' : size === 'sm' ? 'h-9 w-9' : 'h-14 w-14'
  const icon = size === 'lg' ? 42 : size === 'sm' ? 16 : 26
  return (
    <button
      aria-label="Прослушать"
      onClick={(e) => {
        e.stopPropagation()
        speak(text, lang, rate)
      }}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-2xl bg-duo-blue text-white shadow-[0_4px_0_0_#1899D6] transition active:translate-y-[3px] active:shadow-none',
        dims,
        className
      )}
    >
      <Volume2 size={icon} />
    </button>
  )
}

export function OptionButton({
  selected,
  correct,
  wrong,
  locked,
  onClick,
  children,
  multiline = false
}: {
  selected?: boolean
  correct?: boolean
  wrong?: boolean
  locked?: boolean
  onClick?: () => void
  children: ReactNode
  multiline?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={cn(
        'relative rounded-xl border-2 border-b-4 px-4 py-3 text-left text-sm font-bold transition-all sm:text-base',
        multiline && 'leading-relaxed',
        !selected && !correct && !wrong && 'border-black/10 bg-white hover:bg-duo-bluelight/40 dark:border-white/15 dark:bg-duo-night-600 dark:hover:bg-duo-night-border',
        selected && !locked && 'border-duo-blue bg-duo-bluelight/70 text-duo-blue dark:border-duo-blue dark:bg-duo-blue/20 dark:text-duo-bluelight',
        correct && 'border-duo-green bg-duo-greenlight/60 text-duo-greendark dark:bg-duo-green/20 dark:text-duo-greenlight',
        wrong && 'border-duo-red bg-duo-redlight text-duo-reddark dark:bg-duo-red/20 dark:text-duo-redlight animate-shake',
        locked && !correct && !wrong && 'opacity-50'
      )}
    >
      {children}
    </button>
  )
}
