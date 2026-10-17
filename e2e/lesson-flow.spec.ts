import { expect, test, type Page } from '@playwright/test'
import { playLessonPerfectly } from './solver'

const unique = () => `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@duoduo.test`

async function register(page: Page, email = unique()) {
  await page.goto('/auth')
  await page.getByRole('button', { name: 'Регистрация' }).click()
  await page.getByPlaceholder('Как тебя зовут?').fill('Тестер')
  await page.getByPlaceholder('Email').fill(email)
  await page.getByPlaceholder('Пароль (от 6 символов)').fill('e2e-pass-123')
  await page.getByRole('button', { name: 'Создать аккаунт' }).click()
  await expect(page).toHaveURL(/\/learn/)
  return email
}

test('закрытые страницы ведут на вход', async ({ page }) => {
  await page.goto('/learn')
  await expect(page).toHaveURL(/\/auth\?next=%2Flearn/)
})

test('регистрация, полный урок английского и награда', async ({ page }) => {
  await register(page)
  await playLessonPerfectly(page, 'en', 'u1', 'l1')

  await expect(page.getByText('100%')).toBeVisible()

  const me = await page.request.get('/api/me').then((r) => r.json())
  expect(me.user.xp).toBeGreaterThan(0)
  expect(me.progress.some((p: { lessonId: string; completed: boolean }) => p.lessonId === 'l1' && p.completed)).toBe(true)
})

test('урок китайского проходится так же', async ({ page }) => {
  await register(page)
  await playLessonPerfectly(page, 'zh', 'u1', 'l1')
  const me = await page.request.get('/api/me').then((r) => r.json())
  expect(me.user.xp).toBeGreaterThan(0)
})

test('результат нельзя выдумать без попытки или отправить слишком быстро', async ({ page }) => {
  await register(page)
  const body = { courseId: 'en', unitId: 'u1', lessonId: 'l1', correct: 8, total: 8, seconds: 60 }

  const forged = await page.request.post('/api/lessons/complete', { data: body })
  expect(forged.status()).toBe(400)

  const { attemptId } = await page.request.post('/api/lessons/start', { data: body }).then((r) => r.json())
  const rushed = await page.request.post('/api/lessons/complete', { data: { ...body, attemptId } })
  expect(rushed.status()).toBe(400)
  expect((await rushed.json()).error).toBe('SCORE_IMPLAUSIBLE')
})

test('«выйти на всех устройствах» отзывает выданную сессию', async ({ page, context }) => {
  await register(page)
  const saved = (await context.cookies()).find((c) => c.name === 'dd_token')!
  expect((await page.request.get('/api/me')).status()).toBe(200)

  expect((await page.request.post('/api/auth/logout-all')).ok()).toBe(true)

  await context.addCookies([saved])
  expect((await page.request.get('/api/me')).status()).toBe(401)
})

test('вход с неверным паролем показывает ошибку', async ({ page }) => {
  const email = await register(page)
  await page.request.post('/api/auth/logout')
  await page.goto('/auth')
  await page.getByPlaceholder('Email').fill(email)
  await page.getByPlaceholder('Пароль (от 6 символов)').fill('wrong-password')
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(page.getByText('Неверный email или пароль')).toBeVisible()
})
