import type { AchievementDef } from './achievements'
import type { LevelInfo } from './levels'
import type { QuestView } from './quests'

export interface UserPublic {
  id: string
  email: string
  name: string
  color: string
  xp: number
  gems: number
  hearts: number
  heartsMax: number
  streak: number
  bestStreak: number
  dailyGoal: number
  ttsRate: number
  activeCourse: string
  level: LevelInfo
}

export interface TodayStat {
  xp: number
  lessons: number
  correct: number
  perfectLessons: number
  reviews: number
}

export interface ProgressRow {
  courseId: string
  unitId: string
  lessonId: string
  stars: number
  completed: boolean
}

export interface MePayload {
  user: UserPublic
  today: TodayStat
  quests: QuestView[]
  progress: ProgressRow[]
  dueCount: number
  weekXp: number
}

export interface CompleteLessonInput {
  attemptId: string
  courseId: string
  unitId: string
  lessonId: string
  correct: number
  total: number
  seconds: number
}

export interface CompleteLessonResult {
  passed: boolean
  firstTime: boolean
  stars: number
  percent: number
  xpGained: number
  gemsGained: number
  streak: number
  leveledUp: boolean
  newLevel: number | null
  newAchievements: AchievementDef[]
  heartsLeft: number
  gemsLeft: number
}

export interface LeaderboardEntry {
  id: string
  name: string
  color: string
  weeklyXp: number
  isBot: boolean
  isMe: boolean
}

export interface StatsPayload {
  user: UserPublic
  lessonsDone: number
  perfectCount: number
  srsCount: number
  daysActive: number
  totalCorrect: number
  maxXpDay: number
  courseStats: { courseId: string; done: number; total: number; percent: number }[]
  achievements: { def: AchievementDef; unlockedAt: string | null }[]
}
