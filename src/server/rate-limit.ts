/**
 * Простой лимитер «скользящее окно» в памяти процесса.
 *
 * Задача — закрыть перебор паролей на /api/auth/*, где до этого не было
 * никаких ограничений. Состояние процессное: на одном инстансе (docker,
 * VPS, `npm start`) работает как надо; при горизонтальном масштабировании
 * лимит становится «на инстанс» — тогда стоит вынести счётчики в Redis,
 * сохранив эту же сигнатуру.
 */

type Hit = { count: number; resetAt: number }

const buckets = new Map<string, Hit>()

/** Чтобы карта не росла бесконечно на живом сервере. */
const MAX_BUCKETS = 10_000

function sweep(now: number) {
  for (const [key, hit] of buckets) {
    if (hit.resetAt <= now) buckets.delete(key)
  }
}

export type RateLimitResult = {
  ok: boolean
  remaining: number
  /** Сколько секунд ждать до следующей попытки (для заголовка Retry-After). */
  retryAfter: number
}

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
  if (buckets.size > MAX_BUCKETS) sweep(now)

  const hit = buckets.get(key)

  if (!hit || hit.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfter: 0 }
  }

  hit.count += 1

  if (hit.count > limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((hit.resetAt - now) / 1000) }
  }

  return { ok: true, remaining: limit - hit.count, retryAfter: 0 }
}

/** Сбрасывает счётчик — например, после успешного входа. */
export function resetRateLimit(key: string) {
  buckets.delete(key)
}

/** Только для тестов. */
export function clearAllRateLimits() {
  buckets.clear()
}

/**
 * IP клиента. За прокси Next не заполняет req.ip, поэтому читаем
 * стандартные заголовки; при их отсутствии все анонимы схлопываются
 * в один бакет 'unknown' — это осознанно строгий, а не дырявый дефолт.
 */
export function clientIp(req: Request): string {
  const h = req.headers
  const fwd = h.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return h.get('x-real-ip') || h.get('cf-connecting-ip') || 'unknown'
}
