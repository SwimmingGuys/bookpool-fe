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

const EMPTY_RECENT: readonly string[] = []
const EMPTY_IDS: readonly string[] = []
const MAX_RECENT = 50

/**
 * 즐겨찾기 스냅샷.
 *
 * `version`은 즐겨찾기가 실제로 바뀔 때마다 올라간다. 별표 상태(집합)와 달리,
 * 즐겨찾기 '공고 목록'은 서버에서 따로 받아오기 때문에 집합만 갱신하면 목록이 낡는다.
 * 마이페이지에서 별을 누르고 즐겨찾기 탭으로 넘어가도 탭 전환은 리마운트가 아니라,
 * 마운트 때 받아둔 목록이 그대로 남아 새로고침해야 보이던 문제가 여기서 나왔다.
 * 목록을 받는 쪽은 이 값을 조회 deps에 넣어 다시 받아온다.
 */
interface FavoritesSnapshot {
  ids: Set<string>
  version: number
}

const EMPTY_FAVORITES: FavoritesSnapshot = { ids: new Set(), version: 0 }

let favoritesUserId: string | null = null
let favorites: FavoritesSnapshot = EMPTY_FAVORITES
let favoritesLoading: Promise<void> | null = null
const favoritesListeners = new Set<() => void>()

function emitFavorites() {
  favoritesListeners.forEach((listener) => listener())
}

// 집합을 갈아끼우고 버전을 올린다. 스냅샷 객체를 새로 만들어야 구독자가 갱신을 알아챈다.
function setFavorites(ids: Set<string>) {
  favorites = { ids, version: favorites.version + 1 }
  emitFavorites()
}

function favoritesSubscribe(listener: () => void) {
  favoritesListeners.add(listener)
  return () => favoritesListeners.delete(listener)
}

async function refreshFavorites(userId: string | null): Promise<void> {
  if (!userId) {
    setFavorites(new Set())
    return
  }
  if (favoritesLoading) return favoritesLoading
  favoritesLoading = listBookmarkedCampaignIds()
    .then((ids) => {
      setFavorites(new Set(ids))
    })
    .catch(() => {
      // 실패해도 화면을 막지 않는다. 별표 표시만 빠진다.
      // catch가 없으면 로그아웃 상태의 401이 그대로 unhandled rejection으로 터진다.
      setFavorites(new Set())
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

  const snapshot = useSyncExternalStore(
    favoritesSubscribe,
    () => favorites,
    () => EMPTY_FAVORITES,
  )
  const set = snapshot.ids

  const favoriteIds = useMemo(
    () => (user !== null ? [...set] : (EMPTY_IDS as string[])),
    [user, set],
  )

  return {
    favoriteIds,
    // 즐겨찾기 공고 목록을 서버에서 받는 화면은 이 값을 조회 deps에 넣는다.
    favoritesVersion: snapshot.version,
    isFavorite: (id: string) => user !== null && set.has(id),
    toggleFavorite: (id: string) => {
      if (!user) return
      const previous = favorites.ids
      const wasFavorite = previous.has(id)
      const next = new Set(previous)
      if (wasFavorite) next.delete(id)
      else next.add(id)
      // 별표는 즉시 뒤집고, 실패하면 되돌린다.
      setFavorites(next)

      const request = wasFavorite ? removeBookmark(id) : addBookmark(id)
      request
        .then(() => {
          // 서버에 반영된 뒤에 한 번 더 버전을 올린다. 낙관적 갱신 시점에 목록을 다시
          // 받으면 아직 반영 전인 서버 응답을 받아 방금 누른 공고가 빠질 수 있다.
          setFavorites(new Set(favorites.ids))
          showToast(
            wasFavorite ? '즐겨찾기에서 제외했습니다.' : '즐겨찾기에 추가했습니다.',
            'success',
          )
        })
        .catch(() => {
          setFavorites(new Set(previous))
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
    .catch(() => {
      recentCache = []
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
