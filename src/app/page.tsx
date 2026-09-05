import Link from 'next/link'
import { Brain, Flame, Gem, Languages, Mic, Moon, Swords, Timer, Trophy } from 'lucide-react'
import { Mascot } from '@/components/app/Mascot'

const FEATURES = [
  {
    icon: '🧠',
    title: 'Умные повторения',
    text: 'Алгоритм интервального повторения сам решает, когда показать тебе слово, чтобы оно засело в памяти навсегда.'
  },
  {
    icon: '⏱️',
    title: 'Боссы юнитов',
    text: 'В конце каждого юнита — сражение на время. Победи босса, чтобы открыть следующий раздел.'
  },
  {
    icon: '🎙️',
    title: 'Речевая практика',
    text: 'Произноси фразы вслух — распознавание речи оценит произношение. Работает прямо в браузере.'
  },
  {
    icon: '🎚️',
    title: 'Тренажёр тонов',
    text: 'Уникальный режим для китайского: учись различать четыре тона на слух и в пиньине.'
  },
  {
    icon: '🔥',
    title: 'Стрики и заморозки',
    text: 'Занимайся каждый день, держи огонёк и не теряй прогресс — даже в отпуск.'
  },
  {
    icon: '🏆',
    title: 'Лиги недели',
    text: 'Соревнуйся с другими учениками за место в таблице. Топ-7 выходит в высшую лигу.'
  },
  {
    icon: '📋',
    title: 'Квесты дня',
    text: 'Каждый день — новые мини-цели и алмазы за их выполнение.'
  },
  {
    icon: '🌙',
    title: 'Тёмная тема',
    text: 'Бережём глаза: полноценная тёмная тема, звуковые эффекты и озвучка слов.'
  }
]

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <Mascot size={38} />
          <span className="text-xl font-black tracking-tight text-duo-green">дуодуо</span>
        </div>
        <Link
          href="/auth"
          className="rounded-2xl bg-duo-green px-5 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_3px_0_0_#46A302] transition active:translate-y-[3px] active:shadow-none"
        >
          Войти
        </Link>
      </header>

      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:pt-16">
        <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-duo-green/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-duo-blue/15 blur-3xl" />

        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative z-10">
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border-2 border-duo-green/30 bg-duo-greenlight/50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-duo-greendark dark:bg-duo-green/10 dark:text-duo-greenlight">
              🇬🇧 English · 🇨🇳 中文 · с нуля
            </p>
            <h1 className="text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Учи языки <span className="text-duo-green">как в игре</span> — 5 минут в день
            </h1>
            <p className="mt-5 max-w-lg text-lg font-semibold leading-relaxed text-duo-gray dark:text-white/70">
              Дуодуо превращает английский и китайский в квест: короткие уроки, боссы,
              стрики и умные повторения. Бесплатно, без скучных учебников.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/auth"
                className="rounded-2xl bg-duo-green px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white shadow-[0_4px_0_0_#46A302] transition hover:brightness-105 active:translate-y-[4px] active:shadow-none"
              >
                Начать бесплатно
              </Link>
              <a
                href="#courses"
                className="rounded-2xl border-2 border-b-4 border-black/10 bg-white px-8 py-4 text-base font-extrabold uppercase tracking-wide text-duo-blue transition hover:bg-duo-bluelight/40 dark:border-white/15 dark:bg-duo-night-700"
              >
                Смотреть курсы
              </a>
            </div>
            <div className="mt-8 flex items-center gap-5 text-sm font-bold text-duo-gray">
              <span className="flex items-center gap-1.5"><Flame size={16} className="text-orange-500" /> Стрики</span>
              <span className="flex items-center gap-1.5"><Gem size={16} className="text-duo-blue" /> Алмазы</span>
              <span className="flex items-center gap-1.5"><Trophy size={16} className="text-duo-yellowdark" /> Лиги</span>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="absolute inset-0 m-auto h-72 w-72 rounded-full bg-gradient-to-br from-duo-greenlight to-duo-bluelight blur-2xl dark:opacity-20" />
            <Mascot size={280} className="relative animate-floaty drop-shadow-xl" />
            <div className="absolute -left-2 top-6 animate-floaty rounded-2xl border-2 border-black/5 bg-white px-4 py-2 text-sm font-extrabold shadow-lg dark:border-white/10 dark:bg-duo-night-700" style={{ animationDelay: '.5s' }}>
              你好! 👋
            </div>
            <div className="absolute -right-2 top-24 animate-floaty rounded-2xl border-2 border-black/5 bg-white px-4 py-2 text-sm font-extrabold shadow-lg dark:border-white/10 dark:bg-duo-night-700" style={{ animationDelay: '1.2s' }}>
              🔥 Стрик: 12
            </div>
            <div className="absolute bottom-4 left-8 animate-floaty rounded-2xl border-2 border-black/5 bg-white px-4 py-2 text-sm font-extrabold shadow-lg dark:border-white/10 dark:bg-duo-night-700" style={{ animationDelay: '2s' }}>
              +30 XP ⚡
            </div>
          </div>
        </div>
      </section>

      <section className="bg-duo-greenlight/40 py-16 dark:bg-white/[.03]">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-10 text-center text-3xl font-black">Почему это работает</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border-2 border-black/5 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-duo-night-700"
              >
                <p className="mb-2 text-3xl">{f.icon}</p>
                <h3 className="mb-1 font-extrabold">{f.title}</h3>
                <p className="text-sm font-semibold leading-relaxed text-duo-gray dark:text-white/60">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-2 text-center text-3xl font-black">Два курса — один аккаунт</h2>
        <p className="mb-10 text-center font-semibold text-duo-gray">Переключайся между языками когда угодно</p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="group rounded-3xl border-2 border-black/5 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-duo-night-700">
            <p className="text-6xl">🇬🇧</p>
            <h3 className="mt-3 text-2xl font-black">English Flow</h3>
            <p className="mt-1 font-semibold text-duo-gray">Английский с русского: от «hello» до аэропорта</p>
            <ul className="mt-5 space-y-2 text-sm font-semibold">
              <li>✅ 6 юнитов, 24 урока и 6 боссов</li>
              <li>✅ Озвучка каждого слова и фразы</li>
              <li>✅ Грамматические карточки внутри уроков</li>
              <li>✅ Практика произношения с микрофоном</li>
            </ul>
          </div>
          <div className="group rounded-3xl border-2 border-black/5 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-duo-night-700">
            <p className="text-6xl">🇨🇳</p>
            <h3 className="mt-3 text-2xl font-black">Путь дракона</h3>
            <p className="mt-1 font-semibold text-duo-gray">Китайский с русского: пиньинь, тоны и иероглифы</p>
            <ul className="mt-5 space-y-2 text-sm font-semibold">
              <li>✅ 6 юнитов, 24 урока и драконий босс 🐉</li>
              <li>✅ Уникальный тренажёр четырёх тонов</li>
              <li>✅ Ответы пиньинем — клавиатура не нужна</li>
              <li>✅ Иероглифы с озвучкой носителем (TTS)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-duo-blue/5 py-16 dark:bg-white/[.03]">
        <div className="mx-auto grid max-w-4xl gap-8 px-4 sm:grid-cols-3">
          {[
            { n: '1', t: 'Выбери язык', d: 'Английский или китайский — или оба сразу.' },
            { n: '2', t: 'Проходи уроки', d: 'Пять минут в день: слова, фразы, аудио и речь.' },
            { n: '3', t: 'Держи стрик', d: 'Квесты, лиги и боссы не дадут бросить.' }
          ].map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-duo-green text-2xl font-black text-white shadow-[0_4px_0_0_#46A302]">
                {s.n}
              </div>
              <h3 className="font-extrabold">{s.t}</h3>
              <p className="mt-1 text-sm font-semibold text-duo-gray">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-black">Частые вопросы</h2>
        <div className="space-y-3">
          {[
            ['Это правда бесплатно?', 'Да. Все уроки, повторения и лиги доступны бесплатно. Опционально можно подключить ИИ-объяснения ошибок своим API-ключом.'],
            ['Нужно ли уметь печатать иероглифы?', 'Нет! Для китайского можно отвечать пиньинем латиницей: «ni hao» засчитается как «你好».'],
            ['Что если я пропущу день?', 'Стрик заморозится не сразу: сердца восстановятся сами, а «умные повторения» напомнят забытые слова.'],
            ['Работает ли на телефоне?', 'Да, сайт адаптирован под мобильные, его можно установить как приложение (PWA).']
          ].map(([q, a]) => (
            <details
              key={q}
              className="group rounded-2xl border-2 border-black/5 bg-white p-4 open:shadow-md dark:border-white/10 dark:bg-duo-night-700"
            >
              <summary className="cursor-pointer list-none font-extrabold marker:hidden">
                <span className="mr-2 inline-block transition group-open:rotate-90">▶</span>
                {q}
              </summary>
              <p className="mt-2 pl-6 text-sm font-semibold text-duo-gray dark:text-white/70">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-duo-green to-duo-blue p-10 text-center text-white shadow-xl">
          <Mascot size={110} className="mx-auto -mt-24 mb-2 drop-shadow-xl" />
          <h2 className="text-3xl font-black">Готов(а) к первому уроку?</h2>
          <p className="mx-auto mt-2 max-w-md font-semibold opacity-90">
            Регистрация занимает 15 секунд. Первый босс уже ждёт.
          </p>
          <Link
            href="/auth"
            className="mt-6 inline-block rounded-2xl bg-white px-10 py-4 text-base font-extrabold uppercase tracking-wide text-duo-green shadow-[0_4px_0_0_rgba(0,0,0,.15)] transition active:translate-y-[4px] active:shadow-none"
          >
            Начать сейчас
          </Link>
        </div>
      </section>

      <footer className="border-t border-black/5 py-8 text-center text-sm font-semibold text-duo-gray dark:border-white/10">
        <p>Дуодуо © {new Date().getFullYear()} · Сделано с ❤️ для полиглотов</p>
        <p className="mt-1 flex items-center justify-center gap-3 text-xs">
          <Languages size={13} /> en · zh · ru
          <Brain size={13} /> SRS
          <Mic size={13} /> speech
          <Timer size={13} /> bosses
          <Moon size={13} /> dark mode
        </p>
      </footer>
    </div>
  )
}
