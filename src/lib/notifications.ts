import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import type { Recruitment } from '@/types/recruitment'
import {
  EMPTY_SUBSCRIPTION,
  isSubscriptionEmpty,
  type NotificationSubscription,
} from '@/types/notification'
import { useAuth } from '@/lib/auth'
import {
  getNotificationSubscription,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  saveNotificationSubscription,
  type NotificationItem,
} from '@/lib/api/notifications'
import { showToast } from '@/lib/toast'

export type { NotificationItem } from '@/lib/api/notifications'
export {
  EMPTY_SUBSCRIPTION,
  isSubscriptionEmpty,
  type NotificationSubscription,
} from '@/types/notification'

// ---------- 구독 설정 (사용자별, 수동 저장) ----------

let subscriptionUserId: string | null = null
let subscriptionCache: NotificationSubscription = EMPTY_SUBSCRIPTION
let subscriptionLoading: Promise<void> | null = null
const subscriptionListeners = new Set<() => void>()

function emitSubscription() {
  subscriptionListeners.forEach((l) => l())
}

function subscriptionSubscribe(cb: () => void) {
  subscriptionListeners.add(cb)
  return () => {
    subscriptionListeners.delete(cb)
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
      subscriptionCache = subscription
      emitSubscription()
    })
    .catch(() => {
      subscriptionCache = EMPTY_SUBSCRIPTION
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

// ---------- 알림 큐 (사용자별) ----------
// 구독 조건에 맞는 공고가 게시되거나 즐겨찾기한 공고의 마감·발표가 임박하면
// 백엔드가 사용자별 큐에 알림을 넣는다.

const EMPTY_NOTIFICATIONS: NotificationItem[] = []

let notificationsUserId: string | null = null
let notificationsCache: NotificationItem[] = EMPTY_NOTIFICATIONS
let notificationsLoading: Promise<void> | null = null
const notificationsListeners = new Set<() => void>()

function emitNotifications() {
  notificationsListeners.forEach((l) => l())
}

function notificationsSubscribe(cb: () => void) {
  notificationsListeners.add(cb)
  return () => {
    notificationsListeners.delete(cb)
  }
}

async function refreshNotifications(userId: string | null): Promise<void> {
  if (!userId) {
    notificationsCache = EMPTY_NOTIFICATIONS
    emitNotifications()
    return
  }
  if (notificationsLoading) return notificationsLoading
  notificationsLoading = listNotifications()
    .then((items) => {
      notificationsCache = items
      emitNotifications()
    })
    .catch(() => {
      // 알림 조회 실패는 화면을 막지 않는다. 벨은 0으로 남는다.
      notificationsCache = EMPTY_NOTIFICATIONS
      emitNotifications()
    })
    .finally(() => {
      notificationsLoading = null
    })
  return notificationsLoading
}

function syncNotificationsUser(userId: string | null) {
  if (userId === notificationsUserId) return
  notificationsUserId = userId
  void refreshNotifications(userId)
}

// ---------- 헬퍼 ----------

export function subscriptionMatches(
  r: Recruitment,
  sub: NotificationSubscription,
): boolean {
  if (isSubscriptionEmpty(sub)) return false
  if (sub.types.length > 0 && !sub.types.includes(r.badgeLabel)) return false
  if (sub.categories.length > 0 && !sub.categories.includes(r.category)) return false
  if (sub.publishers.length > 0 && !sub.publishers.includes(r.publisher)) return false
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

// ---------- 훅 ----------

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
    // 낙관적으로 반영하고, 실패하면 이전 값으로 되돌린다.
    save: async (next: NotificationSubscription) => {
      if (!user) return
      const previous = subscriptionCache
      subscriptionCache = next
      emitSubscription()
      try {
        subscriptionCache = await saveNotificationSubscription(next)
        emitSubscription()
      } catch (err) {
        subscriptionCache = previous
        emitSubscription()
        showToast('알림 설정 저장에 실패했습니다.', 'error')
        throw err
      }
    },
  }
}

export function useNotifications() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  useEffect(() => {
    syncNotificationsUser(userId)
  }, [userId])

  const list = useSyncExternalStore(
    notificationsSubscribe,
    () => notificationsCache,
    () => EMPTY_NOTIFICATIONS,
  )

  const notifications = useMemo(
    () => (user !== null ? list : EMPTY_NOTIFICATIONS),
    [user, list],
  )

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.isUnread).length,
    [notifications],
  )

  const markAsRead = useCallback((id: string) => {
    const target = notificationsCache.find((n) => n.id === id)
    if (!target || !target.isUnread) return
    notificationsCache = notificationsCache.map((n) =>
      n.id === id ? { ...n, isUnread: false } : n,
    )
    emitNotifications()
    markNotificationRead(id).catch(() => undefined)
  }, [])

  const markAllAsRead = useCallback(() => {
    if (!notificationsCache.some((n) => n.isUnread)) return
    notificationsCache = notificationsCache.map((n) => ({ ...n, isUnread: false }))
    emitNotifications()
    markAllNotificationsRead().catch(() => undefined)
  }, [])

  const reload = useCallback(() => refreshNotifications(notificationsUserId), [])

  return { notifications, unreadCount, markAsRead, markAllAsRead, reload }
}
