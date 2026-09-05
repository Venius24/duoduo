'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mascot } from '@/components/app/Mascot'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'

type Mode = 'login' | 'register'

const COLORS = ['#58CC02', '#1CB0F6', '#CE82FF', '#FF9600', '#FF4B4B']

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e?: React.FormEvent, creds?: { email: string; password: string }) => {
    e?.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (creds) {
        await api('/api/auth/login', { method: 'POST', body: JSON.stringify(creds) })
      } else if (mode === 'login') {
        await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      } else {
        await api('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, name, password, color }) })
      }
      router.push('/learn')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-duo-greenlight/60 via-white to-duo-bluelight/60 px-4 dark:from-duo-night-900 dark:via-duo-night-800 dark:to-duo-night-900">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Mascot size={96} className="mx-auto animate-floaty" />
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            дуо<span className="text-duo-green">дуо</span>
          </h1>
          <p className="text-sm font-semibold text-duo-gray">Английский и китайский — играя</p>
        </div>

        <div className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-duo-night-700">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-black/5 p-1 dark:bg-white/5">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m)
                  setError(null)
                }}
                className={`rounded-lg py-2.5 text-sm font-extrabold uppercase tracking-wide transition ${
                  mode === m ? 'bg-white text-duo-green shadow dark:bg-duo-night-600' : 'text-duo-gray'
                }`}
              >
                {m === 'login' ? 'Вход' : 'Регистрация'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === 'register' && (
              <>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Как тебя зовут?"
                  minLength={2}
                  maxLength={24}
                  required
                  className="w-full rounded-xl border-2 border-b-4 border-black/10 bg-white px-4 py-3 font-bold outline-none transition focus:border-duo-blue dark:border-white/15 dark:bg-duo-night-600"
                />
                <div className="flex items-center justify-between rounded-xl border-2 border-black/10 px-4 py-2.5 dark:border-white/15">
                  <span className="text-sm font-bold text-duo-gray">Цвет аватарки</span>
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-label={`Цвет ${c}`}
                        onClick={() => setColor(c)}
                        className={`h-7 w-7 rounded-full transition ${color === c ? 'ring-2 ring-offset-2 ring-duo-blue dark:ring-offset-duo-night-700' : ''}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              autoComplete="email"
              className="w-full rounded-xl border-2 border-b-4 border-black/10 bg-white px-4 py-3 font-bold outline-none transition focus:border-duo-blue dark:border-white/15 dark:bg-duo-night-600"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль (от 6 символов)"
              minLength={6}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full rounded-xl border-2 border-b-4 border-black/10 bg-white px-4 py-3 font-bold outline-none transition focus:border-duo-blue dark:border-white/15 dark:bg-duo-night-600"
            />

            {error && (
              <p className="animate-popin rounded-xl bg-duo-redlight px-4 py-2.5 text-sm font-bold text-duo-reddark dark:bg-duo-red/20 dark:text-duo-redlight">
                {error}
              </p>
            )}

            <Button type="submit" disabled={busy} className="w-full">
              {busy ? 'Секунду…' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={(e) =>
                submit(e as unknown as React.FormEvent, { email: 'demo@duoduo.app', password: 'demo123' })
              }
              disabled={busy}
              className="text-xs font-extrabold uppercase tracking-wide text-duo-blue hover:underline"
            >
              🎮 Попробовать демо-аккаунт
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs font-semibold text-duo-gray">
          Продолжая, ты соглашаешься учиться каждый день 🔥
        </p>
      </div>
    </div>
  )
}
