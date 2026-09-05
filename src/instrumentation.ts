/**
 * Точка входа Next.js при старте сервера.
 *
 * Проверяем конфигурацию здесь, чтобы неверно настроенный инстанс падал
 * сразу при запуске, а не на первом запросе с сессией: иначе выкатка
 * без JWT_SECRET выглядела бы «успешной» и ломалась только у пользователей.
 */
export async function register() {
  // Проверка нужна только на сервере Node, не в edge-рантайме.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const { getJwtSecret } = await import('./server/env')

  try {
    getJwtSecret()
  } catch (e) {
    console.error('\n✖ Дуодуо не может стартовать: ' + (e instanceof Error ? e.message : String(e)) + '\n')
    throw e
  }

  if (!process.env.DATABASE_URL?.trim()) {
    const msg = 'DATABASE_URL не задан — приложению негде хранить данные.'
    console.error('\n✖ Дуодуо не может стартовать: ' + msg + '\n')
    throw new Error(msg)
  }

  console.log('✓ Конфигурация в порядке')
}
