import { useEffect, useMemo, useSyncExternalStore } from 'react'
import type { Recruitment, RecruitmentType } from '@/types/recruitment'
import { useAuth } from '@/lib/auth'
import {
  getNotificationSubscription,
  saveNotificationSubscription,
} from '@/lib/api/notifications'

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
let subscriptionLoading: Promise<void> | null = null
const subscriptionListeners = new Set<() => void>()

function emitSubscription() {
  subscriptionListeners.forEach((l) => l())
}

function normalizeSubscription(value: NotificationSubscription): NotificationSubscription {
  return {
    types: value.types.filter(isRecruitmentType),
    categories: value.categories.filter((item): item is string => typeof item === 'string'),
    publishers: value.publishers.filter((item): item is string => typeof item === 'string'),
  }
}

async function refreshSubscription(userId: string | null): Promise<void> {
  if (!userId) {
    subscriptionCache = EMPTY_SUBSCRIPTION
    emitSubscription()
    return
  }
  if (subscriptionLoading) return subscriptionLoading
  subscriptionLoading = getNotificationSubscription()
    .then((subscription) => {
      subscriptionCache = normalizeSubscription(subscription)
      emitSubscription()
    })
    .finally(() => {
      subscriptionLoading = null
    })
  return subscriptionLoading
}

function syncSubscriptionUser(userId: string | null) {
  if (userId === subscriptionUserId) return
  subscriptionUserId = userId
  void refreshSubscription(userId)
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
      emitSubscription()
      saveNotificationSubscription(next).catch(() => undefined)
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
