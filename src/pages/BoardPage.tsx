import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, CalendarCheck } from 'lucide-react'
import { cn } from '@/lib/cn'
import { mockRecruitments } from '@/data/mockRecruitments'
import FilterPanel from '@/components/board/FilterPanel'
import CalendarBoard from '@/components/board/CalendarBoard'
import RecruitmentListCard from '@/components/board/RecruitmentListCard'
import SortDropdown from '@/components/board/SortDropdown'
import ActiveFilterTags from '@/components/board/ActiveFilterTags'
import EmptyState from '@/components/ui/EmptyState'
import {
  emptyFilter,
  filterRecruitments,
  sortRecruitments,
  validateQuery,
  MAX_QUERY_LENGTH,
  type RecruitmentFilter,
  type SortKey,
} from '@/lib/recruitmentFilter'
import {
  getDateByBasis,
  getDateBasisLabel,
  type DateBasis,
} from '@/lib/dateBasis'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export default function BoardPage() {
  useDocumentTitle('보드')
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = (searchParams.get('q') ?? '').slice(0, MAX_QUERY_LENGTH)

  const [filter, setFilter] = useState<RecruitmentFilter>({
    ...emptyFilter,
    query: initialQuery,
  })
  const [draftQuery, setDraftQuery] = useState(initialQuery)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dateBasis, setDateBasis] = useState<DateBasis>('recruitEnd')
  const [sort, setSort] = useState<SortKey>('deadline')
  const [queryError, setQueryError] = useState<string | null>(null)

  // URL의 q 파라미터가 바뀌면(예: 헤더 검색·뒤로가기) 로컬 상태에 반영한다.
  // effect 대신 렌더 중 이전 값과 비교해 동기화한다.
  const urlQuery = searchParams.get('q') ?? ''
  const [syncedQuery, setSyncedQuery] = useState(urlQuery)
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery)
    setFilter((prev) => (prev.query === urlQuery ? prev : { ...prev, query: urlQuery }))
    setDraftQuery(urlQuery)
  }

  const filteredByCondition = useMemo(
    () => filterRecruitments(mockRecruitments, filter),
    [filter],
  )

  const dateFiltered = useMemo(() => {
    if (!selectedDate) return filteredByCondition
    return filteredByCondition.filter(
      (r) => getDateByBasis(r, dateBasis) === selectedDate,
    )
  }, [filteredByCondition, selectedDate, dateBasis])

  const sorted = useMemo(
    () => sortRecruitments(dateFiltered, sort),
    [dateFiltered, sort],
  )

  const handleChangeDateBasis = (next: DateBasis) => {
    setDateBasis(next)
    setSelectedDate(null)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = validateQuery(draftQuery)
    if (!result.ok) {
      setQueryError(result.error)
      return
    }
    setQueryError(null)

    const next = new URLSearchParams(searchParams)
    if (result.query) next.set('q', result.query)
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }

  const handleClearSearch = () => {
    setDraftQuery('')
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    setSearchParams(next, { replace: true })
    setQueryError(null)
  }

  const toolbar = (
    <div className="flex items-start gap-3 flex-wrap">
      <form onSubmit={handleSearchSubmit} className="w-full sm:flex-1 sm:min-w-[300px] sm:max-w-[440px]">
        <label
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-3.5 py-2 transition-all border',
            'bg-stone-100 border-stone-100',
            'hover:bg-stone-50 hover:border-stone-200',
            'focus-within:bg-white focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100',
          )}
        >
          <Search className="h-4 w-4 text-stone-400 shrink-0" />
          <input
            type="text"
            value={draftQuery}
            onChange={(e) => setDraftQuery(e.target.value.slice(0, MAX_QUERY_LENGTH))}
            placeholder="제목, 도서, 출판사 검색"
            className="w-full min-w-0 bg-transparent text-sm text-stone-700 placeholder-stone-400 outline-none"
          />
          {draftQuery ? (
            <button
              type="button"
              onClick={handleClearSearch}
              className="p-0.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 shrink-0 transition-colors"
              aria-label="검색어 지우기"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center justify-center text-[10px] font-semibold text-stone-400 bg-white border border-stone-200 rounded px-1.5 py-0.5 shrink-0">
              Enter
            </kbd>
          )}
        </label>
        {queryError && (
          <p className="mt-1 text-xs text-red-500 px-1">{queryError}</p>
        )}
      </form>

      <div className="h-9 w-px bg-stone-200 hidden sm:block mt-0.5" />

      <FilterPanel filter={filter} onChange={setFilter} />
    </div>
  )

  return (
    <div className="min-h-full">
      <div className="px-6 py-10 max-w-7xl mx-auto">
        <div className="mb-10">
          <CalendarBoard
            recruitments={filteredByCondition}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            dateBasis={dateBasis}
            onChangeDateBasis={handleChangeDateBasis}
            toolbar={toolbar}
          />
        </div>

        <section>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              {selectedDate && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                  <CalendarCheck className="w-3.5 h-3.5" />
                  {selectedDate}
                </span>
              )}
              <h2 className="text-base font-bold text-stone-700">
                {selectedDate
                  ? `${getDateBasisLabel(dateBasis)} 공고`
                  : '전체 공고'}
                <span className="ml-2 text-sm font-bold text-orange-500">
                  {sorted.length}
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-2.5">
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="text-xs font-medium text-stone-500 hover:text-orange-600"
                >
                  날짜 선택 해제
                </button>
              )}
              <SortDropdown value={sort} onChange={setSort} />
            </div>
          </div>

          <ActiveFilterTags
            filter={filter}
            onChange={setFilter}
            onClearQuery={handleClearSearch}
            className="mb-4"
          />

          {sorted.length === 0 ? (
            <BoardEmpty
              query={filter.query}
              selectedDate={selectedDate}
              dateBasis={dateBasis}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sorted.map((r) => (
                <RecruitmentListCard key={r.id} recruitment={r} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function BoardEmpty({
  query,
  selectedDate,
  dateBasis,
}: {
  query: string
  selectedDate: string | null
  dateBasis: DateBasis
}) {
  let title = '조건에 맞는 공고가 없습니다.'
  if (selectedDate) {
    title = `${selectedDate}이(가) ${getDateBasisLabel(dateBasis)}인 공고가 없습니다.`
  } else if (query) {
    title = `"${query}"에 대한 검색 결과가 없습니다.`
  }

  return (
    <EmptyState
      title={title}
      description="필터나 검색어를 변경해 다시 시도해 보세요."
    />
  )
}
