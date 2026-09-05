'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function FeedbackBanner({
  status,
  answer,
  explain,
  onContinue,
  onAskAi,
  aiText,
  aiLoading,
  aiSource
}: {
  status: 'correct' | 'typo' | 'wrong'
  answer?: string
  explain?: string
  onContinue: () => void
  onAskAi?: () => void
  aiText?: string
  aiLoading?: boolean
  aiSource?: 'ai' | 'local'
}) {
  const styles =
    status === 'wrong'
      ? 'bg-duo-redlight dark:bg-[#3b1d22]'
      : status === 'typo'
        ? 'bg-duo-yellowlight dark:bg-[#3a3320]'
        : 'bg-duo-greenlight dark:bg-[#1e3320]'

  const accent = status === 'wrong' ? '#FF4B4B' : status === 'typo' ? '#E6AC00' : '#58CC02'
  const title = status === 'correct' ? 'Отлично!' : status === 'typo' ? 'Почти! Есть опечатка' : 'Правильный ответ:'

  return (
    <div className={`fixed inset-x-0 bottom-0 z-50 ${styles}`}>
      <div className="mx-auto flex max-w-3xl items-center gap-4 p-4 sm:p-5">
        <div
          className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-2xl font-black shadow sm:flex"
          style={{ color: accent }}
        >
          {status === 'wrong' ? '✕' : status === 'typo' ? '⚠' : '✓'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-extrabold" style={{ color: accent }}>
            {title}
          </p>
          {status !== 'correct' && answer && (
            <p className="truncate text-sm font-extrabold text-duo-ink dark:text-white">{answer}</p>
          )}
          {explain && (
            <p className="mt-0.5 truncate text-xs font-semibold text-duo-ink/70 dark:text-white/70">
              {explain}
            </p>
          )}
          {aiText && (
            <p className="mt-1 rounded-lg bg-white/70 p-2 text-xs font-semibold text-duo-ink dark:bg-black/30 dark:text-white">
              {aiText}
            </p>
          )}
          {onAskAi && !aiText && (
            <button
              onClick={onAskAi}
              disabled={aiLoading}
              className="mt-1 text-xs font-extrabold text-duo-blue underline-offset-2 hover:underline disabled:opacity-50"
            >
              {aiLoading ? 'Думаю…' : '🤖 Объяснить подробнее'}
            </button>
          )}
        </div>
        <Button
          variant={status === 'wrong' ? 'danger' : status === 'typo' ? 'gold' : 'primary'}
          onClick={onContinue}
          className="shrink-0"
        >
          Продолжить
        </Button>
      </div>
    </div>
  )
}

export function QuitButton({ onQuit }: { onQuit: () => void }) {
  return (
    <button
      onClick={onQuit}
      aria-label="Выйти из урока"
      className="rounded-full p-2 text-duo-gray transition hover:bg-black/5 hover:text-duo-red dark:hover:bg-white/10"
    >
      <X size={24} strokeWidth={3} />
    </button>
  )
}
