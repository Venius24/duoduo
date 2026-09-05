'use client'

import { useEffect, useRef, useState } from 'react'
import { Turtle } from 'lucide-react'
import type { Item, Lang } from '@/content/types'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { FeedbackBanner } from '@/components/learn/FeedbackBanner'
import { TypedInput } from '@/components/exercises/TypedInput'
import { AudioButton, OptionButton, Prompt } from '@/components/exercises/shared'
import { checkTyped } from '@/lib/normalize'
import { sfxCorrect, sfxFinish, sfxWrong } from '@/lib/sfx'
import { speak } from '@/lib/speech'
import { shuffleSeeded } from '@/lib/utils'
import { api } from '@/lib/api'
import { confetti } from '@/lib/confetti'

export interface ReviewSummary {
  total: number
  correct: number
  xpGained: number
}

interface Question {
  itemId: string
  kind: 'rev-choice' | 'listen-choice' | 'typed'
  prompt?: string
  speak?: string
  options?: string[]
  answer: string
  accept?: string[]
  roman?: string
  explain: string
}

function buildQuestions(items: Item[], lang: Lang): Question[] {
  return items.map((it, i) => {
    const others = items.filter((o) => o.id !== it.id)
    const ruDist = shuffleSeeded(others.map((o) => o.ru), i + 1).slice(0, 3)
    const pattern = i % 3
    if (pattern === 0) {
      return {
        itemId: it.id,
        kind: 'rev-choice',
        prompt: `Что означает «${it.t}»?`,
        options: shuffleSeeded([it.ru, ...ruDist], i + 2),
        answer: it.ru,
        roman: it.roman,
        explain: `${it.t} — ${it.ru}${it.roman ? ` [${it.roman}]` : ''}`
      }
    }
    if (pattern === 1) {
      return {
        itemId: it.id,
        kind: 'listen-choice',
        speak: it.t,
        options: shuffleSeeded([it.ru, ...ruDist], i + 3),
        answer: it.ru,
        explain: `${it.t} — ${it.ru}`
      }
    }
    return {
      itemId: it.id,
      kind: 'typed',
      prompt: lang === 'zh' ? `Как сказать по-китайски: «${it.ru}»? (пиньинь)` : `Переведи: «${it.ru}»`,
      answer: lang === 'zh' ? (it.roman ?? it.t) : it.t,
      accept: lang === 'zh' ? [it.t] : undefined,
      explain: `${it.t} — ${it.ru}${it.roman ? ` [${it.roman}]` : ''}`
    }
  })
}

