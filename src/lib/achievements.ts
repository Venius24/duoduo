export interface AchievementDef {
  code: string
  title: string
  desc: string
  emoji: string
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { code: 'first_lesson', title: 'Первый шаг', desc: 'Заверши свой первый урок', emoji: '🐣' },
  { code: 'perfect_lesson', title: 'Безупречно', desc: 'Пройди урок без единой ошибки', emoji: '💯' },
  { code: 'boss_slayer', title: 'Убийца боссов', desc: 'Победи любого босса юнита', emoji: '⚔️' },
  { code: 'streak_3', title: 'Огонёк', desc: 'Держи стрик 3 дня подряд', emoji: '🔥' },
  { code: 'streak_7', title: 'Неделя огня', desc: 'Держи стрик 7 дней подряд', emoji: '🌋' },
  { code: 'xp_500', title: 'Пятьсот!', desc: 'Набери 500 XP за всё время', emoji: '⚡' },
  { code: 'words_25', title: 'Словарный запас', desc: 'Выучи 25 слов в умном повторении', emoji: '📚' },
  { code: 'polyglot', title: 'Полиглот', desc: 'Начни оба курса — английский и китайский', emoji: '🌏' },
  { code: 'night_owl', title: 'Ночная сова', desc: 'Пройди урок между 00:00 и 6:00', emoji: '🦉' },
  { code: 'rich', title: 'Богач', desc: 'Накопи 1000 алмазов', emoji: '💎' }
]

export interface UserMetrics {
  totalLessons: number
  hasPerfect: boolean
  hasBossWin: boolean
  streak: number
  xp: number
  srsCount: number
  coursesStarted: number
  lastHour: number
  gems: number
}

export function evaluateAchievements(m: UserMetrics): string[] {
  const unlocked: string[] = []
  if (m.totalLessons >= 1) unlocked.push('first_lesson')
  if (m.hasPerfect) unlocked.push('perfect_lesson')
  if (m.hasBossWin) unlocked.push('boss_slayer')
  if (m.streak >= 3) unlocked.push('streak_3')
  if (m.streak >= 7) unlocked.push('streak_7')
  if (m.xp >= 500) unlocked.push('xp_500')
  if (m.srsCount >= 25) unlocked.push('words_25')
  if (m.coursesStarted >= 2) unlocked.push('polyglot')
  if (m.lastHour >= 0 && m.lastHour < 6 && m.totalLessons >= 1) unlocked.push('night_owl')
  if (m.gems >= 1000) unlocked.push('rich')
  return unlocked
}

export const ACHIEVEMENT_MAP = new Map(ACHIEVEMENT_DEFS.map((d) => [d.code, d]))
