import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { attachAuthCookie, signToken } from '@/server/auth'
import { AuthError, loginUser } from '@/server/services/authService'

const schema = z.object({ email: z.string().min(3), password: z.string().min(1) })

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json())
    const user = await loginUser(body.email, body.password)
    const token = await signToken(user.id)
    const res = NextResponse.json({ ok: true })
    await attachAuthCookie(res, token, req)
    return res
  } catch (e) {
    if (e instanceof z.ZodError || e instanceof AuthError) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 })
  }
}
