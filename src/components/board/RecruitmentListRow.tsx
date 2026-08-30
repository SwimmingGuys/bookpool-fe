import { Link } from 'react-router-dom'
import { Calendar, Star, Tag } from 'lucide-react'
import { cn } from '@/lib/cn'
import { BOOK_FORMAT_LABELS, categoryLabel } from '@/types/recruitment'
import type { Recruitment } from '@/types/recruitment'
import { useFavoriteWithAuth, useReadRecruitments } from '@/lib/recruitmentState'
import { formatFullDate } from '@/lib/date'
import Badge from '@/components/ui/Badge'

interface RecruitmentListRowProps {
  recruitment: Recruitment
}

/**
 * 전체 모집 목록의 한 줄.
 *
 * 카드 그리드와 달리 한 줄에 하나씩 쌓아, 출판사·제목·도서·모집 기간을 같은 자리에서
 * 위아래로 훑을 수 있게 한다. 공고를 여러 건 비교하는 화면이라 정보 위치가 고정돼야 한다.
 * 달력(/calendar)은 그 달만 보는 화면이라 카드를 그대로 쓴다.
 */
export default function RecruitmentListRow({ recruitment }: RecruitmentListRowProps) {
  const {
    id,
    badgeLabel,
    daysRemaining,
    title,
    bookTitle,
    publisher,
    category,
    status,
    recruitStartDate,
    recruitEndDate,
    capacity,
    bookFormat,
  } = recruitment

  const { isRead, markAsRead } = useReadRecruitments()
  const { isFavorite, toggleFavorite } = useFavoriteWithAuth()
  const read = isRead(id)
  const fav = isFavorite(id)
  const isClosed = status === 'closed' || daysRemaining < 0
  const flatTitle = title.replace(/\n/g, ' ')

  // 도서명 뒤에 모집 조건을 덧붙여 한 줄로 요약한다. 없는 값은 그냥 빠진다.
  const detail = [
    bookTitle,
    capacity ? `${capacity}명` : null,
    bookFormat ? BOOK_FORMAT_LABELS[bookFormat] : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const handleStarClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(id)
  }

  return (
    <Link
      to={`/recruitments/${id}`}
      onClick={() => markAsRead(id)}
      className={cn(
        'group flex items-center gap-4 rounded-xl border p-4 transition-all sm:gap-6 sm:p-5',
        read
          ? 'border-stone-200/70 bg-stone-50 hover:border-stone-300'
          : 'border-stone-200 bg-white hover:border-orange-200 hover:shadow-md',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-xs text-stone-500">{publisher}</p>
          {/* 좁은 화면에서는 오른쪽 분류 열이 접히므로 유형만 여기로 끌어온다. */}
          <Badge label={badgeLabel} className="shrink-0 sm:hidden" />
        </div>

        <h3
          className={cn(
            'mt-0.5 truncate text-sm transition-colors group-hover:text-orange-600 sm:text-base',
            read ? 'font-medium text-stone-500' : 'font-bold text-stone-800',
          )}
          title={flatTitle}
        >
          {flatTitle}
        </h3>

        {detail && <p className="mt-1 truncate text-xs text-stone-500">{detail}</p>}

        <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-400">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span className="tabular-nums">
            {formatFullDate(recruitStartDate)} ~ {formatFullDate(recruitEndDate)}
          </span>
        </p>
      </div>

      {/* 분류는 좁은 화면에서 접는다. 제목과 마감이 먼저다. */}
      <div className="hidden w-28 shrink-0 flex-col items-start gap-1.5 sm:flex">
        <Badge label={badgeLabel} />
        <span className="inline-flex max-w-full items-center gap-1 text-xs text-stone-500">
          <Tag className="h-3.5 w-3.5 shrink-0 text-stone-400" />
          <span className="truncate">{categoryLabel(category)}</span>
        </span>
      </div>

      <div className="w-16 shrink-0 text-right sm:w-20">
        {isClosed ? (
          <span className="text-xs font-semibold text-stone-400">마감</span>
        ) : (
          <span
            className={cn(
              'text-xs font-bold tabular-nums',
              daysRemaining <= 3 ? 'text-red-500' : 'text-stone-600',
            )}
          >
            {daysRemaining === 0 ? '오늘 마감' : `${daysRemaining}일 남음`}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleStarClick}
        aria-label={fav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        aria-pressed={fav}
        className={cn(
          'shrink-0 rounded-md p-1 transition-colors',
          fav ? 'text-amber-400 hover:text-amber-500' : 'text-stone-300 hover:text-stone-500',
        )}
      >
        <Star className={cn('h-4 w-4', fav && 'fill-amber-400')} />
      </button>
    </Link>
  )
}
