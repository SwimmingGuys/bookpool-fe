import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Megaphone, Pin } from 'lucide-react'
import { cn } from '@/lib/cn'
import { NOTICE_CATEGORY_OPTIONS, type Notice, type NoticeCategory } from '@/types/notice'
import { listNotices } from '@/lib/api/notices'
import { formatFullDate } from '@/lib/date'
import Chip from '@/components/ui/Chip'
import EmptyState from '@/components/ui/EmptyState'
import NoticeCategoryBadge from '@/components/notice/NoticeCategoryBadge'
import { useNoticeReadState } from '@/lib/noticeReadState'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

const PAGE_SIZE = 10

type CategoryFilter = NoticeCategory | 'all'

export default function NoticePage() {
  useDocumentTitle('공지사항')
  const [searchParams, setSearchParams] = useSearchParams()
  const [notices, setNotices] = useState<Notice[]>([])

  const categoryParam = searchParams.get('category')
  const category: CategoryFilter = NOTICE_CATEGORY_OPTIONS.some(
    (o) => o.value === categoryParam,
  )
    ? (categoryParam as NoticeCategory)
    : 'all'

  useEffect(() => {
    let ignore = false
    listNotices({ size: 100 })
      .then((page) => {
        if (!ignore) {
          setNotices(
            [...page.content].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
          )
        }
      })
      .catch(() => {
        if (!ignore) setNotices([])
      })
    return () => {
      ignore = true
    }
  }, [])

  const filtered = useMemo(
    () =>
      category === 'all'
        ? notices
        : notices.filter((n) => n.category === category),
    [category, notices],
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
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Chip selected={category === 'all'} onClick={() => setCategory('all')}>
          전체
        </Chip>
        {NOTICE_CATEGORY_OPTIONS.map((o) => (
          <Chip
            key={o.value}
            selected={category === o.value}
            onClick={() => setCategory(o.value)}
          >
            {o.label}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
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
    </div>
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
