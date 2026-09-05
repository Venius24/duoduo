import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getSessionUser } from '@/server/auth'
import { gradeReview } from '@/server/services/review'

const schema = z.object({
  itemId: z.string().min(1),
  grade: z.number().int().min(0).max(5)
})

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const { itemId, grade } = schema.parse(await req.json())
    const result = await gradeReview(user, itemId, grade)
    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'error' },
      { status: 400 }
    )
  }
}
