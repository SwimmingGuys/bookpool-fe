import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Recruitment } from '@/types/recruitment'
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
 */
export default function ApplyBar({ recruitment, className }: ApplyBarProps) {
  const isClosed = recruitment.status === 'closed' || recruitment.daysRemaining < 0
  const canApply = !isClosed && Boolean(recruitment.applyUrl)
  const label = applyLabel(recruitment)

  return (
    <div
      className={cn(
        'rounded-2xl border border-stone-200 bg-white p-5 sm:flex sm:items-center sm:justify-between sm:gap-4',
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-stone-800">
          {isClosed ? '모집 마감' : `${formatFullDate(recruitment.recruitEndDate)}까지 신청`}
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
  )
}
