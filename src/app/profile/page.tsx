'use client'

import { Flame, Lock, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { GoalRing } from '@/components/ui/GoalRing'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { api } from '@/lib/api'
import { useMe } from '@/lib/me-store'
import type { StatsPayload } from '@/lib/types'

export default function ProfilePage() {
  const { load } = useMe()
  const [stats, setStats] = useState<StatsPayload | null>(null)

  useEffect(() => {
    load()
    api<StatsPayload>('/api/stats')
      .then(setStats)
      .catch(() => {})
  }, [load])

  if (!stats) {
    return (
      <AppShell>
        <div className="flex h-[60vh] items-center justify-center">
          <RefreshCw size={30} className="animate-spin text-duo-green" />
        </div>
      </AppShell>
    )
  }

  const u = stats.user

  return (
    <AppShell>
      <div className="mb-6 flex flex-col items-center gap-4 rounded-3xl border-2 border-black/5 bg-white p-6 text-center dark:border-white/10 dark:bg-duo-night-700 sm:flex-row sm:text-left">
        <span
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-3xl font-black text-white shadow-inner"
          style={{ background: u.color }}
        >
          {u.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="flex-1">
          <h1 className="text-2xl font-black">{u.name}</h1>
          <p className="text-sm font-semibold text-duo-gray">{u.email}</p>
          <div className="mt-2 max-w-xs">
            <ProgressBar value={u.level.current} max={u.level.needed} color="#CE82FF" />
            <p className="mt-1 text-xs font-extrabold text-duo-gray">
              Уровень {u.level.level} · {u.level.title} · {u.level.current}/{u.level.needed} XP
            </p>
          </div>
        </div>
        <GoalRing percent={(u.xp % 100)} size={110} color="#FFC800">
          <span className="text-xl font-black">{u.xp}</span>
          <span className="text-[10px] font-extrabold uppercase text-duo-gray">всего XP</span>
        </GoalRing>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<Flame size={18} className="text-orange-500" />} label="Стрик" value={`${u.streak} дн.`} sub={`рекорд: ${u.bestStreak}`} />
        <StatCard icon="📘" label="Уроков пройдено" value={String(stats.lessonsDone)} sub={`${stats.perfectCount} идеально`} />
        <StatCard icon="🧠" label="Слов в повторении" value={String(stats.srsCount)} sub={`${stats.daysActive} дней активности`} />
        <StatCard icon="🎯" label="Верных ответов" value={String(stats.totalCorrect)} sub={`лучший день: ${stats.maxXpDay} XP`} />
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {stats.courseStats.map((cs) => {
          const meta = cs.courseId === 'en' ? { flag: '🇬🇧', name: 'English Flow' } : { flag: '🇨🇳', name: 'Путь дракона' }
          return (
            <div key={cs.courseId} className="rounded-2xl border-2 border-black/5 bg-white p-4 dark:border-white/10 dark:bg-duo-night-700">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-extrabold">
                  {meta.flag} {meta.name}
                </p>
                <span className="text-sm font-black text-duo-green">{cs.percent}%</span>
              </div>
              <ProgressBar value={cs.done} max={cs.total} color={cs.courseId === 'en' ? '#58CC02' : '#FF4B4B'} />
              <p className="mt-1 text-xs font-bold text-duo-gray">
                {cs.done}/{cs.total} уроков
              </p>
            </div>
          )
        })}
      </div>

      <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-duo-gray">Достижения</h2>
      <div className="grid grid-cols-2 gap-3 pb-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.achievements.map(({ def, unlockedAt }) => {
          const unlocked = !!unlockedAt
          return (
            <div
              key={def.code}
              className={`rounded-2xl border-2 p-4 text-center transition ${
                unlocked
                  ? 'border-duo-yellow/60 bg-duo-yellowlight/60 hover:-translate-y-1 hover:shadow-md dark:bg-duo-yellow/10'
                  : 'border-black/5 bg-black/[.03] opacity-60 dark:border-white/10 dark:bg-white/5'
              }`}
            >
              <p className={`text-4xl ${unlocked ? '' : 'grayscale'}`}>{unlocked ? def.emoji : '🔒'}</p>
              <p className="mt-1.5 text-sm font-extrabold leading-tight">{def.title}</p>
              <p className="mt-0.5 text-[11px] font-semibold leading-snug text-duo-gray">{def.desc}</p>
              {unlocked ? (
                <p className="mt-1 text-[10px] font-bold text-duo-greendark">
                  {new Date(unlockedAt!).toLocaleDateString('ru-RU')}
                </p>
              ) : (
                <Lock size={11} className="mx-auto mt-1.5 text-duo-gray" />
              )}
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-2xl border-2 border-black/5 bg-white p-4 dark:border-white/10 dark:bg-duo-night-700">
      <div className="mb-1">{icon}</div>
      <p className="text-xl font-black">{value}</p>
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-duo-gray">{label}</p>
      {sub && <p className="text-[10px] font-semibold text-duo-gray/80">{sub}</p>}
    </div>
  )
}
