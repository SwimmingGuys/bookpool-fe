import { useSyncExternalStore } from 'react'

export type ToastVariant = 'info' | 'success' | 'warning' | 'error'

export interface Toast {
  id: number
  message: string
  variant: ToastVariant
}

const listeners = new Set<() => void>()
let toasts: Toast[] = []
let nextId = 1

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function getSnapshot() {
  return toasts
}

export function showToast(message: string, variant: ToastVariant = 'info', durationMs = 2400) {
  const id = nextId++
  toasts = [...toasts, { id, message, variant }]
  emit()
  if (typeof window !== 'undefined') {
    window.setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id)
      emit()
    }, durationMs)
  }
  return id
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

export function useToasts() {
  return useSyncExternalStore(subscribe, getSnapshot, () => [])
}
