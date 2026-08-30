import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Megaphone, Pin } from 'lucide-react'
import { cn } from '@/lib/cn'
import { NOTICE_CATEGORY_OPTIONS, type Notice, type NoticeCategory } from '@/types/notice'
import { listNotices } from '@/lib/api/notices'
import { formatFullDate } from '@/lib/date'
import Chip from '@/components/ui/Chip'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import NoticeCategoryBadge from '@/components/notice/NoticeCategoryBadge'
import PageContainer from '@/components/layout/PageContainer'
import { useNoticeReadState } from '@/lib/noticeReadState'
import { useAsyncData } from '@/lib/useAsyncData'
import { usePageMeta } from '@/lib/useDocumentTitle'

const PAGE_SIZE = 10

const EMPTY: Notice[] = []

type CategoryFilter = NoticeCategory | 'all'

export default function NoticePage() {
  usePageMeta({
    title: '공지사항',
    description: 'BookPool의 업데이트·정책·점검 안내를 확인하세요.',
  })
  const [searchParams, setSearchParams] = useSearchParams()

  const categoryParam = searchParams.get('category')
  const category: CategoryFilter = NOTICE_CATEGORY_OPTIONS.some(
    (o) => o.value === categoryParam,
  )
    ? (categoryParam as NoticeCategory)
    : 'all'

  // 카테고리 필터는 서버에 넘긴다. 전체를 받아 클라이언트에서 거르면
  // 공지가 쌓일수록 뒤쪽이 잘려나간다.
  const {
    data: filtered,
    status,
    error,
    reload,
  } = useAsyncData<Notice[]>(
    () =>
      listNotices({
        category: category === 'all' ? undefined : category,
        size: 100,
      }).then((page) =>
        [...page.content].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      ),
    EMPTY,
    [category],
  )

  const pinned = useMemo(() => filtered.filter((n) => n.isPinned), [filtered])
  const normal = useMemo(() => filtered.filter((n) => !n.isPinned), [filtered])

  const totalPages = Math.max(1, Math.ceil(normal.length / PAGE_SIZE))
  const pageParam = Number(searchParams.get('page'))
  const page = Math.min(
    Math.max(1, Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1),
    totalPages,
  )
  const visibleNormal = normal.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  // 페이지마다 목록 높이를 동일하게 유지해 페이지네이션 위치를 고정한다
  const emptySlots = totalPages > 1 ? PAGE_SIZE - visibleNormal.length : 0

  const setCategory = (next: CategoryFilter) => {
    const params = new URLSearchParams(searchParams)
    if (next === 'all') params.delete('category')
    else params.set('category', next)
    params.delete('page')
    setSearchParams(params)
  }

  const setPage = (next: number) => {
    const params = new URLSearchParams(searchParams)
    if (next <= 1) params.delete('page')
    else params.set('page', String(next))
    setSearchParams(params)
  }

  return (
    <PageContainer width="narrow">
      {/* 모바일에서는 칩이 넘치면 가로로 스크롤된다 */}
      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto scrollbar-none px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip
          selected={category === 'all'}
          onClick={() => setCategory('all')}
          className="shrink-0"
        >
          전체
        </Chip>
        {NOTICE_CATEGORY_OPTIONS.map((o) => (
          <Chip
            key={o.value}
            selected={category === o.value}
            onClick={() => setCategory(o.value)}
            className="shrink-0"
          >
            {o.label}
          </Chip>
        ))}
      </div>

      {status === 'loading' ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : status === 'error' ? (
        <ErrorState
          title="공지를 불러오지 못했습니다."
          description={error?.message}
          onRetry={reload}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="해당하는 공지가 없어요."
          description="다른 카테고리를 선택해 보세요."
        />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {page === 1 &&
              pinned.map((notice) => (
                <NoticeRow key={notice.id} notice={notice} />
              ))}
            {visibleNormal.map((notice) => (
              <NoticeRow key={notice.id} notice={notice} />
            ))}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <NoticeRowSkeleton key={`skeleton-${i}`} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          )}
        </>
      )}
    </PageContainer>
  )
}

function NoticeRow({ notice }: { notice: Notice }) {
  const { isRead, markAsRead } = useNoticeReadState()
  const read = isRead(notice.id)

  return (
    <Link
      to={`/notice/${notice.id}`}
      onClick={() => markAsRead(notice.id)}
      className={cn(
        'group flex items-center gap-3 rounded-xl border p-4 transition-all no-underline',
        read
          ? 'border-stone-200/70 bg-stone-50 hover:bg-stone-50/70 hover:border-stone-300'
          : notice.isPinned
            ? 'border-stone-300 bg-white hover:bg-stone-50'
            : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50',
      )}
    >
      {/* 핀 슬롯 — 고정 너비로 비워둬 뱃지·제목 시작 위치를 항상 동일하게 유지 */}
      <span className="flex w-4 shrink-0 justify-center">
        {notice.isPinned && <Pin className="w-3.5 h-3.5 text-stone-400" />}
      </span>
      {/* 고정 너비 컨테이너로 제목 시작 위치는 통일하되, 뱃지 배경은 글자 폭에 맞춤 */}
      <span className="flex w-20 shrink-0">
        <NoticeCategoryBadge category={notice.category} />
      </span>
      <p
        className={cn(
          'flex-1 min-w-0 truncate text-sm transition-colors group-hover:text-orange-600',
          read ? 'font-normal text-stone-400' : 'font-medium text-stone-700',
        )}
      >
        {notice.title}
      </p>
      <span className="shrink-0 text-xs text-stone-400">
        {formatFullDate(notice.createdAt)}
      </span>
    </Link>
  )
}

// 빈 슬롯 — NoticeRow와 동일한 높이를 차지해 목록 영역 높이를 일정하게 유지
function NoticeRowSkeleton() {
  return (
    <div
      aria-hidden
      className="flex items-center gap-3 rounded-xl border border-transparent p-4"
    >
      <span className="w-4 shrink-0" />
      <span className="w-20 shrink-0" />
      <span className="flex-1 text-sm">&nbsp;</span>
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (next: number) => void
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <nav
      aria-label="페이지 이동"
      className="mt-6 flex items-center justify-center gap-1"
    >
      <PageButton
        label="이전"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      />
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onChange(p)}
          className={cn(
            'min-w-9 h-9 px-2 rounded-lg text-sm font-medium tabular-nums transition-colors',
            p === page
              ? 'bg-stone-800 text-white'
              : 'text-stone-600 hover:bg-stone-100',
          )}
        >
          {p}
        </button>
      ))}
      <PageButton
        label="다음"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      />
    </nav>
  )
}

function PageButton({
  label,
  disabled,
  onClick,
}: {
  label: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="h-9 px-3 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
    >
      {label}
    </button>
  )
}
