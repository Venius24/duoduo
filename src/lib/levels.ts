export interface LevelInfo {
  level: number
  title: string
  current: number
  needed: number
  progress: number
}

const LEVEL_TITLES = [
  'Новичок',
  'Ученик',
  'Знаток',
  'Бывалый',
  'Умник',
  'Магистр',
  'Гуру',
  'Полиглот',
  'Легенда',
  'Дракон'
]

export function xpForLevel(level: number): number {
  return 100 + (level - 1) * 50
}

export function levelInfo(xp: number): LevelInfo {
  let level = 1
  let remaining = xp
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level)
    level++
  }
  const needed = xpForLevel(level)
  return {
    level,
    title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
    current: remaining,
    needed,
    progress: Math.min(1, remaining / needed)
  }
}

export function xpForLesson(isBoss: boolean, perfect: boolean, firstTime: boolean): number {
  const base = isBoss ? 30 : 12
  const bonus = perfect ? 6 : 0
  return firstTime ? base + bonus : Math.ceil((base + bonus) * 0.3)
}

export function gemsForLesson(isBoss: boolean, perfect: boolean): number {
  return (isBoss ? 20 : 5) + (perfect ? 5 : 0)
}

export function starsFor(percent: number): number {
  if (percent >= 100) return 3
  if (percent >= 85) return 2
  return 1
}
