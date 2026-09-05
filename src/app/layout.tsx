import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Дуодуо — учи английский и китайский играя',
    template: '%s · Дуодуо'
  },
  description:
    'Бесплатный игровой тренажёр: английский и китайский с русского языка. Уроки, боссы, умные повторения, стрики и лиги.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Дуодуо'
}

export const viewport: Viewport = {
  themeColor: '#58CC02',
  width: 'device-width',
  initialScale: 1
}

const themeInit = `try{var t=localStorage.getItem('dd-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-screen bg-white font-sans text-duo-ink antialiased dark:bg-duo-night-900 dark:text-white">
        {children}
      </body>
    </html>
  )
}
