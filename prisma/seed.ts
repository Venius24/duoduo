import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

const BOT_NAMES = [
  'Аня', 'Борис', 'Вика', 'Гоша', 'Даша', 'Егор',
  'Женя', 'Зоя', 'Игорь', 'Катя', 'Лёша', 'Маша',
  'Ника', 'Олег', 'Паша', 'Руслан', 'Соня', 'Тимур',
  'Ульяна', 'Федя', 'Ханна', 'Чингиз', 'Шура', 'Эрик',
  'Юля', 'Ян'
]

const COLORS = ['#58CC02', '#1CB0F6', '#CE82FF', '#FF9600', '#FF4B4B', '#00CD9C']

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
  const passwordHash = await bcrypt.hash('demo123', 10)

  const demo = await db.user.upsert({
    where: { email: 'demo@duoduo.app' },
    update: {},
    create: {
      email: 'demo@duoduo.app',
      name: 'Демо',
      passwordHash,
      color: COLORS[0],
      gems: 750,
      streak: 2,
      bestStreak: 5,
      dailyGoal: 40
    }
  })

  const y = new Date()
  y.setUTCDate(y.getUTCDate() - 1)
  const yStr = y.toISOString().slice(0, 10)
  await db.dayStat.upsert({
    where: { userId_date: { userId: demo.id, date: yStr } },
    update: {},
    create: { userId: demo.id, date: yStr, xp: 42, lessons: 2, correct: 26, perfectLessons: 1 }
  })

  let weeklyXp = 30
  for (let i = 0; i < BOT_NAMES.length; i++) {
    weeklyXp = Math.max(15, weeklyXp + rand(-25, 55))
    const email = `bot${i + 1}@duoduo.local`
    await db.user.upsert({
      where: { email },
      update: { weeklyXp },
      create: {
        email,
        name: BOT_NAMES[i],
        passwordHash,
        role: 'bot',
        color: COLORS[i % COLORS.length],
        xp: weeklyXp * rand(3, 8),
        weeklyXp
      }
    })
  }

  console.log('Seed OK: demo@duoduo.app / demo123 + bots:', BOT_NAMES.length)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
