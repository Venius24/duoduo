import { NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit, clientIp } from './rate-limit'

/** Ответ 429 с корректным Retry-After. */
export function tooManyRequests(retryAfter: number) {
  return NextResponse.json(
    { error: `Слишком много попыток. Попробуй снова через ${retryAfter} с.` },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )
}

/**
 * Проверяет лимит по IP. Возвращает готовый 429-ответ либо null,
 * если запрос можно обрабатывать дальше.
 */
export async function guard(req: Request, scope: string, limit: number, windowMs: number) {
  const res = await checkRateLimit(`${scope}:${clientIp(req)}`, limit, windowMs)
  return res.ok ? null : tooManyRequests(res.retryAfter)
}

/**
 * Единый разбор ошибок роутов. Невалидное тело — это 400, а не 500:
 * раньше `schema.parse` в /api/me и /api/ai/explain бросал ZodError наружу
 * и клиент получал «Внутренняя ошибка» на обычную опечатку в запросе.
 */
export function errorResponse(e: unknown, fallbackMessage = 'Внутренняя ошибка') {
  if (e instanceof z.ZodError) {
    return NextResponse.json({ error: 'Некорректные данные запроса' }, { status: 400 })
  }
  if (e instanceof SyntaxError) {
    return NextResponse.json({ error: 'Тело запроса — не JSON' }, { status: 400 })
  }
  console.error('[api]', e)
  return NextResponse.json({ error: fallbackMessage }, { status: 500 })
}
