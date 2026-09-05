'use client'

import { Gem, Flame, Heart, Timer } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Course, Exercise, Lang, Lesson } from '@/content/types'
import { api } from '@/lib/api'
import { checkTyped, checkWordbank } from '@/lib/normalize'
import { sfxCorrect, sfxFinish, sfxHeartLost, sfxWrong } from '@/lib/sfx'
import { hashStr, shuffleSeeded } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ChoiceEx } from '@/components/exercises/ChoiceEx'
import { FillEx } from '@/components/exercises/FillEx'
import { InfoSlide } from '@/components/exercises/InfoSlide'
import { ListenChoiceEx, ListenTypedEx } from '@/components/exercises/ListenEx'
import { MatchEx } from '@/components/exercises/MatchEx'
import { SpeakEx } from '@/components/exercises/SpeakEx'
import { ToneEx } from '@/components/exercises/ToneEx'
import { TypedInput } from '@/components/exercises/TypedInput'
import { WordBankEx } from '@/components/exercises/WordBankEx'
import { FeedbackBanner, QuitButton } from './FeedbackBanner'

export interface LocalResult {
  passed: boolean
  correct: number
  total: number
  seconds: number
  mistakes: number
  maxCombo: number
}

type Status = 'correct' | 'typo' | 'wrong'

interface Props {
  course: Course
  lesson: Lesson
  mode: 'lesson' | 'boss'
  ttsRate: number
  startHearts: number
  gems: number
  onHeartsChange?: (hearts: number) => void
  onFinish: (r: LocalResult) => void
  onQuit: () => void
}

const MAX_RETRIES = 6

