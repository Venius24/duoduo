import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { attachAuthCookie, signToken } from '@/server/auth'
import { AuthError, registerUser } from '@/server/services/authService'
import { guard } from '@/server/http'

const LIMIT = 5
const WINDOW_MS = 60 * 60 * 1000

const schema = z.object({
  email: z.string().min(3),
  name: z.string().min(2).max(24),
  password: z.string().min(6).max(72),
  // Цвет попадает в style={{ background }} на странице лиги —
  // принимаем только hex, чтобы через него нельзя было пропихнуть url(...).
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional()
})

const MESSAGES: Record<string, string> = {
  EMAIL_TAKEN: 'Такой email уже зарегистрирован',
  BAD_EMAIL: 'Некорректный email',
  BAD_NAME: 'Имя должно быть от 2 символов',
  BAD_PASSWORD: 'Пароль должен быть от 6 символов'
}

export async function POST(req: NextRequest) {
  const limited = await guard(req, 'register', LIMIT, WINDOW_MS)
  if (limited) return limited

  try {
    const body = schema.parse(await req.json())
    const user = await registerUser(body.email, body.name, body.password, body.color || '#58CC02')
    const token = await signToken(user.id, user.tokenVersion)
    const res = NextResponse.json({ ok: true })
    await attachAuthCookie(res, token, req)
    return res
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Заполни все поля правильно' }, { status: 400 })
    }
    if (e instanceof AuthError) {
      return NextResponse.json({ error: MESSAGES[e.code] || 'Ошибка регистрации' }, { status: 400 })
    }
    console.error('[register]', e)
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 })
  }
}
