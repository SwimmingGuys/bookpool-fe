import { Star } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/lib/auth'
import type { RecruitmentFilter } from '@/lib/recruitmentFilter'
import FilterPanel from '@/components/board/FilterPanel'
import BoardSearchBar from '@/components/board/BoardSearchBar'

interface BoardToolbarProps {
  filter: RecruitmentFilter
  onChangeFilter: (filter: RecruitmentFilter) => void
  urlQuery: string
  onCommitQuery: (query: string) => void
  favoritesOnly: boolean
  onToggleFavoritesOnly: () => void
  className?: string
}

/**
 * 모집 달력과 전체 모집 목록이 함께 쓰는 조건 줄.
 * 두 화면의 조건 UI가 어긋나지 않도록 한 컴포넌트로 둔다.
 */
export default function BoardToolbar({
  filter,
  onChangeFilter,
  urlQuery,
  onCommitQuery,
  favoritesOnly,
  onToggleFavoritesOnly,
  className,
}: BoardToolbarProps) {
  const { isLoggedIn } = useAuth()

  return (
    <div className={cn('flex flex-wrap items-start gap-3', className)}>
      <BoardSearchBar
        committedQuery={urlQuery}
        onCommit={onCommitQuery}
        className="w-full sm:flex-1 sm:min-w-[300px] sm:max-w-[440px]"
      />

      <div className="mt-0.5 hidden h-9 w-px bg-stone-200 sm:block" />

      <FilterPanel filter={filter} onChange={onChangeFilter} />

      {isLoggedIn && (
        <button
          type="button"
          onClick={onToggleFavoritesOnly}
          aria-pressed={favoritesOnly}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
            favoritesOnly
              ? 'border-amber-300 bg-amber-50 text-amber-700'
              : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50',
          )}
        >
          <Star className={cn('h-3.5 w-3.5', favoritesOnly && 'fill-amber-400')} />
          즐겨찾기만
        </button>
      )}
    </div>
  )
}
