import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { useAuth } from '@/lib/auth'
import {
  addBookmark,
  listBookmarkedCampaignIds,
  listRecentCampaignIds,
  markRecentCampaign,
  removeBookmark,
} from '@/lib/api/campaigns'
import { showToast } from '@/lib/toast'

const EMPTY_FAVORITES: ReadonlySet<string> = new Set()
const EMPTY_RECENT: readonly string[] = []
const EMPTY_IDS: readonly string[] = []
const MAX_RECENT = 50

let favoritesUserId: string | null = null
let favoritesCache: Set<string> = new Set()
let favoritesLoading: Promise<void> | null = null
const favoritesListeners = new Set<() => void>()

function emitFavorites() {
  favoritesListeners.forEach((listener) => listener())
}

function favoritesSubscribe(listener: () => void) {
  favoritesListeners.add(listener)
  return () => favoritesListeners.delete(listener)
}

async function refreshFavorites(userId: string | null): Promise<void> {
  if (!userId) {
    favoritesCache = new Set()
    emitFavorites()
    return
  }
  if (favoritesLoading) return favoritesLoading
  favoritesLoading = listBookmarkedCampaignIds()
    .then((ids) => {
      favoritesCache = new Set(ids)
      emitFavorites()
    })
    .finally(() => {
      favoritesLoading = null
    })
  return favoritesLoading
}

function syncFavoritesUser(userId: string | null) {
  if (userId === favoritesUserId) return
  favoritesUserId = userId
  void refreshFavorites(userId)
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
      const wasFavorite = favoritesCache.has(id)
      const next = new Set(favoritesCache)
      if (wasFavorite) next.delete(id)
      else next.add(id)
      favoritesCache = next
      emitFavorites()

      const request = wasFavorite ? removeBookmark(id) : addBookmark(id)
      request.catch(() => {
        favoritesCache = new Set(set)
        emitFavorites()
        showToast('즐겨찾기 변경에 실패했습니다.', 'error')
      })
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

let recentUserId: string | null = null
let recentCache: string[] = []
let recentLoading: Promise<void> | null = null
const recentListeners = new Set<() => void>()

function emitRecent() {
  recentListeners.forEach((listener) => listener())
}

function recentSubscribe(listener: () => void) {
  recentListeners.add(listener)
  return () => recentListeners.delete(listener)
}

async function refreshRecent(userId: string | null): Promise<void> {
  if (!userId) {
    recentCache = []
    emitRecent()
    return
  }
  if (recentLoading) return recentLoading
  recentLoading = listRecentCampaignIds()
    .then((ids) => {
      recentCache = ids.slice(0, MAX_RECENT)
      emitRecent()
    })
    .finally(() => {
      recentLoading = null
    })
  return recentLoading
}

function syncRecentUser(userId: string | null) {
  if (userId === recentUserId) return
  recentUserId = userId
  void refreshRecent(userId)
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
      const filtered = recentCache.filter((item) => item !== id)
      recentCache = [id, ...filtered].slice(0, MAX_RECENT)
      emitRecent()
      markRecentCampaign(id).catch(() => undefined)
    },
  }
}
