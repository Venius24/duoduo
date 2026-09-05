export interface QuestDef {
  id: string
  icon: string
  title: (target: number) => string
  target: (dailyGoal: number) => number
  reward: number
}

export const QUEST_DEFS: QuestDef[] = [
  { id: 'xp', icon: '⚡', title: (t) => `Заработай ${t} XP`, target: (g) => g, reward: 20 },
  { id: 'lessons', icon: '📘', title: () => 'Заверши 2 урока', target: () => 2, reward: 20 },
  { id: 'correct', icon: '🎯', title: () => 'Дай 15 верных ответов', target: () => 15, reward: 20 },
  { id: 'perfect', icon: '🌟', title: () => 'Пройди урок без ошибок', target: () => 1, reward: 25 },
  { id: 'review', icon: '🧠', title: () => 'Повтори 10 слов', target: () => 10, reward: 20 }
]

export interface DayStatLike {
  xp: number
  lessons: number
  correct: number
  perfectLessons: number
  reviews: number
}

export interface QuestView {
  id: string
  icon: string
  title: string
  progress: number
  target: number
  done: boolean
  claimed: boolean
  reward: number
}

export function buildQuests(dailyGoal: number, stat: DayStatLike, claimedIds: string[]): QuestView[] {
  return QUEST_DEFS.map((def) => {
    const target = def.target(dailyGoal)
    const progressMap: Record<string, number> = {
      xp: stat.xp,
      lessons: stat.lessons,
      correct: stat.correct,
      perfect: stat.perfectLessons,
      review: stat.reviews
    }
    const progress = Math.min(target, progressMap[def.id] || 0)
    return {
      id: def.id,
      icon: def.icon,
      title: def.title(target),
      progress,
      target,
      done: progress >= target,
      claimed: claimedIds.includes(def.id),
      reward: def.reward
    }
  })
}
