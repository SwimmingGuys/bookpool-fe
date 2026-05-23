import { useSyncExternalStore } from 'react'

function makeIdSetStore(storageKey: string) {
  const listeners = new Set<() => void>()

  function readFromStorage(): Set<string> {
    if (typeof window === 'undefined') return new Set()
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) return new Set()
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? new Set(parsed) : new Set()
    } catch {
      return new Set()
    }
  }

  let cache = readFromStorage()
  let snapshot = serialize(cache)

  function serialize(set: Set<string>): string {
    return [...set].sort().join('|')
  }

  function persist() {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(storageKey, JSON.stringify([...cache]))
  }

  function emit() {
    snapshot = serialize(cache)
    listeners.forEach((l) => l())
  }

  function subscribe(cb: () => void) {
    listeners.add(cb)
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey) {
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
    return snapshot
  }

  function add(id: string) {
    if (cache.has(id)) return
    const next = new Set(cache)
    next.add(id)
    cache = next
    persist()
    emit()
  }

  function remove(id: string) {
    if (!cache.has(id)) return
    const next = new Set(cache)
    next.delete(id)
    cache = next
    persist()
    emit()
  }

  function toggle(id: string) {
    if (cache.has(id)) remove(id)
    else add(id)
  }

  function has(id: string) {
    return cache.has(id)
  }

  return { subscribe, getSnapshot, add, remove, toggle, has }
}

const readStore = makeIdSetStore('bookpool:read')
const favoriteStore = makeIdSetStore('bookpool:favorites')

export function useReadRecruitments() {
  useSyncExternalStore(
    readStore.subscribe,
    readStore.getSnapshot,
    () => '',
  )
  return {
    isRead: (id: string) => readStore.has(id),
    markAsRead: (id: string) => readStore.add(id),
  }
}

export function useFavorites() {
  useSyncExternalStore(
    favoriteStore.subscribe,
    favoriteStore.getSnapshot,
    () => '',
  )
  return {
    isFavorite: (id: string) => favoriteStore.has(id),
    toggleFavorite: (id: string) => favoriteStore.toggle(id),
  }
}
