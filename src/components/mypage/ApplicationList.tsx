import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Megaphone, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_OPTIONS,
  type Application,
  type ApplicationStatus,
} from '@/types/application'
import {
  cancelApplication,
  changeApplicationStatus,
  listApplications,
} from '@/lib/api/applications'
import { reloadAppliedCampaigns } from '@/lib/applicationState'
import { useAuth } from '@/lib/auth'
import { useAsyncData } from '@/lib/useAsyncData'
import { AuthError } from '@/lib/api/errors'
import { showToast } from '@/lib/toast'
import { daysUntil, formatFullDate } from '@/lib/date'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import ButtonLink from '@/components/ui/ButtonLink'
import { RecruitmentGridSkeleton } from '@/components/ui/Skeleton'

const EMPTY: Application[] = []

const statusStyles: Record<ApplicationStatus, string> = {
  applied: 'bg-stone-100 text-stone-600',
  selected: 'bg-orange-50 text-orange-700',
  notSelected: 'bg-stone-100 text-stone-400',
}

/**
 * 마이페이지의 '신청한 공고'.
 *
 * 신청 자체는 외부 폼에서 이뤄져 서비스가 알 수 없다. 사용자가 남긴 표시를 기준으로
 * 발표일과 서평 제출 기한까지 남은 날짜를 챙겨준다.
 */
export default function ApplicationList() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  const { data, status, error, reload } = useAsyncData<Application[]>(
    () => (userId ? listApplications() : Promise.resolve(EMPTY)),
    EMPTY,
    [userId],
  )

  const [busyId, setBusyId] = useState<string | null>(null)

  const run = async (campaignId: string, action: () => Promise<unknown>, message: string) => {
    setBusyId(campaignId)
    try {
      await action()
      reload()
      // 상세·카드의 '신청함' 표시와 어긋나지 않도록 캐시도 맞춘다.
      void reloadAppliedCampaigns()
      showToast(message, 'success')
    } catch (err) {
      showToast(
        err instanceof AuthError ? err.message : '처리에 실패했습니다.',
        'error',
      )
    } finally {
      setBusyId(null)
    }
  }

  const handleCancel = async (application: Application) => {
    const title = application.recruitment.title.replace(/\n/g, ' ')
    if (!window.confirm(`'${title}' 신청 표시를 지울까요?`)) return
    await run(
      application.recruitment.id,
      () => cancelApplication(application.recruitment.id),
      '신청 표시를 지웠습니다.',
    )
  }

  if (status === 'loading') {
    return (
      <div className="mt-5">
        <RecruitmentGridSkeleton count={3} />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mt-5">
        <ErrorState
          title="신청한 공고를 불러오지 못했습니다."
          description={error?.message}
          onRetry={reload}
        />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="mt-5">
        <EmptyState
          title="아직 신청 표시한 공고가 없어요."
          description="공고 상세에서 신청한 뒤 '신청했어요'를 눌러 두면, 발표일과 서평 마감을 여기서 챙겨드려요."
          action={<ButtonLink to="/board">보드에서 공고 둘러보기</ButtonLink>}
        />
      </div>
    )
  }

  return (
    <ul className="mt-5 flex flex-col gap-3">
      {data.map((application) => (
        <ApplicationCard
          key={application.id}
          application={application}
          busy={busyId === application.recruitment.id}
          onChangeStatus={(next) =>
            run(
              application.recruitment.id,
              () => changeApplicationStatus(application.recruitment.id, next),
              `'${APPLICATION_STATUS_LABELS[next]}'으로 바꿨습니다.`,
            )
          }
          onCancel={() => handleCancel(application)}
        />
      ))}
    </ul>
  )
}

function ApplicationCard({
  application,
  busy,
  onChangeStatus,
  onCancel,
}: {
  application: Application
  busy: boolean
  onChangeStatus: (status: ApplicationStatus) => void
  onCancel: () => void
}) {
  const { recruitment, status } = application
  const plainTitle = recruitment.title.replace(/\n/g, ' ')

  return (
    <li className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge label={recruitment.badgeLabel} />
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-semibold',
            statusStyles[status],
          )}
        >
          {APPLICATION_STATUS_LABELS[status]}
        </span>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          aria-label="신청 표시 지우기"
          className="ml-auto rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <Link
        to={`/recruitments/${recruitment.id}`}
        className="mt-2 block truncate text-sm font-bold text-stone-800 no-underline hover:text-orange-600"
      >
        {plainTitle}
      </Link>
      <p className="mt-1 truncate text-xs text-stone-500">
        {recruitment.publisher} · {recruitment.bookTitle}
      </p>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-stone-100 pt-3">
        <DateChip
          icon={<Megaphone className="h-3.5 w-3.5" />}
          label="발표"
          date={recruitment.announcementDate}
          // 결과가 이미 정해졌으면 D-day를 강조하지 않는다.
          muted={status !== 'applied'}
        />
        {recruitment.reviewDueDate && (
          <DateChip
            icon={<CalendarClock className="h-3.5 w-3.5" />}
            label="서평 마감"
            date={recruitment.reviewDueDate}
            // 당첨된 사람에게만 서평 마감이 의미 있다.
            muted={status !== 'selected'}
          />
        )}
      </div>

      {/* 발표 결과는 서비스가 알 수 없어 사용자가 직접 고른다. */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-stone-400">결과</span>
        {APPLICATION_STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChangeStatus(option.value)}
            disabled={busy || option.value === status}
            aria-pressed={option.value === status}
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-default',
              option.value === status
                ? 'border-orange-300 bg-orange-50 text-orange-700'
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </li>
  )
}

function DateChip({
  icon,
  label,
  date,
  muted,
}: {
  icon: React.ReactNode
  label: string
  date: string
  muted?: boolean
}) {
  const remaining = daysUntil(date)
  const passed = remaining < 0

  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className="text-stone-400">{icon}</span>
      <span className="text-stone-500">{label}</span>
      <span className="font-medium text-stone-700 tabular-nums">
        {formatFullDate(date)}
      </span>
      {!passed && (
        <span
          className={cn(
            'font-bold tabular-nums',
            muted
              ? 'text-stone-400'
              : remaining <= 3
                ? 'text-red-500'
                : 'text-orange-500',
          )}
        >
          {remaining === 0 ? 'D-DAY' : `D-${remaining}`}
        </span>
      )}
    </span>
  )
}
