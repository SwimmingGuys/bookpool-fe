import { useEffect, useMemo, useSyncExternalStore } from 'react'
import type { Recruitment, RecruitmentType } from '@/types/recruitment'
import { useAuth } from '@/lib/auth'

export interface NotificationSubscription {
  types: RecruitmentType[]
  categories: string[]
  publishers: string[]
}

export interface Notification {
  recruitment: Recruitment
  isUnread: boolean
}

export const EMPTY_SUBSCRIPTION: NotificationSubscription = {
  types: [],
  categories: [],
  publishers: [],
}

const EMPTY_NOTIFICATIONS: readonly Notification[] = []

function isRecruitmentType(value: unknown): value is RecruitmentType {
  return value === 'Reviewer' || value === 'Beta Reader'
}

// ---------- Subscription store (per-user, manual save) ----------

let subscriptionUserId: string | null = null
let subscriptionCache: NotificationSubscription = EMPTY_SUBSCRIPTION
const subscriptionListeners = new Set<() => void>()

function subscriptionKey(userId: string | null): string | null {
  return userId ? `bookpool:notifications:${userId}` : null
}

function loadSubscription(userId: string | null): NotificationSubscription {
  const key = subscriptionKey(userId)
  if (!key || typeof window === 'undefined')
    return { types: [], categories: [], publishers: [] }
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return { types: [], categories: [], publishers: [] }
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) {
      return { types: [], categories: [], publishers: [] }
    }
    const obj = parsed as Record<string, unknown>
    return {
      types: Array.isArray(obj.types) ? obj.types.filter(isRecruitmentType) : [],
      categories: Array.isArray(obj.categories)
        ? obj.categories.filter((c): c is string => typeof c === 'string')
        : [],
      publishers: Array.isArray(obj.publishers)
        ? obj.publishers.filter((p): p is string => typeof p === 'string')
        : [],
    }
  } catch {
    return { types: [], categories: [], publishers: [] }
  }
}

function persistSubscription() {
  const key = subscriptionKey(subscriptionUserId)
  if (!key || typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(subscriptionCache))
  } catch {
    // ignore
  }
}

function emitSubscription() {
  subscriptionListeners.forEach((l) => l())
}

function syncSubscriptionUser(userId: string | null) {
  if (userId === subscriptionUserId) return
  subscriptionUserId = userId
  subscriptionCache = loadSubscription(userId)
  emitSubscription()
}

function subscriptionSubscribe(cb: () => void) {
  subscriptionListeners.add(cb)
  return () => {
    subscriptionListeners.delete(cb)
  }
}

// ---------- Helpers ----------

export function subscriptionMatches(
  r: Recruitment,
  sub: NotificationSubscription,
): boolean {
  const hasAny =
    sub.types.length + sub.categories.length + sub.publishers.length > 0
  if (!hasAny) return false

  if (sub.types.length > 0 && !sub.types.includes(r.badgeLabel)) return false
  if (sub.categories.length > 0 && !sub.categories.includes(r.category)) {
    return false
  }
  if (sub.publishers.length > 0 && !sub.publishers.includes(r.publisher)) {
    return false
  }
  return true
}

function arraysEqualAsSets<T>(a: readonly T[], b: readonly T[]): boolean {
  if (a.length !== b.length) return false
  const setA = new Set(a)
  for (const v of b) if (!setA.has(v)) return false
  return true
}

export function subscriptionsEqual(
  a: NotificationSubscription,
  b: NotificationSubscription,
): boolean {
  return (
    arraysEqualAsSets(a.types, b.types) &&
    arraysEqualAsSets(a.categories, b.categories) &&
    arraysEqualAsSets(a.publishers, b.publishers)
  )
}

// ---------- Hooks ----------

export function useNotificationSubscriptions() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  useEffect(() => {
    syncSubscriptionUser(userId)
  }, [userId])

  const data = useSyncExternalStore(
    subscriptionSubscribe,
    () => subscriptionCache,
    () => EMPTY_SUBSCRIPTION,
  )

  const subscription = useMemo(
    () => (user !== null ? data : EMPTY_SUBSCRIPTION),
    [user, data],
  )

  return {
    subscription,
    save: (next: NotificationSubscription) => {
      if (!user) return
      subscriptionCache = next
      persistSubscription()
      emitSubscription()
    },
  }
}

// Notifications are populated by backend events when a new matching
// recruitment is published. For the current mock there is no admin /
// publishing flow, so this returns an empty queue. The hook shape stays
// stable so the page / header bell don't need to change once a real backend
// pushes notifications into a per-user queue.
export function useNotifications() {
  return {
    notifications: EMPTY_NOTIFICATIONS,
    unreadCount: 0,
    markAsRead: (_id: string) => {},
    markAllAsRead: () => {},
  }
}
