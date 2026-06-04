import { useEffect, useSyncExternalStore } from 'react'
import { useAuth } from '@/lib/auth'

// 로그인한 사용자별 공지 읽음 상태(Set). 즐겨찾기 스토어와 동일한
// 사용자별 모듈 스토어 패턴을 따른다. (bookpool:notice-read:${userId})
const EMPTY_READ: ReadonlySet<string> = new Set()

function loadIds(key: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === 'string')
      : []
  } catch {
    return []
  }
}

function saveIds(key: string, ids: string[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(ids))
  } catch {
    // ignore quota
  }
}

let readUserId: string | null = null
let readCache: Set<string> = new Set()
const readListeners = new Set<() => void>()

function readKey(userId: string | null): string | null {
  return userId ? `bookpool:notice-read:${userId}` : null
}

function loadRead(userId: string | null): Set<string> {
  const key = readKey(userId)
  if (!key) return new Set()
  return new Set(loadIds(key))
}

function persistRead() {
  const key = readKey(readUserId)
  if (!key) return
  saveIds(key, [...readCache])
}

function emitRead() {
  readListeners.forEach((l) => l())
}

function syncReadUser(userId: string | null) {
  if (userId === readUserId) return
  readUserId = userId
  readCache = loadRead(userId)
  emitRead()
}

function readSubscribe(cb: () => void) {
  readListeners.add(cb)
  return () => {
    readListeners.delete(cb)
  }
}

export function useNoticeReadState() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  useEffect(() => {
    syncReadUser(userId)
  }, [userId])

  const set = useSyncExternalStore(
    readSubscribe,
    () => readCache,
    () => EMPTY_READ as Set<string>,
  )

  return {
    isRead: (id: string) => user !== null && set.has(id),
    markAsRead: (id: string) => {
      if (!user) return
      if (readCache.has(id)) return
      const next = new Set(readCache)
      next.add(id)
      readCache = next
      persistRead()
      emitRead()
    },
  }
}
