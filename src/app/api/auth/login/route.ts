import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { attachAuthCookie, signToken } from '@/server/auth'
import { AuthError, loginUser } from '@/server/services/authService'
import { guard } from '@/server/http'
import { clientIp, resetRateLimit } from '@/server/rate-limit'

const LIMIT = 10
const WINDOW_MS = 10 * 60 * 1000

const schema = z.object({ email: z.string().min(3), password: z.string().min(1) })

export async function POST(req: NextRequest) {
  const limited = guard(req, 'login', LIMIT, WINDOW_MS)
  if (limited) return limited

  try {
    const body = schema.parse(await req.json())
    const user = await loginUser(body.email, body.password)
    // Успешный вход не должен «съедать» лимит у пользователя с общим IP.
    resetRateLimit(`login:${clientIp(req)}`)
    const token = await signToken(user.id)
    const res = NextResponse.json({ ok: true })
    await attachAuthCookie(res, token, req)
    return res
  } catch (e) {
    if (e instanceof z.ZodError || e instanceof AuthError) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })
    }
    console.error('[login]', e)
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 })
  }
}
