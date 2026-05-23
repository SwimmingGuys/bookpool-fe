import { useSyncExternalStore } from 'react'
import { createStore } from '@/lib/createStore'
import { useAuth } from '@/lib/auth'
import { showToast } from '@/lib/toast'

const EMPTY_SET: ReadonlySet<string> = new Set()

function makeIdSetStore(storageKey: string) {
  const store = createStore<Set<string>>(new Set(), {
    storageKey,
    parse: (raw) => {
      const arr = JSON.parse(raw)
      return Array.isArray(arr) ? new Set<string>(arr) : undefined
    },
    serialize: (set) => JSON.stringify([...set]),
  })

  function has(id: string) {
    return store.get().has(id)
  }

  function add(id: string) {
    const cur = store.get()
    if (cur.has(id)) return
    const next = new Set(cur)
    next.add(id)
    store.set(next)
  }

  function toggle(id: string) {
    const cur = store.get()
    const next = new Set(cur)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    store.set(next)
  }

  return { subscribe: store.subscribe, getSnapshot: store.getSnapshot, has, add, toggle }
}

const readStore = makeIdSetStore('bookpool:read')
const favoriteStore = makeIdSetStore('bookpool:favorites')

export function useReadRecruitments() {
  useSyncExternalStore(readStore.subscribe, readStore.getSnapshot, () => EMPTY_SET as Set<string>)
  return {
    isRead: readStore.has,
    markAsRead: readStore.add,
  }
}

export function useFavorites() {
  useSyncExternalStore(favoriteStore.subscribe, favoriteStore.getSnapshot, () => EMPTY_SET as Set<string>)
  return {
    isFavorite: favoriteStore.has,
    toggleFavorite: favoriteStore.toggle,
  }
}

export function useFavoriteWithAuth() {
  const { isFavorite, toggleFavorite } = useFavorites()
  const { isLoggedIn } = useAuth()
  return {
    isFavorite,
    toggleFavorite: (id: string) => {
      if (!isLoggedIn) {
        showToast('로그인이 필요한 서비스입니다.', 'warning')
        return
      }
      toggleFavorite(id)
    },
  }
}
