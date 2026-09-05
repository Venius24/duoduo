'use client'

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

export function soundEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('dd-sound') !== 'off'
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.12) {
  const audio = getCtx()
  if (!audio) return
  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(gain, audio.currentTime + start)
  g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + dur)
  osc.connect(g)
  g.connect(audio.destination)
  osc.start(audio.currentTime + start)
  osc.stop(audio.currentTime + start + dur + 0.05)
}

export function sfxTap() {
  if (!soundEnabled()) return
  tone(600, 0, 0.06, 'triangle', 0.06)
}

export function sfxCorrect(combo = 0) {
  if (!soundEnabled()) return
  const base = 520 + Math.min(combo, 6) * 40
  tone(base, 0, 0.12, 'sine')
  tone(base * 1.5, 0.09, 0.16, 'sine')
}

export function sfxWrong() {
  if (!soundEnabled()) return
  tone(220, 0, 0.18, 'sawtooth', 0.08)
  tone(160, 0.12, 0.22, 'sawtooth', 0.08)
}

export function sfxFinish() {
  if (!soundEnabled()) return
  tone(523, 0, 0.14)
  tone(659, 0.13, 0.14)
  tone(784, 0.26, 0.14)
  tone(1046, 0.39, 0.32)
}

export function sfxHeartLost() {
  if (!soundEnabled()) return
  tone(330, 0, 0.15, 'square', 0.07)
  tone(247, 0.14, 0.25, 'square', 0.07)
}
