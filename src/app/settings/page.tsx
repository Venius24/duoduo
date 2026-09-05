'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/app/AppShell'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { api } from '@/lib/api'
import { soundEnabled } from '@/lib/sfx'
import { useMe } from '@/lib/me-store'
import { cn } from '@/lib/utils'

const GOALS = [
  { value: 20, label: 'Спокойная', emoji: '🌱' },
  { value: 40, label: 'Обычная', emoji: '🔥' },
  { value: 60, label: 'Серьёзная', emoji: '💪' },
  { value: 100, label: 'Хардкор', emoji: '👑' }
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5 rounded-2xl border-2 border-black/5 bg-white p-5 dark:border-white/10 dark:bg-duo-night-700">
      <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-duo-gray">{title}</h2>
      {children}
    </section>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { data, load, patchLocal } = useMe()
  const [dark, setDark] = useState(false)
  const [sound, setSound] = useState(true)
  const [resetOpen, setResetOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!data) load()
    setDark(document.documentElement.classList.contains('dark'))
    setSound(soundEnabled())
  }, [data, load])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('dd-theme', next ? 'dark' : 'light')
  }

  const patch = async (body: Record<string, unknown>) => {
    await api('/api/me', { method: 'PATCH', body: JSON.stringify(body) })
    await load()
  }

  const logout = async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {})
    window.location.href = '/'
  }

  const resetProgress = async () => {
    setBusy(true)
    try {
      await api('/api/settings/reset', { method: 'POST' })
      setResetOpen(false)
      router.push('/learn')
      setTimeout(() => window.location.reload(), 100)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AppShell>
      <h1 className="mb-5 text-2xl font-black">Настройки</h1>

      <Section title="Внешний вид">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center justify-between rounded-xl border-2 border-black/10 px-4 py-3 font-bold transition hover:bg-black/[.03] dark:border-white/15"
        >
          <span className="flex items-center gap-3">
            {dark ? <Moon size={20} className="text-duo-purple" /> : <Sun size={20} className="text-duo-yellowdark" />}
            Тема оформления
          </span>
          <span
            className={cn(
              'relative h-7 w-12 rounded-full transition',
              dark ? 'bg-duo-green' : 'bg-black/15'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all',
                dark ? 'left-[22px]' : 'left-0.5'
              )}
            />
          </span>
        </button>
      </Section>

      <Section title="Звук">
        <button
          onClick={() => {
            const next = !sound
            setSound(next)
            localStorage.setItem('dd-sound', next ? 'on' : 'off')
          }}
          className="flex w-full items-center justify-between rounded-xl border-2 border-black/10 px-4 py-3 font-bold transition hover:bg-black/[.03] dark:border-white/15"
        >
          🔔 Звуковые эффекты
          <span
            className={cn(
              'relative h-7 w-12 rounded-full transition',
              sound ? 'bg-duo-green' : 'bg-black/15'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all',
                sound ? 'left-[22px]' : 'left-0.5'
              )}
            />
          </span>
        </button>
      </Section>

      <Section title="Озвучка слов">
        <label className="block font-bold">
          Скорость речи: <span className="text-duo-blue">{(data?.user.ttsRate ?? 1).toFixed(2)}×</span>
        </label>
        <input
          type="range"
          min="0.6"
          max="1.2"
          step="0.05"
          value={data?.user.ttsRate ?? 1}
          onChange={(e) => patchLocal({ user: data ? { ...data.user, ttsRate: Number(e.target.value) } : undefined })}
          onMouseUp={(e) => patch({ ttsRate: Number((e.target as HTMLInputElement).value) })}
          onTouchEnd={(e) => patch({ ttsRate: Number((e.target as HTMLInputElement).value) })}
          className="mt-2 w-full accent-duo-blue"
        />
      </Section>

      <Section title="Цель на день">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {GOALS.map((g) => (
            <button
              key={g.value}
              onClick={() => patch({ dailyGoal: g.value })}
              disabled={!data || busy}
              className={cn(
                'rounded-2xl border-2 border-b-4 p-3 text-center transition active:translate-y-[2px] active:border-b-2',
                data?.user.dailyGoal === g.value
                  ? 'border-duo-green bg-duo-greenlight/50 text-duo-greendark dark:bg-duo-green/15 dark:text-duo-greenlight'
                  : 'border-black/10 hover:border-duo-green/40 dark:border-white/15'
              )}
            >
              <p className="text-2xl">{g.emoji}</p>
              <p className="mt-1 text-xs font-extrabold uppercase">{g.label}</p>
              <p className="text-[11px] font-bold text-duo-gray">{g.value} XP</p>
            </button>
          ))}
        </div>
      </Section>

      {data && (
        <Section title="Аккаунт">
          <p className="mb-3 text-sm font-bold">
            {data.user.name} · {data.user.email}
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Button variant="secondary" size="md" onClick={logout}>
              Выйти из аккаунта
            </Button>
            <Button variant="danger" size="md" onClick={() => setResetOpen(true)}>
              Сбросить прогресс
            </Button>
          </div>
        </Section>
      )}

      <p className="pb-6 text-center text-xs font-semibold text-duo-gray">
        Дуодуо v1.0 · Next.js + Prisma + SQLite · сделано с ❤️
      </p>

      <Modal open={resetOpen} onClose={() => !busy && setResetOpen(false)}>
        <div className="text-center">
          <p className="mb-2 text-5xl">⚠️</p>
          <h3 className="mb-1 text-xl font-extrabold">Точно сбросить всё?</h3>
          <p className="mb-5 text-sm font-semibold text-duo-gray">
            Будут удалены: прогресс уроков, умные повторения, стрик, достижения и статистика. Алмазы вернутся к 500.
          </p>
          <div className="flex flex-col gap-2.5">
            <Button variant="danger" onClick={resetProgress} disabled={busy}>
              {busy ? 'Стираю…' : 'Да, сбросить'}
            </Button>
            <Button variant="secondary" onClick={() => setResetOpen(false)} disabled={busy}>
              Отмена
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  )
}
