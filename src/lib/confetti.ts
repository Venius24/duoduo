'use client'

const COLORS = ['#58CC02', '#1CB0F6', '#FFC800', '#CE82FF', '#FF4B4B']

export function confetti(count = 90) {
  if (typeof document === 'undefined') return
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    const size = 6 + Math.random() * 8
    el.style.cssText = [
      `position:fixed`,
      `left:${Math.random() * 100}vw`,
      `top:-5vh`,
      `width:${size}px`,
      `height:${size * (Math.random() > 0.5 ? 1 : 0.45)}px`,
      `background:${COLORS[i % COLORS.length]}`,
      `border-radius:${Math.random() > 0.5 ? '50%' : '2px'}`,
      `z-index:9999`,
      `pointer-events:none`,
      `animation:fall ${2.2 + Math.random() * 1.8}s ${Math.random() * 0.8}s linear forwards`
    ].join(';')
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 5200)
  }
}
