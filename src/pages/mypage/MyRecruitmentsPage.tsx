import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ExternalLink, MessageSquareQuote, Star } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Recruitment } from '@/types/recruitment'
import { REVIEW_CHANNEL_LABELS } from '@/types/recruitment'
import {
  REVIEW_SUBMISSION_STATUS_LABELS,
  type Review,
  type ReviewSubmissionStatus,
} from '@/types/review'
import { useAuth } from '@/lib/auth'
import {
  listBookmarkedCampaigns,
  listRecentCampaigns,
} from '@/lib/api/campaigns'
import { useRecruitmentsByLoader } from '@/lib/recruitmentsSource'
import { useMyReviews } from '@/lib/reviews'
import { formatRelativeTime } from '@/lib/date'
import RecruitmentListCard from '@/components/board/RecruitmentListCard'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import SearchInput from '@/components/ui/SearchInput'
import StarRating from '@/components/ui/StarRating'
import { RecruitmentGridSkeleton } from '@/components/ui/Skeleton'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

const PAGE_SIZE = 12

const TABS = [
  { value: 'recent', label: '최근에 본 공고', icon: Clock },
  { value: 'favorites', label: '즐겨찾기', icon: Star },
  { value: 'reviews', label: '내 서평', icon: MessageSquareQuote },
] as const
type TabValue = (typeof TABS)[number]['value']

const SORT_OPTIONS = [
  { value: 'recency', label: '최근 활동순' },
  { value: 'deadline', label: '마감 임박순' },
  { value: 'title', label: '제목순' },
] as const
type SortValue = (typeof SORT_OPTIONS)[number]['value']

