import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Recruitment } from '@/types/recruitment'
import {
  useFavoriteWithAuth,
  useReadRecruitments,
} from '@/lib/recruitmentState'
import { formatMonthDay, getWeekdayKo } from '@/lib/date'
import Badge from '@/components/ui/Badge'
import DDay from '@/components/ui/DDay'

interface RecruitmentListCardProps {
  recruitment: Recruitment
}

function formatViewCount(count: number): string {
  if (count >= 10000) return `${(count / 1000).toFixed(0)}k`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return String(count)
}

export default function RecruitmentListCard({ recruitment }: RecruitmentListCardProps) {
  const {
    id,
    badgeLabel,
    daysRemaining,
    title,
    publisher,
    category,
    viewCount,
    status,
    recruitEndDate,
  } = recruitment

  const { isRead, markAsRead } = useReadRecruitments()
  const { isFavorite, toggleFavorite } = useFavoriteWithAuth()
  const read = isRead(id)
  const fav = isFavorite(id)
  const isClosed = status === 'closed'
  const flatTitle = title.replace(/\n/g, ' ')

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
        'group relative block rounded-xl border p-4 transition-all',
        read
          ? 'border-stone-200/70 bg-stone-50 hover:bg-stone-50/70 hover:border-stone-300'
          : 'border-stone-200 bg-white hover:shadow-md hover:border-orange-200',
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Badge label={badgeLabel} />
          {isClosed ? (
            <span className="text-xs font-semibold text-stone-400">마감</span>
          ) : (
            <DDay daysRemaining={daysRemaining} />
          )}
        </div>
        <button
          type="button"
          onClick={handleStarClick}
          aria-label={fav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          aria-pressed={fav}
          className={cn(
            'shrink-0 p-1 rounded-md transition-colors',
            fav
              ? 'text-amber-400 hover:text-amber-500'
              : 'text-stone-300 hover:text-stone-500',
          )}
        >
          <Star className={cn('w-4 h-4', fav && 'fill-amber-400')} />
        </button>
      </div>

      <h3
        className={cn(
          'text-sm leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors',
          read ? 'font-medium text-stone-500' : 'font-bold text-stone-800',
        )}
        title={flatTitle}
      >
        {flatTitle}
      </h3>

      <p className="text-xs text-stone-500 mt-2 truncate">
        {publisher} · {category}
      </p>

      <div className="mt-3 pt-3 border-t border-stone-100 flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-stone-700 tabular-nums leading-none">
            {formatMonthDay(recruitEndDate)}
          </span>
          <span className="text-xs text-stone-400">
            ({getWeekdayKo(recruitEndDate)}) 마감
          </span>
        </div>
        <span className="text-xs text-stone-300 tabular-nums shrink-0">
          조회 {formatViewCount(viewCount)}
        </span>
      </div>
    </Link>
  )
}
