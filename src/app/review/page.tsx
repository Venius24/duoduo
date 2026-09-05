'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ReviewDone, ReviewSession, type ReviewSummary } from '@/components/learn/ReviewSession'
import { Button } from '@/components/ui/Button'
import { getCourse } from '@/content'
import type { Item, Lang } from '@/content/types'
import { api } from '@/lib/api'
import { useMe } from '@/lib/me-store'

export default function ReviewPage() {
  const router = useRouter()
  const { data, load } = useMe()
  const [items, setItems] = useState<Item[] | null>(null)
  const [summary, setSummary] = useState<ReviewSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<{ items: Item[] }>('/api/review/due?limit=12')
      .then((r) => setItems(r.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!data) load()
  }, [data, load])

  if (!data || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm font-bold text-duo-gray">
        Загружаем слова…
      </div>
    )
  }

  if (summary) {
    return (
      <ReviewDone
        summary={summary}
        onBack={() => {
          load()
          router.push('/learn')
        }}
      />
    )
  }

  const course = getCourse(data.user.activeCourse)!

  if (!items || items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="mb-3 text-6xl">🎉</p>
        <h1 className="text-2xl font-black">Всё повторено!</h1>
        <p className="mt-2 max-w-xs text-sm font-semibold text-duo-gray">
          Нет слов, ожидающих повторения. Пройди новый урок — и они появятся здесь.
        </p>
        <Link href="/learn" className="mt-6">
          <Button variant="secondary">Вернуться к урокам</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-duo-night-900 dark:text-white">
      <ReviewSession
        key={items.map((i) => i.id).join(',')}
        items={items}
        lang={course.id}
        ttsRate={data.user.ttsRate}
        onDone={(s) => setSummary(s)}
      />
    </div>
  )
}
