import { Link } from 'react-router-dom'
import { Bell, BellOff } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Recruitment } from '@/types/recruitment'
import { RECRUITMENT_TYPE_LABELS } from '@/types/recruitment'
import { useNotifications, type Notification } from '@/lib/notifications'
import { useNotificationSubscriptions } from '@/lib/notifications'
import { TODAY_DATE } from '@/lib/date'
import EmptyState from '@/components/ui/EmptyState'

function formatRelativeTime(iso: string): string {
  const past = new Date(iso)
  const diffMs = TODAY_DATE.getTime() - past.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffDays < 0) return iso.slice(5).replace('-', '.')
  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '어제'
  if (diffDays < 7) return `${diffDays}일 전`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`
  return `${Math.floor(diffDays / 30)}달 전`
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllAsRead, markAsRead } =
    useNotifications()
  const { subscription } = useNotificationSubscriptions()

  const hasSubscription =
    subscription.types.length +
      subscription.categories.length +
      subscription.publishers.length >
    0

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 ring-1 ring-orange-100">
            <Bell className="w-6 h-6" strokeWidth={2.25} />
          </div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">
            알림
            {unreadCount > 0 && (
              <span className="ml-2 text-orange-500 tabular-nums">
                {unreadCount}
              </span>
            )}
          </h1>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-xs font-medium text-stone-500 hover:text-orange-600 underline-offset-2 hover:underline"
          >
            모두 읽음으로 표시
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <NotificationsEmpty hasSubscription={hasSubscription} />
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <NotificationCard
              key={n.recruitment.id}
              notification={n}
              onOpen={() => markAsRead(n.recruitment.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationCard({
  notification,
  onOpen,
}: {
  notification: Notification
  onOpen: () => void
}) {
  const { recruitment, isUnread } = notification
  return (
    <Link
      to={`/recruitments/${recruitment.id}`}
      onClick={onOpen}
      className={cn(
        'group relative block rounded-xl border p-4 transition-all no-underline',
        isUnread
          ? 'border-orange-200 bg-orange-50/50 hover:bg-orange-50'
          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50',
      )}
    >
      {isUnread && (
        <span
          aria-hidden
          className="absolute top-5 left-2.5 w-1.5 h-1.5 rounded-full bg-orange-500"
        />
      )}
      <div className={cn('flex flex-col gap-1', isUnread && 'pl-3')}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span
              className={cn(
                'font-semibold',
                recruitment.badgeLabel === 'Reviewer'
                  ? 'text-orange-600'
                  : 'text-stone-700',
              )}
            >
              {RECRUITMENT_TYPE_LABELS[recruitment.badgeLabel]}
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-stone-500">{recruitment.category}</span>
            <span className="text-stone-300">·</span>
            <span className="text-stone-500">{recruitment.publisher}</span>
          </div>
          <span className="text-[11px] text-stone-400 shrink-0 tabular-nums">
            {formatRelativeTime(recruitment.recruitStartDate)}
          </span>
        </div>

        <p
          className={cn(
            'text-sm leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors',
            isUnread ? 'font-bold text-stone-800' : 'font-medium text-stone-700',
          )}
        >
          {recruitment.bookTitle}
        </p>

        <DDayLine recruitment={recruitment} />
      </div>
    </Link>
  )
}

function DDayLine({ recruitment }: { recruitment: Recruitment }) {
  if (recruitment.status === 'closed') {
    return <p className="text-[11px] text-stone-400">모집 마감</p>
  }
  const urgent = recruitment.daysRemaining <= 3
  return (
    <p
      className={cn(
        'text-[11px] font-medium',
        urgent ? 'text-red-500' : 'text-stone-500',
      )}
    >
      D-{recruitment.daysRemaining} 마감
    </p>
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
            className="text-orange-600 hover:text-orange-700 no-underline"
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
