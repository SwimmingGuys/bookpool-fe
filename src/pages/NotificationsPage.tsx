import { Link } from 'react-router-dom'
import { Bell, BellOff } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  isSubscriptionEmpty,
  useNotifications,
  useNotificationSubscriptions,
  type NotificationItem,
} from '@/lib/notifications'
import type { NotificationKind } from '@/lib/api/notifications'
import { formatRelativeTime } from '@/lib/date'
import EmptyState from '@/components/ui/EmptyState'
import PageContainer from '@/components/layout/PageContainer'
import PageHeader from '@/components/layout/PageHeader'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

const KIND_LABELS: Record<NotificationKind, string> = {
  new_recruitment: '새 모집',
  deadline_soon: '마감 임박',
  announcement: '발표',
  etc: '알림',
}

const kindStyles: Record<NotificationKind, string> = {
  new_recruitment: 'text-orange-600',
  deadline_soon: 'text-red-500',
  announcement: 'text-stone-700',
  etc: 'text-stone-500',
}

export default function NotificationsPage() {
  useDocumentTitle('알림')
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications()
  const { subscription } = useNotificationSubscriptions()

  const hasSubscription = !isSubscriptionEmpty(subscription)

  return (
    <PageContainer width="narrow">
      <PageHeader
        title="알림"
        description={
          unreadCount > 0 ? (
            <>
              읽지 않은 알림{' '}
              <span className="font-semibold text-orange-500 tabular-nums">
                {unreadCount}
              </span>
              개
            </>
          ) : (
            '구독한 조건에 맞는 새 공고를 여기에서 알려드려요.'
          )
        }
        actions={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-xs font-medium text-stone-500 underline-offset-2 hover:text-orange-600 hover:underline"
            >
              모두 읽음으로 표시
            </button>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <NotificationsEmpty hasSubscription={hasSubscription} />
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onOpen={() => markAsRead(n.id)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  )
}

function NotificationCard({
  notification,
  onOpen,
}: {
  notification: NotificationItem
  onOpen: () => void
}) {
  const { isUnread, kind, campaignId, campaignTitle, bookTitle, publisher, message } =
    notification

  const body = (
    <div className={cn('flex flex-col gap-1', isUnread && 'pl-3')}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className={cn('font-semibold', kindStyles[kind])}>
            {KIND_LABELS[kind]}
          </span>
          {publisher && (
            <>
              <span className="text-stone-300">·</span>
              <span className="text-stone-500">{publisher}</span>
            </>
          )}
        </div>
        <span className="shrink-0 text-xs text-stone-400 tabular-nums">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </div>

      <p
        className={cn(
          'line-clamp-2 text-sm leading-snug transition-colors group-hover:text-orange-600',
          isUnread ? 'font-bold text-stone-800' : 'font-medium text-stone-700',
        )}
      >
        {bookTitle || campaignTitle.replace(/\n/g, ' ')}
      </p>

      {message && <p className="text-xs text-stone-500">{message}</p>}
    </div>
  )

  const className = cn(
    'group relative block rounded-xl border p-4 transition-all no-underline',
    isUnread
      ? 'border-orange-200 bg-orange-50/50 hover:bg-orange-50'
      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50',
  )

  const unreadDot = isUnread && (
    <span
      aria-hidden
      className="absolute left-2.5 top-5 h-1.5 w-1.5 rounded-full bg-orange-500"
    />
  )

  // 공고와 연결되지 않은 알림(공지 등)은 링크로 감싸지 않는다.
  if (!campaignId) {
    return (
      <div className={className}>
        {unreadDot}
        {body}
      </div>
    )
  }

  return (
    <Link to={`/recruitments/${campaignId}`} onClick={onOpen} className={className}>
      {unreadDot}
      {body}
    </Link>
  )
}

function NotificationsEmpty({ hasSubscription }: { hasSubscription: boolean }) {
  if (!hasSubscription) {
    return (
      <EmptyState
        icon={BellOff}
        title="아직 구독한 알림 조건이 없어요."
        description={
          <Link
            to="/mypage/notifications"
            className="text-orange-600 no-underline hover:text-orange-700"
          >
            알림 설정에서 구독 조건 추가하기
          </Link>
        }
      />
    )
  }
  return (
    <EmptyState
      icon={Bell}
      title="아직 받은 알림이 없어요."
      description={
        <>
          저장한 조건과 일치하는 새 공고가 올라오면
          <br />이 페이지에 알림이 표시됩니다.
        </>
      }
    />
  )
}
