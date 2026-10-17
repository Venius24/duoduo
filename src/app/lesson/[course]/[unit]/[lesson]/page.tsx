'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Mascot } from '@/components/app/Mascot'
import { LessonRunner, type LocalResult } from '@/components/learn/LessonRunner'
import { ResultsScreen } from '@/components/learn/ResultsScreen'
import { findLesson } from '@/content'
import { api } from '@/lib/api'
import { useMe } from '@/lib/me-store'
import type { CompleteLessonResult } from '@/lib/types'

type Phase = 'run' | 'sending' | 'result'

export default function LessonPage() {
  const params = useParams<{ course: string; unit: string; lesson: string }>()
  const router = useRouter()
  const { data, load } = useMe()
  const [phase, setPhase] = useState<Phase>('run')
  const [attempt, setAttempt] = useState(0)
  const [local, setLocal] = useState<LocalResult | null>(null)
  const [serverResult, setServerResult] = useState<CompleteLessonResult | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)

  const found = findLesson(params.course, params.unit, params.lesson)
  const exists = !!found

  useEffect(() => {
    if (!found) router.replace('/learn')
  }, [found, router])

  // Сервер выдаёт попытку при старте урока: результат принимается только по ней.
  useEffect(() => {
    if (!exists || phase !== 'run') return
    let cancelled = false
    setAttemptId(null)
    api<{ attemptId: string }>('/api/lessons/start', {
      method: 'POST',
      body: JSON.stringify({ courseId: params.course, unitId: params.unit, lessonId: params.lesson })
    })
      .then((r) => !cancelled && setAttemptId(r.attemptId))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [exists, phase, attempt, params.course, params.unit, params.lesson])

  useEffect(() => {
    if (!data) load()
  }, [data, load])

  if (!found) return null

  const handleFinish = async (result: LocalResult) => {
    setLocal(result)
    setPhase('sending')
    try {
      if (attemptId && (result.passed || found.lesson.isBoss)) {
        const res = await api<CompleteLessonResult>('/api/lessons/complete', {
          method: 'POST',
          body: JSON.stringify({
            attemptId,
            courseId: params.course,
            unitId: params.unit,
            lessonId: params.lesson,
            correct: result.correct,
            total: result.total,
            seconds: result.seconds
          })
        })
        setServerResult(res)
      }
    } catch {
      setServerResult(null)
    } finally {
      setPhase('result')
      load()
    }
  }

  if (phase === 'run' || !local) {
    return (
      <LessonRunner
        key={attempt}
        course={found.course}
        lesson={found.lesson}
        mode={found.lesson.isBoss ? 'boss' : 'lesson'}
        ttsRate={data?.user.ttsRate ?? 1}
        startHearts={data?.user.hearts ?? 5}
        gems={data?.user.gems ?? 0}
        onHeartsChange={(h) => data && useMe.getState().patchLocal({ user: { ...data.user, hearts: h } })}
        onFinish={handleFinish}
        onQuit={() => router.push('/learn')}
      />
    )
  }

  if (phase === 'sending') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Mascot size={90} className="animate-floaty" />
        <p className="text-sm font-extrabold uppercase tracking-wider text-duo-gray">Сохраняем результаты…</p>
      </div>
    )
  }

  return (
    <ResultsScreen
      lessonTitle={`${found.course.flag} ${found.unit.title} → ${found.lesson.title}`}
      server={serverResult}
      local={local}
      onRetry={() => {
        setServerResult(null)
        setLocal(null)
        setPhase('run')
        setAttempt((a) => a + 1)
      }}
    />
  )
}
