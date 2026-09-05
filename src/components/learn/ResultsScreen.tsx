'use client'

import { Gem, Flame } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Mascot } from '@/components/app/Mascot'
import { Button } from '@/components/ui/Button'
import { GoalRing } from '@/components/ui/GoalRing'
import { confetti } from '@/lib/confetti'
import { sfxFinish } from '@/lib/sfx'
import type { CompleteLessonResult } from '@/lib/types'
import type { LocalResult } from './LessonRunner'
import { useEffect } from 'react'

export function ResultsScreen({
  lessonTitle,
  server,
  local,
  onRetry
}: {
  lessonTitle: string
  server: CompleteLessonResult | null
  local: LocalResult
  onRetry: () => void
}) {
  const router = useRouter()
  const passed = server ? server.passed : local.passed

  useEffect(() => {
    if (passed) {
      confetti(110)
      sfxFinish()
    }
  }, [passed])

  const accuracy = Math.round((local.correct / Math.max(1, local.total)) * 100)
  const stars = server?.stars ?? (accuracy === 100 ? 3 : accuracy >= 85 ? 2 : 1)
  const mm = Math.floor(local.seconds / 60)
  const ss = String(local.seconds % 60).padStart(2, '0')

  if (!passed) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-10 text-center">
        <p className="mb-4 text-7xl animate-floaty">🐉</p>
        <h1 className="mb-2 text-3xl font-black text-duo-reddark dark:text-duo-red">Босс победил…</h1>
        <p className="mb-8 text-sm font-semibold text-duo-gray">
          Нужно {server?.percent != null ? '' : ''}набрать больше правильных ответов за отведённое время.
          Ты ответил(а) верно на {local.correct} из {local.total}.
        </p>
        <div className="flex w-full flex-col gap-2.5">
          <Button onClick={onRetry}>Ещё попытка!</Button>
          <Button variant="secondary" onClick={() => router.push('/learn')}>
            Выйти
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 py-10 text-center">
      <Mascot size={130} className="animate-floaty" />
      <h1 className="mt-2 text-3xl font-black text-duo-green">Урок пройден!</h1>
      <p className="mb-6 text-sm font-bold text-duo-gray">{lessonTitle}</p>

      <div className="mb-6 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`animate-popin text-5xl ${i < stars ? '' : 'opacity-25 grayscale'}`}
            style={{ animationDelay: `${i * 180}ms` }}
          >
            ⭐
          </span>
        ))}
      </div>

      <GoalRing percent={accuracy} color="#FFC800" size={150}>
        <span className="text-3xl font-black">{accuracy}%</span>
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-duo-gray">точность</span>
      </GoalRing>

      <div className="mt-6 grid w-full grid-cols-3 gap-2.5">
        <StatCard label="Опыт" value={`+${server?.xpGained ?? 0}`} accent="#FFC800" icon="⚡" />
        <StatCard label="Алмазы" value={`+${server?.gemsGained ?? 0}`} accent="#1CB0F6" />
        <StatCard label="Время" value={`${mm}:${ss}`} accent="#CE82FF" />
      </div>

      {server && (
        <div className="mt-4 flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-extrabold text-orange-600 dark:bg-orange-500/15 dark:text-orange-300">
          <Flame size={16} /> Стрик: {server.streak} дн.
          {server.gemsLeft != null && (
            <span className="ml-2 flex items-center text-duo-blue">
              <Gem size={14} /> {server.gemsLeft}
            </span>
          )}
        </div>
      )}

      {server?.leveledUp && (
        <div className="mt-3 animate-popin rounded-2xl bg-gradient-to-r from-duo-purple to-duo-blue px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg">
          🎉 Новый уровень: {server.newLevel}!
        </div>
      )}

      {server && server.newAchievements.length > 0 && (
        <div className="mt-4 w-full">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-duo-gray">
            Новые достижения
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {server.newAchievements.map((a) => (
              <div
                key={a.code}
                className="animate-popin flex items-center gap-2 rounded-xl border-2 border-duo-yellow/50 bg-duo-yellowlight px-3 py-2 dark:bg-duo-yellow/10"
              >
                <span className="text-xl">{a.emoji}</span>
                <div className="text-left">
                  <p className="text-xs font-extrabold">{a.title}</p>
                  <p className="text-[10px] font-semibold text-duo-gray">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex w-full flex-col gap-2.5">
        <Button onClick={() => router.push('/learn')}>Продолжить</Button>
        <Button variant="secondary" onClick={onRetry}>
          Пройти ещё раз
        </Button>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  accent,
  icon
}: {
  label: string
  value: string
  accent: string
  icon?: string
}) {
  return (
    <div className="rounded-2xl border-2 border-black/5 bg-white p-3 dark:border-white/10 dark:bg-duo-night-700">
      <p className="text-lg font-black" style={{ color: accent }}>
        {icon ? `${icon} ` : ''}
        {value}
      </p>
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-duo-gray">{label}</p>
    </div>
  )
}
