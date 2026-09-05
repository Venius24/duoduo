'use client'

import { Brain, Home, Settings, Trophy, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Flame, Gem, Heart, Moon, Sun } from 'lucide-react'
import { useMe } from '@/lib/me-store'
import { cn } from '@/lib/utils'
import { Mascot } from './Mascot'

const NAV = [
  { href: '/learn', label: 'Учиться', icon: Home },
  { href: '/review', label: 'Повторение', icon: Brain },
  { href: '/leaderboard', label: 'Лига', icon: Trophy },
  { href: '/profile', label: 'Профиль', icon: User },
  { href: '/settings', label: 'Настройки', icon: Settings }
]

function Chip({ icon, value, color }: { icon: React.ReactNode; value: React.ReactNode; color: string }) {
  return (
    <span className="flex items-center gap-1 text-sm font-extrabold" style={{ color }}>
      {icon}
      {value}
    </span>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data, loading, failed, load } = useMe()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    if (!data && !loading && !failed) load()
  }, [data, loading, failed, load])

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('dd-theme', next ? 'dark' : 'light')
  }

  useEffect(() => {
    if (failed) {
      window.location.href = '/auth'
    }
  }, [failed])

  const u = data?.user

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-duo-night-800/90">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <Link href="/learn" className="flex items-center gap-2">
            <Mascot size={34} />
            <span className="hidden text-lg font-extrabold tracking-tight text-duo-green sm:block">дуодуо</span>
          </Link>
          <div className="flex items-center gap-4">
            {u ? (
              <>
                <Chip icon={<Flame size={18} className="text-orange-500" />} value={u.streak} color="#FF9600" />
                <Chip icon={<Gem size={18} className="text-duo-blue" />} value={u.gems} color="#1CB0F6" />
                <Chip icon={<Heart size={18} className="text-duo-red" />} value={u.hearts} color="#FF4B4B" />
              </>
            ) : (
              <span className="text-sm font-bold text-duo-gray">…</span>
            )}
            <button
              onClick={toggleTheme}
              aria-label="Переключить тему"
              className="rounded-full p-2 text-duo-gray transition hover:bg-black/5 hover:text-duo-ink dark:hover:bg-white/10 dark:hover:text-white"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {u && (
              <Link
                href="/profile"
                aria-label="Профиль"
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold text-white ring-2 ring-white/60"
                style={{ background: u.color }}
              >
                {u.name.slice(0, 1).toUpperCase()}
              </Link>
            )}
          </div>
        </div>
      </header>

      <nav className="fixed left-0 top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-56 flex-col gap-1 border-r border-black/5 p-3 md:flex dark:border-white/10">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-extrabold uppercase tracking-wider transition',
                active
                  ? 'bg-duo-blue/10 text-duo-blue'
                  : 'text-duo-gray hover:bg-black/5 hover:text-duo-ink dark:hover:bg-white/5 dark:hover:text-white'
              )}
            >
              <Icon size={22} strokeWidth={2.5} />
              {label}
              {href === '/review' && (data?.dueCount ?? 0) > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-duo-red px-1.5 text-[11px] text-white">
                  {data!.dueCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 md:pl-64">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-black/5 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-duo-night-800/95 md:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-bold uppercase',
                active ? 'text-duo-blue' : 'text-duo-gray'
              )}
            >
              <Icon size={22} strokeWidth={2.5} />
              {label}
              {href === '/review' && (data?.dueCount ?? 0) > 0 && (
                <span className="absolute right-1/4 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-duo-red px-1 text-[9px] text-white">
                  {data!.dueCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
