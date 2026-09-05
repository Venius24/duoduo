import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { clearAllRateLimits, clientIp, rateLimit, resetRateLimit } from '@/server/rate-limit'

describe('rateLimit', () => {
  beforeEach(() => clearAllRateLimits())

  it('пропускает запросы до лимита и блокирует после', () => {
    for (let i = 0; i < 3; i++) {
      expect(rateLimit('k', 3, 1000).ok).toBe(true)
    }
    const blocked = rateLimit('k', 3, 1000)
    expect(blocked.ok).toBe(false)
    expect(blocked.retryAfter).toBeGreaterThan(0)
  })

  it('считает ключи независимо', () => {
    rateLimit('a', 1, 1000)
    expect(rateLimit('a', 1, 1000).ok).toBe(false)
    expect(rateLimit('b', 1, 1000).ok).toBe(true)
  })

  it('открывает новое окно после истечения текущего', () => {
    const t0 = 1_000_000
    expect(rateLimit('w', 1, 1000, t0).ok).toBe(true)
    expect(rateLimit('w', 1, 1000, t0 + 500).ok).toBe(false)
    expect(rateLimit('w', 1, 1000, t0 + 1500).ok).toBe(true)
  })

  it('remaining уменьшается до нуля', () => {
    expect(rateLimit('r', 2, 1000).remaining).toBe(1)
    expect(rateLimit('r', 2, 1000).remaining).toBe(0)
  })

  it('resetRateLimit снимает блокировку', () => {
    rateLimit('s', 1, 1000)
    expect(rateLimit('s', 1, 1000).ok).toBe(false)
    resetRateLimit('s')
    expect(rateLimit('s', 1, 1000).ok).toBe(true)
  })
})

describe('clientIp', () => {
  const make = (headers: Record<string, string>) => new Request('http://x/', { headers })

  it('берёт первый адрес из x-forwarded-for', () => {
    expect(clientIp(make({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe('203.0.113.7')
  })

  it('падает обратно на x-real-ip', () => {
    expect(clientIp(make({ 'x-real-ip': '198.51.100.4' }))).toBe('198.51.100.4')
  })

  it('без заголовков возвращает общий бакет', () => {
    expect(clientIp(make({}))).toBe('unknown')
  })
})

describe('getJwtSecret', () => {
  const saved = { ...process.env }

  afterEach(() => {
    process.env.NODE_ENV = saved.NODE_ENV
    process.env.JWT_SECRET = saved.JWT_SECRET
  })

  // Модуль читает process.env при каждом вызове, но NODE_ENV в Next
  // типизирован как readonly — присваиваем через каст.
  // Присваивать undefined нельзя: process.env приводит значение к строке
  // и переменная становится литералом "undefined" вместо отсутствующей.
  const setEnv = (nodeEnv: string, secret?: string) => {
    const env = process.env as Record<string, string | undefined>
    env.NODE_ENV = nodeEnv
    if (secret === undefined) delete env.JWT_SECRET
    else env.JWT_SECRET = secret
  }

  it('в разработке допускает отсутствие секрета', async () => {
    setEnv('development', undefined)
    const { getJwtSecret } = await import('@/server/env')
    expect(getJwtSecret().length).toBeGreaterThan(0)
  })

  it('в продакшене падает без секрета', async () => {
    setEnv('production', undefined)
    const { getJwtSecret } = await import('@/server/env')
    expect(() => getJwtSecret()).toThrow(/JWT_SECRET не задан/)
  })

  it('в продакшене отвергает короткий секрет', async () => {
    setEnv('production', 'short')
    const { getJwtSecret } = await import('@/server/env')
    expect(() => getJwtSecret()).toThrow(/слишком короткий/)
  })

  it('в продакшене отвергает шаблонное значение', async () => {
    setEnv('production', 'please-change-me-to-something-long')
    const { getJwtSecret } = await import('@/server/env')
    expect(() => getJwtSecret()).toThrow(/шаблонным/)
  })

  it('в продакшене принимает нормальный секрет', async () => {
    const good = 'f3a91c7e2b8d40aa95c16e7d3f0b8a24'
    setEnv('production', good)
    const { getJwtSecret } = await import('@/server/env')
    expect(getJwtSecret()).toBe(good)
  })
})

describe('cookieSecure', () => {
  afterEach(() => {
    delete (process.env as Record<string, string | undefined>).COOKIE_SECURE
  })

  it('включается на https-запросе', async () => {
    const { cookieSecure } = await import('@/server/env')
    expect(cookieSecure({ url: 'https://duoduo.app/api/x' })).toBe(true)
    expect(cookieSecure({ url: 'http://localhost:3000/api/x' })).toBe(false)
  })

  it('COOKIE_SECURE=1 включает флаг за прокси с http внутри', async () => {
    ;(process.env as Record<string, string | undefined>).COOKIE_SECURE = '1'
    const { cookieSecure } = await import('@/server/env')
    expect(cookieSecure({ url: 'http://app:3000/api/x' })).toBe(true)
  })
})
