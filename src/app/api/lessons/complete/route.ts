import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import type { CompleteLessonResult } from '@/lib/types'
import { getSessionUser } from '@/server/auth'
import { AttemptError } from '@/server/services/attempts'
import { completeLesson } from '@/server/services/lessons'

const schema = z.object({
  attemptId: z.string().min(1).max(64),
  courseId: z.string(),
  unitId: z.string(),
  lessonId: z.string(),
  correct: z.number().int().min(0).max(999),
  total: z.number().int().min(1).max(999),
  seconds: z.number().int().min(0).max(7200)
})

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const input = schema.parse(await req.json())
    const result: CompleteLessonResult = await completeLesson(user, input)
    return NextResponse.json(result)
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'bad_request' }, { status: 400 })
    }
    if (e instanceof AttemptError) {
      const status = e.code === 'ATTEMPT_USED' ? 409 : 400
      return NextResponse.json({ error: e.code }, { status })
    }
    return NextResponse.json({ error: e instanceof Error ? e.message : 'error' }, { status: 400 })
  }
}
