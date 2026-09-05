import type { User } from '@prisma/client'
import { hashStr, dateStr, weekKeyStr } from '@/lib/utils'
import type { LeaderboardEntry } from '@/lib/types'
import { db } from '../db'

export async function getLeaderboard(me: User): Promise<LeaderboardEntry[]> {
  const wk = weekKeyStr()
  const rows = await db.user.findMany({
    where: { role: { in: ['user', 'bot'] } },
    orderBy: { weeklyXp: 'desc' },
    take: 40,
    select: { id: true, name: true, color: true, role: true, weeklyXp: true }
  })

  const dayIdx = new Date().getUTCDay()
  const progress = Math.min(1, (dayIdx === 0 ? 7 : dayIdx) / 7)

  const entries = rows
    .map((r) => {
      let weeklyXp = r.weeklyXp
      if (r.role === 'bot') {
        const seed = hashStr(`${r.id}|${wk}|${dateStr()}`)
        const factor = 0.55 + ((seed % 1000) / 1000) * 0.45 * progress + 0.0001
        weeklyXp = Math.floor(r.weeklyXp * factor)
      }
      return {
        id: r.id,
        name: r.name,
        color: r.color,
        weeklyXp,
        isBot: r.role === 'bot',
        isMe: r.id === me.id
      }
    })
    .sort((a, b) => b.weeklyXp - a.weeklyXp)
    .slice(0, 30)

  return entries
}
