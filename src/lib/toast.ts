import { useSyncExternalStore } from 'react'
import { createStore } from '@/lib/createStore'

export type ToastVariant = 'info' | 'success' | 'warning' | 'error'

export interface Toast {
  id: number
  message: string
  variant: ToastVariant
}

const DEFAULT_DURATION_MS = 2400
const EMPTY: Toast[] = []

const toastStore = createStore<Toast[]>([])
const timers = new Map<number, number>()
let nextId = 1

export function showToast(
  message: string,
  variant: ToastVariant = 'info',
  durationMs = DEFAULT_DURATION_MS,
): number {
  const id = nextId++
  toastStore.set((prev) => [...prev, { id, message, variant }])
  if (typeof window !== 'undefined') {
    const handle = window.setTimeout(() => {
      timers.delete(id)
      dismissToast(id)
    }, durationMs)
    timers.set(id, handle)
  }
  return id
}

export function dismissToast(id: number): void {
  const handle = timers.get(id)
  if (handle !== undefined) {
    clearTimeout(handle)
    timers.delete(id)
  }
  toastStore.set((prev) => {
    const next = prev.filter((t) => t.id !== id)
    return next.length === prev.length ? prev : next
  })
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, () => EMPTY)
}
