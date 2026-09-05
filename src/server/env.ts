/**
 * Единая точка чтения окружения.
 *
 * Главное правило: в продакшене приложение не должно стартовать с
 * дефолтным секретом подписи. Раньше `JWT_SECRET` молча подменялся строкой
 * 'dev-secret-change-me' — это позволяло подделать сессию любого пользователя
 * на инсталляции, где переменную забыли задать.
 */

const DEV_FALLBACK_SECRET = 'duoduo-local-dev-secret-not-for-production'

/** Минимальная длина секрета, которую считаем осмысленной. */
export const MIN_SECRET_LENGTH = 24

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim()

  if (isProduction()) {
    if (!secret) {
      throw new Error(
        'JWT_SECRET не задан. В продакшене это обязательная переменная — ' +
          'сгенерируй значение командой `npm run gen:secret` и добавь его в окружение.'
      )
    }
    if (secret.length < MIN_SECRET_LENGTH) {
      throw new Error(
        `JWT_SECRET слишком короткий (${secret.length} симв., нужно ≥ ${MIN_SECRET_LENGTH}). ` +
          'Сгенерируй новый: `npm run gen:secret`.'
      )
    }
    if (secret.includes('change-me')) {
      throw new Error('JWT_SECRET оставлен шаблонным. Задай собственное случайное значение.')
    }
    return secret
  }

  return secret || DEV_FALLBACK_SECRET
}

export function getJwtSecretKey(): Uint8Array {
  return new TextEncoder().encode(getJwtSecret())
}

/**
 * Ставить ли на cookie флаг Secure.
 *
 * Автоматически включается только когда запрос действительно пришёл по https.
 * За TLS-терминирующим прокси приложение видит http, поэтому там нужно явно
 * выставить `COOKIE_SECURE=1`; включать флаг по одному лишь NODE_ENV нельзя —
 * это сломало бы вход на инсталляции, отданной по чистому http (docker compose).
 */
export function cookieSecure(req?: { url?: string }): boolean {
  if (process.env.COOKIE_SECURE === '1') return true
  if (process.env.COOKIE_SECURE === '0') return false
  return !!req?.url?.startsWith('https')
}

export const aiConfig = () => ({
  key: process.env.OPENAI_API_KEY?.trim() || '',
  base: process.env.AI_BASE_URL?.trim() || 'https://api.openai.com/v1',
  model: process.env.AI_MODEL?.trim() || 'gpt-4o-mini'
})
