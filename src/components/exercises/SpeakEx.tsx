'use client'

import { useState } from 'react'
import { Mic, RefreshCw } from 'lucide-react'
import type { Exercise, Lang } from '@/content/types'
import { normalizeAnswer, similarity } from '@/lib/normalize'
import { recognizeOnce, speechSupported } from '@/lib/speech'
import { Prompt } from './shared'

interface Props {
  ex: Extract<Exercise, { kind: 'speak' }>
  lang: Lang
  value: unknown
  onChange: (v: string) => void
  locked: boolean
  seed: number
  ttsRate: number
}

export function SpeakEx({ ex, lang, onChange }: Props) {
  const [state, setState] = useState<'idle' | 'listening' | 'heard' | 'error'>('idle')
  const [heard, setHeard] = useState('')
  const supported = speechSupported()

  const listen = async () => {
    setState('listening')
    try {
      const res = await recognizeOnce(lang)
      setHeard(res.transcript)
      setState('heard')
      const sim = similarity(normalizeAnswer(res.transcript, lang), normalizeAnswer(ex.say, lang))
      if (sim >= 0.7) {
        onChange('ok')
      }
    } catch {
      setState('error')
    }
  }

  const good = state === 'heard' && similarity(normalizeAnswer(heard, lang), normalizeAnswer(ex.say, lang)) >= 0.7

  return (
    <div>
      <Prompt note={ex.roman}>Произнеси вслух</Prompt>

      <div className="mx-auto mb-6 max-w-md rounded-2xl border-2 border-dashed border-black/10 p-5 text-center dark:border-white/15">
        <p className="text-xl font-extrabold">{ex.say}</p>
        <p className="mt-1 text-sm font-semibold text-duo-gray">«{ex.ru}»</p>
      </div>

      {!supported && (
        <p className="mb-4 text-center text-sm font-semibold text-duo-yellowdark">
          Микрофон недоступен в этом браузере — оцени себя сам(а):
        </p>
      )}

      {supported && (
        <div className="mb-5 flex flex-col items-center gap-3">
          <button
            onClick={listen}
            disabled={state === 'listening'}
            aria-label="Говорить"
            className={`flex h-24 w-24 items-center justify-center rounded-full text-white shadow-[0_5px_0_0_#EA2B2B] transition active:translate-y-[4px] active:shadow-none ${
              state === 'listening' ? 'animate-pulse bg-duo-reddark' : 'bg-duo-red hover:brightness-105'
            }`}
          >
            <Mic size={40} />
          </button>
          {state === 'listening' && (
            <p className="text-sm font-bold text-duo-gray">Слушаю… говори!</p>
          )}
          {state === 'heard' && (
            <p className={`text-sm font-extrabold ${good ? 'text-duo-greendark' : 'text-duo-reddark'}`}>
              Услышано: «{heard}» {good ? '— совпадает!' : '— не совпадает'}
            </p>
          )}
          {state === 'error' && (
            <p className="text-sm font-bold text-duo-reddark">Не удалось распознать. Попробуй ещё раз.</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2.5">
        {(supported ? state === 'heard' || state === 'error' : true) && !good && (
          <>
            {supported && (
              <button
                onClick={() => {
                  setHeard('')
                  setState('idle')
                }}
                className="flex items-center gap-1.5 rounded-xl border-2 border-b-4 border-black/10 px-4 py-2.5 text-sm font-bold transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
              >
                <RefreshCw size={16} /> Ещё раз
              </button>
            )}
            <button
              onClick={() => onChange('ok')}
              className="rounded-xl border-2 border-b-4 border-duo-green/40 px-4 py-2.5 text-sm font-bold text-duo-greendark transition hover:bg-duo-greenlight/40 dark:text-duo-greenlight"
            >
              Я сказал верно ✓
            </button>
            <button
              onClick={() => onChange('skipped')}
              className="rounded-xl border-2 border-b-4 border-black/10 px-4 py-2.5 text-sm font-bold text-duo-gray transition hover:bg-black/5 dark:border-white/15"
            >
              Не получается ✗
            </button>
          </>
        )}
      </div>
    </div>
  )
}
