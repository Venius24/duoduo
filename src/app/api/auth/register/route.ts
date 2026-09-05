import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { attachAuthCookie, signToken } from '@/server/auth'
import { AuthError, registerUser } from '@/server/services/authService'

const schema = z.object({
  email: z.string().min(3),
  name: z.string().min(2).max(24),
  password: z.string().min(6).max(72),
  color: z.string().optional()
})

const MESSAGES: Record<string, string> = {
  EMAIL_TAKEN: 'Такой email уже зарегистрирован',
  BAD_EMAIL: 'Некорректный email',
  BAD_NAME: 'Имя должно быть от 2 символов',
  BAD_PASSWORD: 'Пароль должен быть от 6 символов'
}

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json())
    const user = await registerUser(body.email, body.name, body.password, body.color || '#58CC02')
    const token = await signToken(user.id)
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
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 })
  }
}
