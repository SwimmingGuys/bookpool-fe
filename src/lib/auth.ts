import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'bookpool:auth'

const listeners = new Set<() => void>()

function readFromStorage(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

let cache = readFromStorage()

function persist() {
  if (typeof window === 'undefined') return
  if (cache) window.localStorage.setItem(STORAGE_KEY, '1')
  else window.localStorage.removeItem(STORAGE_KEY)
}

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = readFromStorage()
      emit()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', onStorage)
  }
}

function getSnapshot() {
  return cache
}

export function useAuth() {
  const isLoggedIn = useSyncExternalStore(subscribe, getSnapshot, () => false)
  return {
    isLoggedIn,
    login: () => {
      if (cache) return
      cache = true
      persist()
      emit()
    },
    logout: () => {
      if (!cache) return
      cache = false
      persist()
      emit()
    },
  }
}