export function ReviewSession({
  items,
  lang,
  ttsRate,
  onDone
}: {
  items: Item[]
  lang: Lang
  ttsRate: number
  onDone: (s: ReviewSummary) => void
}) {
  const questions = buildQuestions(items, lang)
  const [idx, setIdx] = useState(0)
  const [value, setValue] = useState<string>('')
  const [checked, setChecked] = useState(false)
  const [status, setStatus] = useState<'correct' | 'typo' | 'wrong'>('correct')
  const correctRef = useRef(0)

  const q = questions[idx]
  const seed = idx * 17 + 5

  useEffect(() => {
    if (!q) return
    setValue('')
    setChecked(false)
    if (q.kind === 'listen-choice' && q.speak) {
      speak(q.speak, lang, ttsRate)
    }
  }, [idx])

  if (!q) return null

  const canCheck =
    q.kind === 'listen-choice' ? !!value : q.kind === 'rev-choice' ? !!value : value.trim().length > 0

  const handleCheck = () => {
    if (checked || !canCheck) return
    let ok = false
    let typo = false
    if (q.kind === 'typed') {
      const res = checkTyped(value, [q.answer, ...(q.accept ?? [])], lang)
      ok = res.correct
      typo = res.typo
    } else {
      ok = value === q.answer
    }
    setStatus(ok ? (typo ? 'typo' : 'correct') : 'wrong')
    setChecked(true)
    if (ok) {
      correctRef.current += 1
      sfxCorrect(idx)
    } else {
      sfxWrong()
    }
    api('/api/review/grade', {
      method: 'POST',
      body: JSON.stringify({ itemId: q.itemId, grade: ok ? 5 : 2 })
    }).catch(() => {})
  }

  const handleContinue = () => {
    if (idx + 1 >= questions.length) {
      sfxFinish()
      onDone({
        total: questions.length,
        correct: correctRef.current,
        xpGained: correctRef.current * 2
      })
      return
    }
    setIdx(idx + 1)
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4">
      <header className="py-4">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-duo-purple px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white">
            Повторение
          </span>
          <ProgressBar value={idx} max={questions.length} color="#CE82FF" />
          <span className="shrink-0 text-sm font-black text-duo-gray">
            {idx + 1}/{questions.length}
          </span>
        </div>
      </header>

      <main className="flex-1 pb-44 pt-2" key={idx}>
        <div className="animate-popin">
          {q.kind === 'rev-choice' && (
            <div>
              <Prompt note={q.roman}>{q.prompt}</Prompt>
              <div className="grid gap-2.5">
                {(q.options ?? []).map((opt, i) => (
                  <OptionButton key={opt + i} selected={value === opt} locked={checked} onClick={() => setValue(opt)}>
                    {opt}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}
          {q.kind === 'listen-choice' && (
            <div>
              <Prompt>Что ты услышал(а)?</Prompt>
              <div className="mb-6 flex items-center gap-3">
                <AudioButton text={q.speak!} lang={lang} rate={ttsRate} size="lg" />
                <button
                  aria-label="Медленно"
                  onClick={() => speak(q.speak!, lang, Math.max(0.5, ttsRate * 0.6))}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-b-4 border-duo-blue/40 text-duo-blue"
                >
                  <Turtle size={26} />
                </button>
              </div>
              <div className="grid gap-2.5">
                {(q.options ?? []).map((opt, i) => (
                  <OptionButton key={opt + i} selected={value === opt} locked={checked} onClick={() => setValue(opt)}>
                    {opt}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}
          {q.kind === 'typed' && (
            <div>
              <Prompt>{q.prompt}</Prompt>
              <TypedInput
                value={value}
                onChange={setValue}
                onEnter={handleCheck}
                locked={checked}
                placeholder={lang === 'zh' ? 'например: ni hao' : 'напиши перевод…'}
              />
            </div>
          )}
        </div>
      </main>

      {!checked && (
        <div className="fixed inset-x-0 bottom-0 border-t-2 border-black/5 bg-white p-4 dark:border-white/10 dark:bg-duo-night-800">
          <div className="mx-auto flex max-w-2xl justify-end gap-3">
            <Button variant="secondary" onClick={() => window.history.back()}>
              Выйти
            </Button>
            <Button onClick={handleCheck} disabled={!canCheck}>
              Проверить
            </Button>
          </div>
        </div>
      )}

      {checked && (
        <FeedbackBanner
          status={status}
          answer={status !== 'correct' ? q.answer : undefined}
          explain={q.explain}
          onContinue={handleContinue}
        />
      )}
    </div>
  )
}

export function ReviewDone({
  summary,
  onBack
}: {
  summary: ReviewSummary
  onBack: () => void
}) {
  const accuracy = Math.round((summary.correct / Math.max(1, summary.total)) * 100)
  useEffect(() => {
    if (accuracy >= 80) confetti(80)
  }, [accuracy])
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl">{accuracy >= 80 ? '🏆' : '💪'}</p>
      <h1 className="mt-3 text-3xl font-black text-duo-purple">Повторение завершено!</h1>
      <p className="mt-2 font-semibold text-duo-gray">
        {summary.correct} из {summary.total} верно · точность {accuracy}% ·{' '}
        <span className="font-black text-duo-yellowdark">+{summary.xpGained} XP ⚡</span>
      </p>
      {accuracy >= 80 ? (
        <p className="mt-1 text-sm font-semibold text-duo-gray">Отличная память! Слова ушли дальше в долгую память 🧠</p>
      ) : (
        <p className="mt-1 text-sm font-semibold text-duo-gray">Сложные слова вернутся раньше — мозг всё запомнил.</p>
      )}
      <Button className="mt-8" onClick={onBack}>
        Продолжить
      </Button>
    </div>
  )
}
