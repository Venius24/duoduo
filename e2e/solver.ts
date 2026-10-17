import { expect, type Page } from '@playwright/test'
import { findLesson } from '../src/content'
import type { Exercise } from '../src/content/types'

/** Человек не отвечает быстрее ~0.7 с на задание, и сервер это проверяет. */
const HUMAN_PAUSE_MS = 800

/** Пробелы и знаки препинания не входят в плитки банка слов. */
const squash = (s: string) => s.replace(/[\s\p{P}]+/gu, '').toLowerCase()

/** Порядок плиток из банка слов, дающий нужную фразу (учитывает дубли и лишние слова). */
export function orderTokens(answer: string, words: string[]): string[] {
  const target = squash(answer)
  const used = new Array(words.length).fill(false)
  const picked: string[] = []
  const dfs = (rest: string): boolean => {
    if (rest === '') return true
    for (let i = 0; i < words.length; i++) {
      const w = squash(words[i])
      if (used[i] || !w || !rest.startsWith(w)) continue
      used[i] = true
      picked.push(words[i])
      if (dfs(rest.slice(w.length))) return true
      picked.pop()
      used[i] = false
    }
    return false
  }
  if (!dfs(target)) throw new Error(`cannot assemble "${answer}" from [${words.join(' | ')}]`)
  return picked
}

type Outcome = 'checked' | 'auto-checked' | 'info'

async function answer(page: Page, ex: Exercise): Promise<Outcome> {
  switch (ex.kind) {
    case 'info':
      await page.getByRole('button', { name: 'Понятно' }).click()
      return 'info'
    case 'choice':
    case 'listen-choice':
    case 'fill':
    case 'tone':
      await page.getByRole('button', { name: ex.answer, exact: true }).click()
      break
    case 'typed':
    case 'listen-typed':
      await page.locator('input').fill(ex.answer)
      break
    case 'wordbank':
      for (const word of orderTokens(ex.answer, ex.words)) {
        await page.getByTestId('wordbank-bank').getByRole('button', { name: word, exact: true }).first().click()
      }
      break
    case 'match':
      for (const pair of ex.pairs) {
        await page.getByTestId('match-left').getByRole('button', { name: pair.a, exact: true }).click()
        await page.getByTestId('match-right').getByRole('button', { name: pair.b }).first().click()
      }
      // Последняя пара засчитывается через 350 мс, затем задание проверяется само.
      return 'auto-checked'
    case 'speak': {
      // Распознавания речи в тесте нет (см. addInitScript): сразу самооценка.
      await page.getByRole('button', { name: /Я сказал верно/ }).click()
      return 'auto-checked'
    }
  }
  await page.getByRole('button', { name: 'Проверить' }).click()
  return 'checked'
}

/** Проходит урок безошибочно, опираясь на контент курса. */
export async function playLessonPerfectly(page: Page, courseId: string, unitId: string, lessonId: string) {
  const found = findLesson(courseId, unitId, lessonId)
  if (!found) throw new Error(`no such lesson ${courseId}/${unitId}/${lessonId}`)

  // В headless-Chromium распознавание речи недоступно: сообщаем об этом приложению.
  await page.addInitScript(() => {
    const w = window as unknown as Record<string, unknown>
    delete w.SpeechRecognition
    delete w.webkitSpeechRecognition
  })
  await page.goto(`/lesson/${courseId}/${unitId}/${lessonId}`)

  for (const ex of found.lesson.exercises) {
    await page.waitForTimeout(HUMAN_PAUSE_MS)
    const outcome = await answer(page, ex)
    if (outcome === 'info') continue
    await page.getByRole('button', { name: 'Продолжить' }).click()
  }

  await expect(page.getByRole('heading', { name: 'Урок пройден!' })).toBeVisible({ timeout: 15_000 })
}
