'use client'

import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'gold' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-duo-green text-white shadow-[0_4px_0_0_#46A302] hover:brightness-105 active:shadow-none',
  secondary:
    'bg-white dark:bg-duo-night-700 text-duo-blue shadow-[0_4px_0_0_#E5E5E5] dark:shadow-[0_4px_0_0_#2E4A57] hover:bg-duo-bluelight/50 dark:hover:bg-duo-night-600 active:shadow-none',
  danger: 'bg-duo-red text-white shadow-[0_4px_0_0_#EA2B2B] hover:brightness-105 active:shadow-none',
  gold: 'bg-duo-yellow text-white shadow-[0_4px_0_0_#E6AC00] hover:brightness-105 active:shadow-none',
  ghost: 'bg-transparent text-duo-gray hover:text-duo-ink dark:hover:text-white shadow-none'
}

const SIZES: Record<Size, string> = {
  sm: 'text-xs px-4 py-2 rounded-xl',
  md: 'text-sm px-5 py-2.5 rounded-xl',
  lg: 'text-base px-7 py-3 rounded-2xl'
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children?: ReactNode
}

export function Button({ variant = 'primary', size = 'lg', className, children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={cn(
        'select-none font-extrabold uppercase tracking-wide transition-all duration-100 active:translate-y-[3px]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 disabled:shadow-[0_4px_0_0_rgba(0,0,0,.2)]',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-duo-blue/30',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
    >
      {children}
    </button>
  )
}
