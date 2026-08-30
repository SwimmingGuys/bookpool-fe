import { useState } from 'react'
import { Check, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Recruitment } from '@/types/recruitment'
import { useAppliedCampaigns } from '@/lib/applicationState'
import { useAuth } from '@/lib/auth'
import { formatFullDate } from '@/lib/date'

interface ApplyBarProps {
  recruitment: Recruitment
  className?: string
}

function applyLabel(recruitment: Recruitment): string {
  if (recruitment.status === 'closed' || recruitment.daysRemaining < 0) {
    return '모집이 마감되었습니다'
  }
  if (!recruitment.applyUrl) return '신청 링크가 준비 중입니다'
  return '신청하러 가기'
}

/**
 * 신청 CTA. 공고를 찾은 사람이 실제로 신청까지 갈 수 있는 유일한 출구다.
 * 신청 링크는 출판사 폼·구글폼 등 외부 페이지라 새 탭으로 연다.
 *
 * 외부로 나가면 서비스는 실제 신청 여부를 알 수 없다. 그래서 링크를 연 뒤
 * "신청했어요"를 직접 표시하게 하고, 그걸 기준으로 마이페이지에서 발표일·서평 마감을
 * 챙겨준다.
 */
export default function ApplyBar({ recruitment, className }: ApplyBarProps) {
  const { isLoggedIn } = useAuth()
  const { isApplied, toggleApplied } = useAppliedCampaigns()
  // 링크를 한 번이라도 열었으면 표시 버튼을 눈에 띄게 둔다.
  const [opened, setOpened] = useState(false)

  const isClosed = recruitment.status === 'closed' || recruitment.daysRemaining < 0
  const canApply = !isClosed && Boolean(recruitment.applyUrl)
  const label = applyLabel(recruitment)
  const applied = isApplied(recruitment.id)

  // 마감된 공고라도 이미 신청한 사람은 결과를 챙겨야 하므로 표시를 남겨 둔다.
  const showMarkButton = isLoggedIn && (canApply || applied)

  return (
    <div className={cn('rounded-2xl border border-stone-200 bg-white p-5 sm:p-6', className)}>
      <div className="sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-stone-800">
            {isClosed
              ? '모집 마감'
              : `${formatFullDate(recruitment.recruitEndDate)}까지 신청`}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            {isClosed
              ? '다음 모집을 기다려 주세요.'
              : `발표일 ${formatFullDate(recruitment.announcementDate)}`}
          </p>
        </div>

        {canApply ? (
          <a
            href={recruitment.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpened(true)}
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-orange-600 sm:mt-0 sm:w-auto"
          >
            {label}
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <span
            aria-disabled
            className="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-stone-100 px-5 py-3 text-sm font-semibold text-stone-400 sm:mt-0 sm:w-auto"
          >
            {label}
          </span>
        )}
      </div>

      {showMarkButton && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
          <button
            type="button"
            onClick={() => void toggleApplied(recruitment.id)}
            aria-pressed={applied}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
              applied
                ? 'border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100'
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50',
            )}
          >
            <Check className={cn('h-4 w-4', applied ? 'text-orange-500' : 'text-stone-400')} />
            {applied ? '신청함' : '신청했어요'}
          </button>

          <p className="text-xs text-stone-400">
            {applied
              ? '마이페이지에서 발표일과 서평 마감을 챙겨드려요.'
              : opened
                ? '신청을 마치셨다면 표시해 두세요.'
                : '표시해 두면 발표일을 놓치지 않아요.'}
          </p>
        </div>
      )}
    </div>
  )
}
