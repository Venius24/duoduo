'use client'

import { Crown, Medal, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { api } from '@/lib/api'
import { useMe } from '@/lib/me-store'
import { cn } from '@/lib/utils'
import type { LeaderboardEntry } from '@/lib/types'

const MEDALS = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const { data, load } = useMe()
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null)

  useEffect(() => {
    if (!data) load()
    api<{ entries: LeaderboardEntry[] }>('/api/leaderboard')
      .then((r) => setEntries(r.entries))
      .catch(() => setEntries([]))
  }, [])

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setUTCDate(now.getUTCDate() - ((now.getUTCDay() || 7) - 1))

  return (
    <AppShell>
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-duo-blue p-6 text-white shadow-lg">
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest opacity-90">
          <ShieldCheck size={15} /> Лиго недели
        </p>
        <h1 className="mt-1 text-3xl font-black">Изумрудная лига</h1>
        <p className="mt-1 text-sm font-bold opacity-90">
          {weekStart.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} —{' '}
          {new Date(weekStart.getTime() + 6 * 86400000).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long'
          })}
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">
          <Crown size={13} /> Топ-7 выходят в высшую лигу
        </p>
      </div>

      {!entries ? (
        <p className="py-16 text-center text-sm font-bold text-duo-gray">Загрузка…</p>
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border-2 border-black/5 dark:border-white/10">
          {entries.map((e, i) => (
            <div key={e.id}>
              {i === 7 && (
                <div className="relative flex items-center px-4 py-2">
                  <div className="h-px w-full bg-duo-purple/50" />
                  <span className="absolute left-1/2 -translate-x-1/2 rounded-full bg-duo-purplelight px-3 text-[10px] font-extrabold uppercase tracking-wider text-duo-purpledark dark:bg-duo-night-700 dark:text-duo-purple">
                    зона повышения
                  </span>
                </div>
              )}
              <div
                className={cn(
                  'flex items-center gap-3 px-4 py-3',
                  i % 2 === 0 ? 'bg-white dark:bg-duo-night-800' : 'bg-black/[.02] dark:bg-white/[.03]',
                  e.isMe && 'bg-duo-bluelight/70! dark:bg-duo-blue/20!'
                )}
              >
                <span className="w-8 text-center text-base font-black text-duo-gray">
                  {i < 3 ? MEDALS[i] : i + 1}
                </span>
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
                  style={{ background: e.color }}
                >
                  {e.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate font-bold">
                  {e.name}
                  {e.isMe && <span className="ml-1.5 text-xs font-extrabold text-duo-blue">(ты)</span>}
                  {e.isBot && !e.isMe && (
                    <span className="ml-1.5 text-[10px] font-semibold uppercase text-duo-gray">бот</span>
                  )}
                </span>
                {i < 3 && <Medal size={15} className="text-duo-yellowdark" />}
                <span className="w-16 text-right font-extrabold text-orange-500">{e.weeklyXp} XP</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  )
}
