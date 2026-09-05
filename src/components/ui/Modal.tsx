'use client'

import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function Modal({
  open,
  onClose,
  children,
  wide = false
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`animate-slideup relative w-full ${
          wide ? 'max-w-2xl' : 'max-w-md'
        } rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-duo-night-700 sm:rounded-3xl`}
      >
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-4 top-4 rounded-full p-1.5 text-duo-gray transition hover:bg-black/5 hover:text-duo-ink dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  )
}
