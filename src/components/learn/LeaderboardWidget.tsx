'use client'

import { ChevronRight, Trophy } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { LeaderboardEntry } from '@/lib/types'

export function LeaderboardWidget() {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null)

  useEffect(() => {
    api<{ entries: LeaderboardEntry[] }>('/api/leaderboard')
      .then((r) => setEntries(r.entries.slice(0, 5)))
      .catch(() => setEntries([]))
  }, [])

  return (
    <div className="rounded-2xl border-2 border-black/5 bg-white p-4 dark:border-white/10 dark:bg-duo-night-700">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wider text-duo-gray">
          <Trophy size={15} className="text-duo-yellowdark" /> Лига недели
        </h3>
        <Link href="/leaderboard" className="flex items-center text-xs font-extrabold text-duo-blue">
          Вся лига <ChevronRight size={14} />
        </Link>
      </div>
      {!entries ? (
        <p className="py-3 text-center text-sm font-bold text-duo-gray">Загрузка…</p>
      ) : entries.length === 0 ? (
        <p className="py-3 text-center text-sm font-bold text-duo-gray">Пока пусто</p>
      ) : (
        <ol className="space-y-2">
          {entries.map((e, i) => (
            <li
              key={e.id}
              className={`flex items-center gap-2.5 rounded-xl px-2 py-1.5 ${e.isMe ? 'bg-duo-bluelight/60 dark:bg-duo-blue/15' : ''}`}
            >
              <span className="w-5 text-center text-sm font-black text-duo-gray">{i + 1}</span>
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-extrabold text-white"
                style={{ background: e.color }}
              >
                {e.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-bold">
                {e.name}
                {e.isBot && <span className="ml-1 text-[10px] font-semibold text-duo-gray">бот</span>}
              </span>
              <span className="text-sm font-extrabold text-orange-500">{e.weeklyXp} XP</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
