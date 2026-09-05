import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getCourse } from '@/content'
import { getSessionUser } from '@/server/auth'
import { db } from '@/server/db'
import { buildMePayload } from '@/server/services/users'
import { errorResponse } from '@/server/http'

/** Цвет аватара уходит в style={{ background }} — принимаем только hex. */
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

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
  color: z.string().regex(HEX_COLOR, 'Цвет должен быть в формате #RRGGBB').optional()
})

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const body = patchSchema.parse(await req.json())
    if (body.activeCourse && !getCourse(body.activeCourse)) {
      return NextResponse.json({ error: 'Неизвестный курс' }, { status: 400 })
    }
    await db.user.update({ where: { id: user.id }, data: body })
    const payload = await buildMePayload(await db.user.findUniqueOrThrow({ where: { id: user.id } }))
    return NextResponse.json(payload)
  } catch (e) {
    return errorResponse(e)
  }
}
