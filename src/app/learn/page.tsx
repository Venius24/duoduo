'use client'

import { ArrowRight, Brain, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { QuestList } from '@/components/learn/QuestList'
import { LeaderboardWidget } from '@/components/learn/LeaderboardWidget'
import { UnitSection, type PathNodeState } from '@/components/learn/UnitPath'
import { Button } from '@/components/ui/Button'
import { GoalRing } from '@/components/ui/GoalRing'
import { Modal } from '@/components/ui/Modal'
import { courseList, flatLessons, getCourse } from '@/content'
import { useMe } from '@/lib/me-store'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function LearnPage() {
  const { data, load, patchLocal } = useMe()
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [switching, setSwitching] = useState<string | null>(null)

  useEffect(() => {
    if (!data) load()
  }, [data, load])

  const activeCourseId = data?.user.activeCourse ?? 'en'
  const course = getCourse(activeCourseId)!

  const progressMap = useMemo(() => {
    const map = new Map<string, { completed: boolean; stars: number }>()
    data?.progress.forEach((p) => {
      map.set(`${p.unitId}/${p.lessonId}`, { completed: p.completed, stars: p.stars })
    })
    return map
  }, [data?.progress])

  if (!data) {
    return (
      <AppShell>
        <div className="flex h-[60vh] items-center justify-center">
          <RefreshCw size={32} className="animate-spin text-duo-green" />
        </div>
      </AppShell>
    )
  }

  const flats = flatLessons(course)
  let currentAssigned = false

  const units = course.units.map((unit) => {
    const unitLessons = flats.filter((f) => f.unit.id === unit.id)
    const nodes: PathNodeState[] = unitLessons.map(({ lesson }) => {
      const p = progressMap.get(`${unit.id}/${lesson.id}`)
      const state: PathNodeState['state'] = p?.completed ? 'done' : !currentAssigned ? 'current' : 'locked'
      if (state === 'current') currentAssigned = true
      return {
        lessonId: lesson.id,
        title: lesson.title,
        isBoss: !!lesson.isBoss,
        state,
        stars: p?.stars ?? 0
      }
    })
    const doneCount = nodes.filter((n) => n.state === 'done').length
    return { unit, nodes, doneCount, totalCount: nodes.length }
  })

  const switchCourse = async (id: string) => {
    setSwitching(id)
    try {
      await api('/api/me', { method: 'PATCH', body: JSON.stringify({ activeCourse: id }) })
      patchLocal({ user: { ...data.user, activeCourse: id } })
      setSwitcherOpen(false)
      await load()
    } finally {
      setSwitching(null)
    }
  }

  const todayXp = data.today.xp
  const goalPercent = Math.min(100, Math.round((todayXp / data.user.dailyGoal) * 100))
  const hour = new Date().getHours()
  const greeting = hour < 6 ? 'Ночной дозор' : hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">
            {greeting}, {data.user.name}! {data.user.streak > 0 ? '🔥'.repeat(Math.min(3, Math.ceil(data.user.streak / 4))) : ''}
          </h1>
          <p className="text-sm font-semibold text-duo-gray">
            Уровень {data.user.level.level} · {data.user.level.title} · ещё {data.user.level.needed - data.user.level.current} XP до следующего
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={() => setSwitcherOpen(true)}>
          {course.flag} {course.name}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
        <div>
          {data.dueCount > 0 && (
            <Link
              href="/review"
              className="mb-6 flex items-center gap-4 rounded-2xl border-2 border-duo-purple/30 bg-duo-purplelight/50 p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-duo-purple/10"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-duo-purple text-white shadow-[0_4px_0_0_#A568CC]">
                <Brain size={28} />
              </span>
              <div className="flex-1">
                <p className="font-extrabold">Умное повторение</p>
                <p className="text-sm font-semibold text-duo-gray dark:text-white/60">
                  Пора освежить {data.dueCount} слов(а) — не дай им забыться!
                </p>
              </div>
              <ArrowRight size={22} className="text-duo-purple" />
            </Link>
          )}

          {units.map((u) => (
            <UnitSection
              key={u.unit.id}
              color={u.unit.color}
              title={u.unit.title}
              subtitle={u.unit.subtitle}
              doneCount={u.doneCount}
              totalCount={u.totalCount}
              nodes={u.nodes}
              onStart={(lessonId) => {
                window.location.href = `/lesson/${course.id}/${u.unit.id}/${lessonId}`
              }}
            />
          ))}
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border-2 border-black/5 bg-white p-4 text-center dark:border-white/10 dark:bg-duo-night-700">
            <GoalRing percent={goalPercent} size={140}>
              <span className="text-2xl font-black">{todayXp}</span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-duo-gray">
                из {data.user.dailyGoal} XP
              </span>
            </GoalRing>
            <p className="mt-1 text-sm font-extrabold text-duo-gray">Цель на день</p>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t-2 border-black/5 pt-3 dark:border-white/10">
              <MiniStat label="Уроков" value={data.today.lessons} />
              <MiniStat label="Верно" value={data.today.correct} />
              <MiniStat label="Идеально" value={data.today.perfectLessons} />
            </div>
          </div>

          <QuestList quests={data.quests} />
          <LeaderboardWidget />
        </aside>
      </div>

      <Modal open={switcherOpen} onClose={() => setSwitcherOpen(false)}>
        <h3 className="mb-1 text-xl font-black">Мои курсы</h3>
        <p className="mb-4 text-sm font-semibold text-duo-gray">Прогресс каждого курса сохраняется</p>
        <div className="space-y-3">
          {courseList.map((c) => {
            const total = flatLessons(c).length
            const done = data.progress.filter(
              (p) => p.courseId === c.id && p.completed
            ).length
            const active = c.id === activeCourseId
            return (
              <button
                key={c.id}
                disabled={switching != null}
                onClick={() => switchCourse(c.id)}
                className={cn(
                  'flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition hover:-translate-y-0.5',
                  active
                    ? 'border-duo-green bg-duo-greenlight/40 dark:bg-duo-green/10'
                    : 'border-black/10 hover:border-duo-blue/50 dark:border-white/15'
                )}
              >
                <span className="text-4xl">{c.flag}</span>
                <span className="flex-1">
                  <span className="block font-extrabold">{c.name}</span>
                  <span className="block text-xs font-semibold text-duo-gray">{c.tagline}</span>
                  <span className="mt-1 block text-xs font-bold text-duo-blue">
                    {done}/{total} уроков · {Math.round((done / total) * 100)}%
                  </span>
                </span>
                {active && (
                  <span className="rounded-full bg-duo-green px-2.5 py-1 text-[10px] font-extrabold uppercase text-white">
                    Активный
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </Modal>
    </AppShell>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-lg font-black">{value}</p>
      <p className="text-[10px] font-extrabold uppercase tracking-wide text-duo-gray">{label}</p>
    </div>
  )
}