export function LessonRunner({
  course,
  lesson,
  ttsRate,
  startHearts,
  gems,
  onHeartsChange,
  onFinish,
  onQuit
}: Props) {
  const isBoss = !!lesson.isBoss
  const lang: Lang = course.id

  const buildQueue = (): Exercise[] => {
    if (!isBoss) return lesson.exercises
    const pool = shuffleSeeded(lesson.exercises, hashStr(lesson.id))
    return [...pool, ...shuffleSeeded(pool, hashStr(lesson.id) + 1)].slice(0, 26)
  }

  const [queue, setQueue] = useState<Exercise[]>(buildQueue)

  const [idx, setIdx] = useState(0)
  const [value, setValue] = useState<string | string[] | null>(null)
  const [checked, setChecked] = useState(false)
  const [status, setStatus] = useState<Status | null>(null)
  const [lastAnswer, setLastAnswer] = useState<{ answer?: string; explain?: string }>({})
  const [hearts, setHearts] = useState(Math.max(0, Math.min(startHearts, 5)))
  const [noHearts, setNoHearts] = useState(false)
  const [combo, setCombo] = useState(0)
  const [bossLeft, setBossLeft] = useState(lesson.timeLimitSec ?? 90)
  const [aiBusy, setAiBusy] = useState(false)
  const [aiText, setAiText] = useState<string>()
  const [aiSource, setAiSource] = useState<'ai' | 'local'>()

  const answeredRef = useRef(0)
  const correctRef = useRef(0)
  const mistakesRef = useRef(0)
  const comboRef = useRef(0)
  const retriesRef = useRef(0)
  const startedAtRef = useRef(Date.now())
  const finishedRef = useRef(false)
  const losingHeartRef = useRef(false)

  const ex = queue[Math.min(idx, queue.length - 1)]
  const seed = idx * 131 + hashStr(course.id)

  const canCheck =
    !!ex &&
    (ex.kind === 'info' ||
      (ex.kind === 'match' && value === 'solved') ||
      ((ex.kind === 'speak') && (value === 'ok' || value === 'skipped')) ||
      (typeof value === 'string' && value.trim().length > 0) ||
      (Array.isArray(value) && value.length > 0))

  const finish = (forceFail = false) => {
    if (finishedRef.current) return
    finishedRef.current = true
    const total = Math.max(1, answeredRef.current)
    const correct = correctRef.current
    let passed = true
    if (isBoss) {
      const need = lesson.passScore ?? Math.ceil(total * 0.7)
      passed = !forceFail && correct >= need
    }
    if (passed) sfxFinish()
    onFinish({
      passed,
      correct,
      total,
      seconds: Math.round((Date.now() - startedAtRef.current) / 1000),
      mistakes: mistakesRef.current,
      maxCombo: comboRef.current
    })
  }

  useEffect(() => {
    if (!isBoss || finishedRef.current) return
    const t = setInterval(() => {
      setBossLeft((s) => {
        if (s <= 1) {
          clearInterval(t)
          finish()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [isBoss])

  const loseHeart = () => {
    if (losingHeartRef.current) return
    losingHeartRef.current = true
    const next = hearts - 1
    setHearts(next)
    onHeartsChange?.(next)
    sfxHeartLost()
    api<{ hearts: number }>('/api/hearts', { method: 'POST', body: JSON.stringify({ action: 'lose' }) })
      .then((r) => onHeartsChange?.(r.hearts))
      .catch(() => {})
      .finally(() => {
        losingHeartRef.current = false
        if (next <= 0) setNoHearts(true)
      })
  }

  const gradeCurrent = (): { status: Status; answer?: string; explain?: string } | null => {
    if (!ex || ex.kind === 'info') return null
    switch (ex.kind) {
      case 'choice':
      case 'listen-choice':
        return value === ex.answer
          ? { status: 'correct', explain: ex.explain }
          : { status: 'wrong', answer: ex.answer, explain: ex.explain }
      case 'fill':
        return value === ex.answer
          ? { status: 'correct', explain: ex.explain }
          : { status: 'wrong', answer: ex.answer, explain: ex.explain }
      case 'tone':
        return value === ex.answer
          ? { status: 'correct', explain: `${ex.word} — ${ex.syllable}, ${ex.ru}` }
          : { status: 'wrong', answer: ex.answer, explain: `${ex.word} — ${ex.syllable}, ${ex.ru}` }
      case 'wordbank': {
        const ok = Array.isArray(value) && checkWordbank(value, ex.answer, lang)
        return ok
          ? { status: 'correct', explain: ex.explain }
          : { status: 'wrong', answer: ex.answer, explain: ex.explain }
      }
      case 'typed':
      case 'listen-typed': {
        const answers = [ex.answer, ...(ex.accept ?? [])]
        const res = checkTyped(String(value ?? ''), answers, lang)
        if (res.correct) {
          return {
            status: res.typo ? 'typo' : 'correct',
            answer: res.typo ? ex.answer : undefined,
            explain: ex.explain
          }
        }
        return { status: 'wrong', answer: ex.answer, explain: ex.explain }
      }
      case 'match':
        return value === 'solved'
          ? { status: 'correct' }
          : null
      case 'speak':
        if (value === 'ok') return { status: 'correct', explain: `${ex.say} — ${ex.ru}` }
        if (value === 'skipped')
          return { status: 'wrong', answer: ex.say, explain: 'Произношение придёт с практикой!' }
        return null
    }
    return null
  }

  const handleCheck = () => {
    if (checked || !canCheck || !ex) return
    if (ex.kind === 'info') {
      setChecked(true)
      answeredRef.current += 1
      correctRef.current += 1
      setStatus('correct')
      return
    }
    const result = gradeCurrent()
    if (!result) return
    setChecked(true)
    setStatus(result.status)
    setLastAnswer({ answer: result.answer, explain: result.explain })
    answeredRef.current += 1

    if (result.status === 'correct') {
      correctRef.current += 1
      comboRef.current += 1
      setCombo(comboRef.current)
      sfxCorrect(comboRef.current)
    } else {
      comboRef.current = 0
      setCombo(0)
      mistakesRef.current += 1
      sfxWrong()
      loseHeart()
      if (!isBoss && retriesRef.current < MAX_RETRIES && ex.kind !== 'match') {
        retriesRef.current += 1
        const insertAt = Math.min(idx + 4, queue.length)
        const target = ex
        setQueue((q) => {
          const copy = [...q]
          copy.splice(insertAt, 0, target)
          return copy
        })
      }
    }
  }

  const handleContinue = () => {
    if (idx + 1 >= queue.length) {
      finish()
      return
    }
    setIdx(idx + 1)
    setValue(null)
    setChecked(false)
    setStatus(null)
    setAiText(undefined)
  }

  useEffect(() => {
    if (!ex || checked) return
    if (ex.kind === 'match' && value === 'solved') handleCheck()
    if (ex.kind === 'speak' && (value === 'ok' || value === 'skipped')) handleCheck()
  }, [value, idx, checked])

  const askAi = async () => {
    if (!ex || aiBusy) return
    setAiBusy(true)
    try {
      const prompt =
        ex.kind === 'choice' || ex.kind === 'typed'
          ? ex.prompt
          : 'Вопрос по аудио'
      const answer =
        status === 'correct' ? String(value ?? '') : (gradeCurrent()?.answer ?? '')
      const res = await api<{ text: string; source: 'ai' | 'local' }>('/api/ai/explain', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          answer,
          userAnswer: typeof value === 'string' ? value : Array.isArray(value) ? value.join(' ') : '',
          explainFallback: undefined
        })
      })
      setAiText(res.text)
      setAiSource(res.source)
    } catch {
      setAiText('Сервис объяснений недоступен, но ты справишься!')
      setAiSource('local')
    } finally {
      setAiBusy(false)
    }
  }

  const refillHearts = async () => {
    try {
      const r = await api<{ hearts: number }>('/api/hearts', {
        method: 'POST',
        body: JSON.stringify({ action: 'refill' })
      })
      setHearts(r.hearts)
      onHeartsChange?.(r.hearts)
      setNoHearts(false)
    } catch {
      /* недостаточно алмазов */
    }
  }

  const mm = String(Math.floor(bossLeft / 60)).padStart(1, '0')
  const ss = String(bossLeft % 60).padStart(2, '0')

  if (!ex) return null

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 bg-white/95 px-4 py-3 backdrop-blur dark:bg-duo-night-800/95">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <QuitButton
            onQuit={() => {
              if (window.confirm('Выйти из урока? Прогресс в этом уроке не сохранится.')) onQuit()
            }}
          />
          <ProgressBar value={idx} max={queue.length} color={course.units[0].color} />
          {isBoss ? (
            <span
              className={`flex items-center gap-1 text-sm font-extrabold ${bossLeft <= 10 ? 'animate-pulse text-duo-red' : 'text-duo-purple'}`}
            >
              <Timer size={18} /> {mm}:{ss}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-sm font-extrabold text-duo-red">
              <Heart size={18} fill="currentColor" /> {hearts}
            </span>
          )}
        </div>
      </header>

      {combo >= 3 && (
        <div className="pointer-events-none fixed right-4 top-16 z-20 animate-popin rounded-full bg-orange-500 px-3 py-1.5 text-sm font-black text-white shadow-lg">
          🔥 x{combo}
        </div>
      )}

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-40 pt-6" key={idx}>
        <div className="animate-popin">
          {renderExercise({
            ex,
            lang,
            value,
            onChange: setValue,
            locked: checked,
            seed,
            ttsRate,
            onEnter: handleCheck
          })}
        </div>
      </main>

      {!checked && ex.kind !== 'info' && (
        <div className="fixed inset-x-0 bottom-0 border-t-2 border-black/5 bg-white p-4 dark:border-white/10 dark:bg-duo-night-800">
          <div className="mx-auto flex max-w-3xl justify-end gap-3">
            <Button variant="secondary" onClick={onQuit} className="hidden sm:inline-flex">
              Выйти
            </Button>
            <Button onClick={handleCheck} disabled={!canCheck}>
              Проверить
            </Button>
          </div>
        </div>
      )}

      {!checked && ex.kind === 'info' && (
        <div className="fixed inset-x-0 bottom-0 border-t-2 border-black/5 bg-white p-4 dark:border-white/10 dark:bg-duo-night-800">
          <div className="mx-auto flex max-w-3xl justify-end">
            <Button onClick={handleContinue}>Понятно</Button>
          </div>
        </div>
      )}

      {checked && status && (
        <FeedbackBanner
          status={status}
          answer={lastAnswer.answer}
          explain={lastAnswer.explain}
          onContinue={handleContinue}
          onAskAi={status !== 'correct' ? askAi : undefined}
          aiText={aiText}
          aiLoading={aiBusy}
          aiSource={aiSource}
        />
      )}

      <Modal open={noHearts} onClose={() => {}}>
        <div className="text-center">
          <p className="mb-2 text-5xl">💔</p>
          <h3 className="mb-1 text-xl font-extrabold">Жизни закончились!</h3>
          <p className="mb-5 text-sm font-semibold text-duo-gray">
            Заполни сердца за алмазы или вернись позже — они восстановятся сами.
          </p>
          <div className="flex flex-col gap-2.5">
            <Button variant="gold" onClick={refillHearts} disabled={gems < 100}>
              Заполнить за 100 <Gem size={15} className="ml-1 inline" />
            </Button>
            <Button variant="secondary" onClick={onQuit}>
              Выйти из урока
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function renderExercise(opts: {
  ex: Exercise
  lang: Lang
  value: unknown
  onChange: (v: string | string[] | null) => void
  locked: boolean
  seed: number
  ttsRate: number
  onEnter: () => void
}) {
  const { ex, lang, value, onChange, locked, seed, ttsRate, onEnter } = opts
  switch (ex.kind) {
    case 'choice':
      return (
        <ChoiceEx
          ex={ex}
          lang={lang}
          value={value}
          onChange={(v) => onChange(v)}
          locked={locked}
          seed={seed}
          ttsRate={ttsRate}
        />
      )
    case 'wordbank':
      return (
        <WordBankEx
          ex={ex}
          lang={lang}
          value={value}
          onChange={(v) => onChange(v)}
          locked={locked}
          seed={seed}
          ttsRate={ttsRate}
        />
      )
    case 'typed':
      return (
        <div>
          <div className="mb-5 text-center">
            <h2 className="text-xl font-extrabold sm:text-2xl">{ex.prompt}</h2>
          </div>
          <TypedInput
            value={(value as string) || ''}
            onChange={(v) => onChange(v)}
            onEnter={onEnter}
            locked={locked}
            placeholder={ex.placeholderHint || 'напиши перевод…'}
          />
        </div>
      )
    case 'listen-choice':
      return (
        <ListenChoiceEx
          ex={ex}
          lang={lang}
          value={value}
          onChange={(v) => onChange(v)}
          locked={locked}
          seed={seed}
          ttsRate={ttsRate}
        />
      )
    case 'listen-typed':
      return (
        <ListenTypedEx
          ex={ex}
          lang={lang}
          value={value}
          onChange={(v) => onChange(v)}
          locked={locked}
          seed={seed}
          ttsRate={ttsRate}
          onEnter={onEnter}
        />
      )
    case 'match':
      return (
        <MatchEx
          ex={ex}
          lang={lang}
          value={value}
          onChange={(v) => onChange(v)}
          locked={locked}
          seed={seed}
          ttsRate={ttsRate}
        />
      )
    case 'speak':
      return (
        <SpeakEx
          ex={ex}
          lang={lang}
          value={value}
          onChange={(v) => onChange(v)}
          locked={locked}
          seed={seed}
          ttsRate={ttsRate}
        />
      )
    case 'fill':
      return (
        <FillEx
          ex={ex}
          lang={lang}
          value={value}
          onChange={(v) => onChange(v)}
          locked={locked}
          seed={seed}
          ttsRate={ttsRate}
        />
      )
    case 'tone':
      return (
        <ToneEx
          ex={ex}
          lang={lang}
          value={value}
          onChange={(v) => onChange(v)}
          locked={locked}
          seed={seed}
          ttsRate={ttsRate}
        />
      )
    case 'info':
      return <InfoSlide ex={ex} lang={lang} ttsRate={ttsRate} />
  }
}
