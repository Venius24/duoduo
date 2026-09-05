import { NextResponse } from 'next/server'
import { db } from '@/server/db'

export const dynamic = 'force-dynamic'

/**
 * Проба живости для оркестраторов (docker healthcheck, Render, Fly, k8s).
 * Проверяет не только процесс, но и доступность БД — иначе контейнер
 * считался бы здоровым с отвалившимся диском/подключением.
 */
export async function GET() {
  const startedAt = Date.now()
  try {
    await db.$queryRaw`SELECT 1`
    return NextResponse.json({
      status: 'ok',
      db: 'up',
      latencyMs: Date.now() - startedAt,
      uptimeSec: Math.round(process.uptime()),
      version: process.env.APP_VERSION || 'dev'
    })
  } catch (e) {
    console.error('[health] БД недоступна', e)
    return NextResponse.json({ status: 'degraded', db: 'down' }, { status: 503 })
  }
}
