import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getSessionUser } from '@/server/auth'
import { aiExplain } from '@/server/ai'
import { errorResponse, guard } from '@/server/http'

// Эндпоинт ходит во внешний платный API — ограничиваем даже залогиненных.
const LIMIT = 30
const WINDOW_MS = 5 * 60 * 1000

const schema = z.object({
  prompt: z.string().max(300).optional(),
  answer: z.string().max(300).optional(),
  userAnswer: z.string().max(300).optional(),
  explainFallback: z.string().max(300).optional()
})

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const limited = guard(req, `ai:${user.id}`, LIMIT, WINDOW_MS)
  if (limited) return limited

  try {
    const body = schema.parse(await req.json())
    const result = await aiExplain(body)
    return NextResponse.json(result)
  } catch (e) {
    return errorResponse(e)
  }
}