const submissionStatusStyles: Record<ReviewSubmissionStatus, string> = {
  submitted: 'bg-stone-100 text-stone-600',
  approved: 'bg-orange-50 text-orange-700',
  rejected: 'bg-red-50 text-red-600',
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
  useDocumentTitle('공고 관리')
  const { user } = useAuth()
  const userId = user?.id ?? null

  // ID만 들고 공고를 찾는 대신 서버 목록 엔드포인트를 그대로 쓴다.
  const recent = useRecruitmentsByLoader(
    () => (userId ? listRecentCampaigns() : Promise.resolve([])),
    [userId],
  )
  const favorites = useRecruitmentsByLoader(
    () => (userId ? listBookmarkedCampaigns() : Promise.resolve([])),
    [userId],
  )
  const myReviews = useMyReviews()

  const [activeTab, setActiveTab] = useState<TabValue>('recent')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortValue>('recency')
  const [limits, setLimits] = useState<Record<TabValue, number>>({
    recent: PAGE_SIZE,
    favorites: PAGE_SIZE,
    reviews: PAGE_SIZE,
  })

  const totalCounts: Record<TabValue, number> = {
    recent: recent.recruitments.length,
    favorites: favorites.recruitments.length,
    reviews: myReviews.reviews.length,
  }

  const active =
    activeTab === 'recent' ? recent : activeTab === 'favorites' ? favorites : null

  const activeRecruitments = active?.recruitments
  const filtered = useMemo(() => {
    const baseItems = activeRecruitments ?? []
    const q = query.trim()
    const matched = q ? baseItems.filter((r) => matchesQuery(r, q)) : baseItems
    return sortRecruitments(matched, sortBy)
  }, [activeRecruitments, query, sortBy])

  const limit = limits[activeTab]
  const visible = filtered.slice(0, limit)
  const hasMore = activeTab !== 'reviews' && filtered.length > limit

  // 검색어·정렬이 바뀌면 페이지 한도를 초기화한다. effect 대신 렌더 중
  // 이전 값과 비교해 처리한다.
  const resetKey = `${query} ${sortBy}`
  const [prevResetKey, setPrevResetKey] = useState(resetKey)
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey)
    setLimits({ recent: PAGE_SIZE, favorites: PAGE_SIZE, reviews: PAGE_SIZE })
  }

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
        className="-mx-4 flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-stone-200 px-4 sm:mx-0 sm:px-0"
      >
        {TABS.map(({ value, label, icon: Icon }) => {
          const isActive = activeTab === value
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(value)}
              className={cn(
                'relative flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm font-semibold transition-colors sm:px-4',
                isActive ? 'text-orange-600' : 'text-stone-500 hover:text-stone-800',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              <span
                className={cn(
                  'ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold',
                  isActive
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-stone-100 text-stone-500',
                )}
              >
                {totalCounts[value]}
              </span>
              {isActive && (
                <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-orange-500" />
              )}
            </button>
          )
        })}
      </div>

      {activeTab === 'reviews' ? (
        <MyReviewsTab
          reviews={myReviews.reviews}
          status={myReviews.status}
          onRetry={myReviews.reload}
        />
      ) : (
        <>
          <Toolbar
            query={query}
            onQueryChange={setQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {active?.status === 'loading' ? (
            <RecruitmentGridSkeleton />
          ) : visible.length === 0 ? (
            <EmptyForTab tab={activeTab} hasFilter={hasFilter} />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((r) => (
                  <RecruitmentListCard key={r.id} recruitment={r} />
                ))}
              </div>
              {hasMore && (
                <div
                  ref={sentinelRef}
                  aria-hidden
                  className="mt-4 flex h-10 items-center justify-center text-xs text-stone-400"
                >
                  불러오는 중…
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

function MyReviewsTab({
  reviews,
  status,
  onRetry,
}: {
  reviews: Review[]
  status: 'loading' | 'success' | 'error'
  onRetry: () => void
}) {
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
        <ErrorState title="서평을 불러오지 못했습니다." onRetry={onRetry} />
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="mt-5">
        <EmptyState
          title="아직 제출한 서평이 없어요."
          description={
            <Link
              to="/board"
              className="text-orange-600 no-underline hover:text-orange-700"
            >
              참여한 모집에서 서평을 남겨보세요
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <ul className="mt-5 flex flex-col gap-3">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="rounded-xl border border-stone-200 bg-white p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <StarRating value={review.rating} />
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-semibold',
                submissionStatusStyles[review.submissionStatus],
              )}
            >
              {REVIEW_SUBMISSION_STATUS_LABELS[review.submissionStatus]}
            </span>
            <span className="ml-auto text-xs text-stone-400">
              {formatRelativeTime(review.createdAt)}
            </span>
          </div>

          {review.recruitmentTitle && (
            <Link
              to={`/recruitments/${review.recruitmentId}`}
              className="mt-2 block truncate text-sm font-bold text-stone-800 no-underline hover:text-orange-600"
            >
              {review.recruitmentTitle.replace(/\n/g, ' ')}
            </Link>
          )}

          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-stone-600">
            {review.content}
          </p>

          {review.rejectReason && (
            <p className="mt-2 text-xs text-red-500">
              반려 사유: {review.rejectReason}
            </p>
          )}

          {review.url && (
            <a
              href={review.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-stone-500 no-underline hover:text-orange-600"
            >
              {review.channel ? REVIEW_CHANNEL_LABELS[review.channel] : '원문'}에서 보기
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </li>
      ))}
    </ul>
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
    <div className="my-5 flex flex-col gap-2 sm:flex-row sm:items-center">
      <SearchInput
        value={query}
        onChange={onQueryChange}
        placeholder="제목, 도서, 출판사 검색"
        className="flex-1 sm:max-w-md"
      />

      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortValue)}
          aria-label="정렬"
          className="cursor-pointer appearance-none rounded-lg border border-stone-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-stone-700 transition-colors hover:border-stone-300 focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400"
        >
          ▾
        </span>
      </div>
    </div>
  )
}

function EmptyForTab({ tab, hasFilter }: { tab: TabValue; hasFilter: boolean }) {
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
          className="text-orange-600 no-underline hover:text-orange-700"
        >
          보드에서 공고 둘러보기
        </Link>
      }
    />
  )
}
