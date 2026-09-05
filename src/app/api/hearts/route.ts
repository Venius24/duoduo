import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getSessionUser } from '@/server/auth'
import { db } from '@/server/db'
import { errorResponse } from '@/server/http'

const schema = z.object({ action: z.enum(['lose', 'refill']) })
const REFILL_COST = 100

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  let action: 'lose' | 'refill'
  try {
    action = schema.parse(await req.json()).action
  } catch (e) {
    return errorResponse(e)
  }

  if (action === 'lose') {
    if (user.hearts <= 0) {
      return NextResponse.json({ hearts: 0, gems: user.gems })
    }
    const data: { hearts: number; heartsUpdated?: Date } = { hearts: user.hearts - 1 }
    if (user.hearts === user.heartsMax) data.heartsUpdated = new Date()
    const updated = await db.user.update({ where: { id: user.id }, data })
    return NextResponse.json({ hearts: updated.hearts, gems: updated.gems })
  }

  if (user.gems < REFILL_COST) {
    return NextResponse.json({ error: 'Недостаточно алмазов', hearts: user.hearts, gems: user.gems }, { status: 400 })
  }
  const updated = await db.user.update({
    where: { id: user.id },
    data: { gems: { decrement: REFILL_COST }, hearts: user.heartsMax, heartsUpdated: new Date() }
  })
  return NextResponse.json({ hearts: updated.hearts, gems: updated.gems })
}
