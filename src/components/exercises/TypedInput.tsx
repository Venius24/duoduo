'use client'

import type { KeyboardEvent } from 'react'
import type { Lang } from '@/content/types'

export function TypedInput({
  value,
  onChange,
  onEnter,
  locked,
  placeholder,
  autoFocus = true
}: {
  value: string
  onChange: (v: string) => void
  onEnter?: () => void
  locked: boolean
  placeholder?: string
  autoFocus?: boolean
}) {
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onEnter?.()
    }
  }
  return (
    <input
      autoFocus={autoFocus}
      dir="auto"
      value={value}
      disabled={locked}
      placeholder={placeholder}
      spellCheck={false}
      autoComplete="off"
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKey}
      className="w-full rounded-xl border-2 border-b-4 border-black/10 bg-white px-4 py-3.5 text-lg font-bold outline-none transition focus:border-duo-blue disabled:opacity-60 dark:border-white/15 dark:bg-duo-night-600"
    />
  )
}
