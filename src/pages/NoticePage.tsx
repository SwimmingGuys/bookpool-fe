import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Megaphone, Pin } from 'lucide-react'
import { cn } from '@/lib/cn'
import { mockNotices } from '@/data/mockNotices'
import { NOTICE_CATEGORY_OPTIONS, type Notice, type NoticeCategory } from '@/types/notice'
import { formatMonthDay } from '@/lib/date'
import Chip from '@/components/ui/Chip'
import EmptyState from '@/components/ui/EmptyState'
import NoticeCategoryBadge from '@/components/notice/NoticeCategoryBadge'

const PAGE_SIZE = 10

type CategoryFilter = NoticeCategory | 'all'

const sortedNotices = [...mockNotices].sort((a, b) =>
  b.createdAt.localeCompare(a.createdAt),
)

export default function NoticePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const categoryParam = searchParams.get('category')
  const category: CategoryFilter = NOTICE_CATEGORY_OPTIONS.some(
    (o) => o.value === categoryParam,
  )
    ? (categoryParam as NoticeCategory)
    : 'all'

  const filtered = useMemo(
    () =>
      category === 'all'
        ? sortedNotices
        : sortedNotices.filter((n) => n.category === category),
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
      <h1 className="flex items-center gap-2 text-2xl font-bold text-stone-800 tracking-tight mb-8">
        <Megaphone className="w-6 h-6 text-stone-400" strokeWidth={2} />
        공지사항
      </h1>

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
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}

function NoticeRow({ notice }: { notice: Notice }) {
  return (
    <Link
      to={`/notice/${notice.id}`}
      className={cn(
        'group flex items-center gap-3 rounded-xl border p-4 transition-all no-underline',
        notice.isPinned
          ? 'border-stone-300 bg-white hover:bg-stone-50'
          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50',
      )}
    >
      {notice.isPinned && (
        <Pin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
      )}
      <NoticeCategoryBadge category={notice.category} className="shrink-0" />
      <p className="flex-1 min-w-0 truncate text-sm font-medium text-stone-700 group-hover:text-orange-600 transition-colors">
        {notice.title}
      </p>
      <span className="shrink-0 text-[11px] text-stone-400 tabular-nums">
        {formatMonthDay(notice.createdAt)}
      </span>
    </Link>
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
      className="mt-6 flex items-center justify-between gap-2"
    >
      <PageButton
        label="이전"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      />
      <div className="flex items-center gap-1">
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
      </div>
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
