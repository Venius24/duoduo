import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getSessionUser } from '@/server/auth'
import { errorResponse } from '@/server/http'
import { AttemptError, startAttempt } from '@/server/services/attempts'

const schema = z.object({
  courseId: z.string().max(16),
  unitId: z.string().max(32),
  lessonId: z.string().max(32)
})

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const { courseId, unitId, lessonId } = schema.parse(await req.json())
    return NextResponse.json(await startAttempt(user, courseId, unitId, lessonId))
  } catch (e) {
    if (e instanceof AttemptError) return NextResponse.json({ error: e.code }, { status: 404 })
    return errorResponse(e)
  }
}
