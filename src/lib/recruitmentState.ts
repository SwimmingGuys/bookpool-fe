import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { useAuth } from '@/lib/auth'
import { showToast } from '@/lib/toast'

const EMPTY_FAVORITES: ReadonlySet<string> = new Set()
const EMPTY_RECENT: readonly string[] = []
const EMPTY_IDS: readonly string[] = []
const MAX_RECENT = 50

function loadJsonArray(key: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

function saveJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota
  }
}

// ---------- Favorites (per-user, Set semantics) ----------

let favoritesUserId: string | null = null
let favoritesCache: Set<string> = new Set()
const favoritesListeners = new Set<() => void>()

function favoritesKey(userId: string | null): string | null {
  return userId ? `bookpool:favorites:${userId}` : null
}

function loadFavorites(userId: string | null): Set<string> {
  const key = favoritesKey(userId)
  if (!key) return new Set()
  return new Set(loadJsonArray(key))
}

function persistFavorites() {
  const key = favoritesKey(favoritesUserId)
  if (!key) return
  saveJson(key, [...favoritesCache])
}

function emitFavorites() {
  favoritesListeners.forEach((l) => l())
}

function syncFavoritesUser(userId: string | null) {
  if (userId === favoritesUserId) return
  favoritesUserId = userId
  favoritesCache = loadFavorites(userId)
  emitFavorites()
}

function favoritesSubscribe(cb: () => void) {
  favoritesListeners.add(cb)
  return () => {
    favoritesListeners.delete(cb)
  }
}

export function useFavorites() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  useEffect(() => {
    syncFavoritesUser(userId)
  }, [userId])

  const set = useSyncExternalStore(
    favoritesSubscribe,
    () => favoritesCache,
    () => EMPTY_FAVORITES as Set<string>,
  )

  const favoriteIds = useMemo(
    () => (user !== null ? [...set] : (EMPTY_IDS as string[])),
    [user, set],
  )

  return {
    favoriteIds,
    isFavorite: (id: string) => user !== null && set.has(id),
    toggleFavorite: (id: string) => {
      if (!user) return
      const next = new Set(favoritesCache)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      favoritesCache = next
      persistFavorites()
      emitFavorites()
    },
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

// ---------- Recently viewed (per-user, recency-ordered list) ----------

let recentUserId: string | null = null
let recentCache: string[] = []
const recentListeners = new Set<() => void>()

function recentKey(userId: string | null): string | null {
  return userId ? `bookpool:recent:${userId}` : null
}

function loadRecent(userId: string | null): string[] {
  const key = recentKey(userId)
  if (!key) return []
  return loadJsonArray(key).slice(0, MAX_RECENT)
}

function persistRecent() {
  const key = recentKey(recentUserId)
  if (!key) return
  saveJson(key, recentCache)
}

function emitRecent() {
  recentListeners.forEach((l) => l())
}

function syncRecentUser(userId: string | null) {
  if (userId === recentUserId) return
  recentUserId = userId
  recentCache = loadRecent(userId)
  emitRecent()
}

function recentSubscribe(cb: () => void) {
  recentListeners.add(cb)
  return () => {
    recentListeners.delete(cb)
  }
}

export function useReadRecruitments() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  useEffect(() => {
    syncRecentUser(userId)
  }, [userId])

  const list = useSyncExternalStore(
    recentSubscribe,
    () => recentCache,
    () => EMPTY_RECENT as string[],
  )

  const recentIds = useMemo(
    () => (user !== null ? list : (EMPTY_IDS as string[])),
    [user, list],
  )

  return {
    recentIds,
    isRead: (id: string) => user !== null && list.includes(id),
    markAsRead: (id: string) => {
      if (!user) return
      if (recentCache[0] === id) return
      const filtered = recentCache.filter((x) => x !== id)
      const next = [id, ...filtered].slice(0, MAX_RECENT)
      recentCache = next
      persistRecent()
      emitRecent()
    },
  }
}
