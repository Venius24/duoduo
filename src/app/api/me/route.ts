import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getCourse } from '@/content'
import { getSessionUser } from '@/server/auth'
import { db } from '@/server/db'
import { buildMePayload } from '@/server/services/users'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const payload = await buildMePayload(user)
  return NextResponse.json(payload)
}

const patchSchema = z.object({
  dailyGoal: z.number().int().min(10).max(300).optional(),
  activeCourse: z.string().optional(),
  ttsRate: z.number().min(0.5).max(1.5).optional(),
  name: z.string().min(2).max(24).optional(),
  color: z.string().optional()
})

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = patchSchema.parse(await req.json())
  if (body.activeCourse && !getCourse(body.activeCourse)) {
    return NextResponse.json({ error: 'Неизвестный курс' }, { status: 400 })
  }
  await db.user.update({ where: { id: user.id }, data: body })
  const payload = await buildMePayload(await db.user.findUniqueOrThrow({ where: { id: user.id } }))
  return NextResponse.json(payload)
}
