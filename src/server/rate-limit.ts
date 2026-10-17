/**
 * Простой лимитер «скользящее окно» в памяти процесса.
 *
 * Задача — закрыть перебор паролей на /api/auth/*, где до этого не было
 * никаких ограничений. Состояние процессное: на одном инстансе (docker,
 * VPS, `npm start`) работает как надо; при горизонтальном масштабировании
 * лимит становится «на инстанс» — тогда стоит вынести счётчики в Redis,
 * сохранив эту же сигнатуру. Для этого есть `checkRateLimit`: она берёт Redis
 * (Upstash REST), если заданы UPSTASH_REDIS_REST_URL/TOKEN.
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
 * Общий счётчик в Redis через REST API Upstash (подходит и для любого
 * совместимого прокси). Включается парой переменных UPSTASH_REDIS_REST_URL и
 * UPSTASH_REDIS_REST_TOKEN. Окно здесь фиксированное (INCR + PEXPIRE NX), а не
 * скользящее: одна атомарная пачка команд вместо цикла read-modify-write.
 *
 * Отказ Redis не должен превращаться в отказ входа: при любой ошибке
 * откатываемся на лимитер в памяти процесса.
 */
export function redisConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

const REDIS_PREFIX = 'duoduo:rl:'
const REDIS_TIMEOUT_MS = 800

async function redisPipeline(cfg: { url: string; token: string }, commands: (string | number)[][]) {
  const res = await fetch(`${cfg.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(REDIS_TIMEOUT_MS),
    cache: 'no-store'
  })
  if (!res.ok) throw new Error(`redis ${res.status}`)
  const out = (await res.json()) as { result?: number; error?: string }[]
  if (out.some((r) => r.error)) throw new Error('redis command failed')
  return out.map((r) => r.result as number)
}

/**
 * Асинхронная точка входа для роутов: Redis, если настроен, иначе память.
 * Сигнатура результата та же, что у `rateLimit`.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): Promise<RateLimitResult> {
  const cfg = redisConfig()
  if (!cfg) return rateLimit(key, limit, windowMs, now)
  try {
    const k = REDIS_PREFIX + key
    const [count, , pttl] = await redisPipeline(cfg, [
      ['INCR', k],
      ['PEXPIRE', k, windowMs, 'NX'],
      ['PTTL', k]
    ])
    if (count > limit) {
      return { ok: false, remaining: 0, retryAfter: Math.max(1, Math.ceil(pttl / 1000)) }
    }
    return { ok: true, remaining: limit - count, retryAfter: 0 }
  } catch (e) {
    console.warn('[rate-limit] Redis недоступен, используем память процесса:', e instanceof Error ? e.message : e)
    return rateLimit(key, limit, windowMs, now)
  }
}

/** Сбрасывает счётчик и в Redis, и в памяти (например, после успешного входа). */
export async function clearRateLimit(key: string): Promise<void> {
  resetRateLimit(key)
  const cfg = redisConfig()
  if (!cfg) return
  try {
    await redisPipeline(cfg, [['DEL', REDIS_PREFIX + key]])
  } catch {
    /* лимит истечёт сам */
  }
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
