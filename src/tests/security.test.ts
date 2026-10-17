import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { checkRateLimit, clearAllRateLimits, clearRateLimit, clientIp, rateLimit, resetRateLimit } from '@/server/rate-limit'

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

  // NODE_ENV в типах Next помечен readonly, поэтому пишем через каст.
  const env = process.env as Record<string, string | undefined>

  afterEach(() => {
    env.NODE_ENV = saved.NODE_ENV
    env.JWT_SECRET = saved.JWT_SECRET
  })

  // Модуль читает process.env при каждом вызове.
  // Присваивать undefined нельзя: process.env приводит значение к строке
  // и переменная становится литералом "undefined" вместо отсутствующей.
  const setEnv = (nodeEnv: string, secret?: string) => {
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

describe('checkRateLimit с Redis', () => {
  beforeEach(() => {
    clearAllRateLimits()
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example/'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'tok'
  })
  afterEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  const redisReply = (count: number, pttl: number) =>
    new Response(JSON.stringify([{ result: count }, { result: 1 }, { result: pttl }]), { status: 200 })

  it('без настроек Redis работает на памяти', async () => {
    delete process.env.UPSTASH_REDIS_REST_URL
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect((await checkRateLimit('m', 1, 1000)).ok).toBe(true)
    expect((await checkRateLimit('m', 1, 1000)).ok).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('пропускает, пока счётчик в пределах лимита, и шлёт INCR/PEXPIRE/PTTL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(redisReply(2, 5000))
    vi.stubGlobal('fetch', fetchMock)
    const r = await checkRateLimit('login:1.2.3.4', 3, 60_000)
    expect(r).toEqual({ ok: true, remaining: 1, retryAfter: 0 })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://redis.example/pipeline')
    expect(init.headers.Authorization).toBe('Bearer tok')
    expect(JSON.parse(init.body)).toEqual([
      ['INCR', 'duoduo:rl:login:1.2.3.4'],
      ['PEXPIRE', 'duoduo:rl:login:1.2.3.4', 60000, 'NX'],
      ['PTTL', 'duoduo:rl:login:1.2.3.4']
    ])
  })

  it('блокирует сверх лимита и отдаёт Retry-After по PTTL', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(redisReply(4, 12_300)))
    expect(await checkRateLimit('k', 3, 60_000)).toEqual({ ok: false, remaining: 0, retryAfter: 13 })
  })

  it('при сбое Redis откатывается на память, а не роняет запрос', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    expect((await checkRateLimit('f', 1, 1000)).ok).toBe(true)
    expect((await checkRateLimit('f', 1, 1000)).ok).toBe(false)
  })

  it('HTTP-ошибка Redis тоже приводит к откату на память', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('no', { status: 500 })))
    expect((await checkRateLimit('h', 1, 1000)).ok).toBe(true)
  })

  it('clearRateLimit удаляет ключ в Redis и в памяти', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([{ result: 1 }]), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    rateLimit('c', 1, 1000)
    await clearRateLimit('c')
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual([['DEL', 'duoduo:rl:c']])
    expect(rateLimit('c', 1, 1000).ok).toBe(true)
  })
})
