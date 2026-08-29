import { apiRequest, ENDPOINTS, type PageResponse } from '@/lib/api/client'
import type { NotificationSubscription } from '@/types/notification'
import type { RecruitmentType } from '@/types/recruitment'

// ---------- 구독 설정 ----------

interface SubscriptionResponse {
  types?: string[] | null
  categories?: string[] | null
  publishers?: string[] | null
}

const TYPE_FROM_API: Record<string, RecruitmentType> = {
  REVIEWER: 'Reviewer',
  BETA_READER: 'Beta Reader',
}

const TYPE_TO_API: Record<RecruitmentType, string> = {
  Reviewer: 'REVIEWER',
  'Beta Reader': 'BETA_READER',
}

function toSubscription(response: SubscriptionResponse): NotificationSubscription {
  return {
    types: (response.types ?? [])
      .map((t) => TYPE_FROM_API[t] ?? (t as RecruitmentType))
      .filter((t): t is RecruitmentType => t === 'Reviewer' || t === 'Beta Reader'),
    categories: (response.categories ?? []).filter(
      (c): c is string => typeof c === 'string',
    ),
    publishers: (response.publishers ?? []).filter(
      (p): p is string => typeof p === 'string',
    ),
  }
}

export async function getNotificationSubscription(): Promise<NotificationSubscription> {
  return toSubscription(
    await apiRequest<SubscriptionResponse>(ENDPOINTS.notificationSubscription),
  )
}

export async function saveNotificationSubscription(
  subscription: NotificationSubscription,
): Promise<NotificationSubscription> {
  return toSubscription(
    await apiRequest<SubscriptionResponse>(ENDPOINTS.notificationSubscription, {
      method: 'PUT',
      body: {
        types: subscription.types.map((t) => TYPE_TO_API[t]),
        categories: subscription.categories,
        publishers: subscription.publishers,
      },
    }),
  )
}

// ---------- 알림 큐 ----------
// 구독 조건에 맞는 공고가 게시되거나, 즐겨찾기한 공고의 마감·발표가 임박하면
// 백엔드가 사용자별 큐에 알림을 넣는다.

interface NotificationResponse {
  id: string | number
  kind?: string | null
  campaignId?: string | number | null
  campaignTitle?: string | null
  bookTitle?: string | null
  publisherName?: string | null
  message?: string | null
  isRead?: boolean | null
  read?: boolean | null
  createdAt: string
}

export type NotificationKind =
  | 'new_recruitment'
  | 'deadline_soon'
  | 'announcement'
  | 'etc'

const KIND_FROM_API: Record<string, NotificationKind> = {
  NEW_RECRUITMENT: 'new_recruitment',
  DEADLINE_SOON: 'deadline_soon',
  ANNOUNCEMENT: 'announcement',
}

export interface NotificationItem {
  id: string
  kind: NotificationKind
  campaignId?: string
  campaignTitle: string
  bookTitle?: string
  publisher?: string
  message?: string
  isUnread: boolean
  createdAt: string
}

function toNotification(response: NotificationResponse): NotificationItem {
  const isRead = response.isRead ?? response.read ?? false
  return {
    id: String(response.id),
    kind: (response.kind ? KIND_FROM_API[response.kind] : undefined) ?? 'etc',
    campaignId:
      response.campaignId === null || response.campaignId === undefined
        ? undefined
        : String(response.campaignId),
    campaignTitle: response.campaignTitle ?? '',
    bookTitle: response.bookTitle ?? undefined,
    publisher: response.publisherName ?? undefined,
    message: response.message ?? undefined,
    isUnread: !isRead,
    createdAt: response.createdAt,
  }
}

export async function listNotifications(): Promise<NotificationItem[]> {
  const page = await apiRequest<PageResponse<NotificationResponse>>(
    ENDPOINTS.notifications,
    { query: { page: 0, size: 50 } },
  )
  return page.content.map(toNotification)
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiRequest<void>(`${ENDPOINTS.notifications}/${id}/read`, { method: 'POST' })
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiRequest<void>(`${ENDPOINTS.notifications}/read-all`, { method: 'POST' })
}
