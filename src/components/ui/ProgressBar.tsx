'use client'

import { cn } from '@/lib/utils'

export function ProgressBar({
  value,
  max = 100,
  color = '#58CC02',
  className,
  showPercent = false
}: {
  value: number
  max?: number
  color?: string
  className?: string
  showPercent?: boolean
}) {
  const pct = Math.max(0, Math.min(100, Math.round((value / Math.max(1, max)) * 100)))
  return (
    <div
      className={cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-black/10 dark:bg-black/40',
        className
      )}
    >
      <div
        className="relative h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%`, background: color }}
      >
        <div className="absolute inset-x-1 top-[3px] h-[3px] rounded-full bg-white/40" />
      </div>
      {showPercent && (
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold text-white drop-shadow">
          {pct > 12 ? `${pct}%` : ''}
        </span>
      )}
    </div>
  )
}
