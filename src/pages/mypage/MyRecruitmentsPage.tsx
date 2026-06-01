import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import { Clock, Star } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Recruitment } from '@/types/recruitment'
import { getRecruitmentById } from '@/data/mockRecruitments'
import { useFavorites, useReadRecruitments } from '@/lib/recruitmentState'
import RecruitmentListCard from '@/components/board/RecruitmentListCard'
import EmptyState from '@/components/ui/EmptyState'
import SearchInput from '@/components/ui/SearchInput'

const PAGE_SIZE = 12

const TABS = [
  { value: 'recent', label: '최근에 본 공고', icon: Clock },
  { value: 'favorites', label: '즐겨찾기', icon: Star },
] as const
type TabValue = (typeof TABS)[number]['value']

const SORT_OPTIONS = [
  { value: 'recency', label: '최근 활동순' },
  { value: 'deadline', label: '마감 임박순' },
  { value: 'title', label: '제목순' },
] as const
type SortValue = (typeof SORT_OPTIONS)[number]['value']

function lookupRecruitments(ids: readonly string[]): Recruitment[] {
  const result: Recruitment[] = []
  for (const id of ids) {
    const r = getRecruitmentById(id)
    if (r) result.push(r)
  }
  return result
}

function matchesQuery(r: Recruitment, q: string): boolean {
  if (!q) return true
  const lower = q.toLowerCase()
  return (
    r.title.toLowerCase().includes(lower) ||
    r.bookTitle.toLowerCase().includes(lower) ||
    r.publisher.toLowerCase().includes(lower)
  )
}

function sortRecruitments(items: Recruitment[], sortBy: SortValue): Recruitment[] {
  if (sortBy === 'recency') return items
  const sorted = [...items]
  if (sortBy === 'deadline') {
    sorted.sort((a, b) => {
      const aDays = a.daysRemaining < 0 ? Infinity : a.daysRemaining
      const bDays = b.daysRemaining < 0 ? Infinity : b.daysRemaining
      return aDays - bDays
    })
  } else if (sortBy === 'title') {
    sorted.sort((a, b) => a.title.localeCompare(b.title, 'ko'))
  }
  return sorted
}

export default function MyRecruitmentsPage() {
  const { recentIds } = useReadRecruitments()
  const { favoriteIds } = useFavorites()

  const [activeTab, setActiveTab] = useState<TabValue>('recent')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortValue>('recency')
  const [limits, setLimits] = useState<Record<TabValue, number>>({
    recent: PAGE_SIZE,
    favorites: PAGE_SIZE,
  })

  const recent = useMemo(() => lookupRecruitments(recentIds), [recentIds])
  const favorites = useMemo(() => lookupRecruitments(favoriteIds), [favoriteIds])

  const totalCounts: Record<TabValue, number> = {
    recent: recent.length,
    favorites: favorites.length,
  }

  const baseItems = activeTab === 'recent' ? recent : favorites
  const filtered = useMemo(() => {
    const q = query.trim()
    const matched = q ? baseItems.filter((r) => matchesQuery(r, q)) : baseItems
    return sortRecruitments(matched, sortBy)
  }, [baseItems, query, sortBy])

  const limit = limits[activeTab]
  const visible = filtered.slice(0, limit)
  const hasMore = filtered.length > limit

  useEffect(() => {
    setLimits({ recent: PAGE_SIZE, favorites: PAGE_SIZE })
  }, [query, sortBy])

  const handleLoadMore = useCallback(() => {
    setLimits((prev) => ({ ...prev, [activeTab]: prev[activeTab] + PAGE_SIZE }))
  }, [activeTab])

  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasMore) return
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) handleLoadMore()
      },
      { rootMargin: '300px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, handleLoadMore])

  const hasFilter = query.trim().length > 0

  return (
    <div>
      <div
        role="tablist"
        aria-label="공고 관리 탭"
        className="flex items-center gap-1 border-b border-stone-200"
      >
        {TABS.map(({ value, label, icon: Icon }) => {
          const active = activeTab === value
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(value)}
              className={cn(
                'relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-colors',
                active
                  ? 'text-orange-600'
                  : 'text-stone-500 hover:text-stone-800',
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              <span
                className={cn(
                  'ml-0.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold',
                  active
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-stone-100 text-stone-500',
                )}
              >
                {totalCounts[value]}
              </span>
              {active && (
                <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      <Toolbar
        query={query}
        onQueryChange={setQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {visible.length === 0 ? (
        <EmptyForTab tab={activeTab} hasFilter={hasFilter} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visible.map((r) => (
              <RecruitmentListCard key={r.id} recruitment={r} />
            ))}
          </div>
          {hasMore && (
            <div
              ref={sentinelRef}
              aria-hidden
              className="h-10 mt-4 flex items-center justify-center text-xs text-stone-400"
            >
              불러오는 중…
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Toolbar({
  query,
  onQueryChange,
  sortBy,
  onSortChange,
}: {
  query: string
  onQueryChange: (next: string) => void
  sortBy: SortValue
  onSortChange: (next: SortValue) => void
}) {
  return (
    <div className="flex items-center gap-2 my-5">
      <SearchInput
        value={query}
        onChange={onQueryChange}
        placeholder="제목, 도서, 출판사 검색"
        className="flex-1 max-w-md"
      />

      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortValue)}
          aria-label="정렬"
          className="appearance-none rounded-lg border border-stone-200 bg-white pl-3 pr-8 py-2 text-sm font-medium text-stone-700 hover:border-stone-300 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-colors cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs"
        >
          ▾
        </span>
      </div>
    </div>
  )
}

function EmptyForTab({
  tab,
  hasFilter,
}: {
  tab: TabValue
  hasFilter: boolean
}) {
  if (hasFilter) {
    return (
      <EmptyState
        title="검색 조건에 맞는 공고가 없어요."
        description="검색어를 다시 입력해 보세요."
      />
    )
  }
  const title =
    tab === 'recent' ? '아직 본 공고가 없어요.' : '아직 즐겨찾기한 공고가 없어요.'
  return (
    <EmptyState
      title={title}
      description={
        <Link
          to="/board"
          className="text-orange-600 hover:text-orange-700 no-underline"
        >
          보드에서 공고 둘러보기
        </Link>
      }
    />
  )
}
