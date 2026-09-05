'use client'

import { api } from './api'
import type { MePayload } from './types'
import { create } from 'zustand'

interface MeStore {
  data: MePayload | null
  loading: boolean
  failed: boolean
  load: () => Promise<void>
  patchLocal: (p: Partial<MePayload>) => void
}

let inflight: Promise<void> | null = null

export const useMe = create<MeStore>()((set) => ({
  data: null,
  loading: false,
  failed: false,
  load: async () => {
    if (inflight) return inflight
    set({ loading: true, failed: false })
    inflight = api<MePayload>('/api/me')
      .then((data) => set({ data, loading: false }))
      .catch(() => set({ loading: false, failed: true }))
      .finally(() => {
        inflight = null
      })
    return inflight
  },
  patchLocal: (p) =>
    set((s) => ({
      data: s.data
        ? {
            ...s.data,
            user: p.user ? { ...s.data.user, ...p.user } : s.data.user,
            today: p.today ? { ...s.data.today, ...p.today } : s.data.today,
            dueCount: p.dueCount ?? s.data.dueCount
          }
        : s.data
    }))
}))
