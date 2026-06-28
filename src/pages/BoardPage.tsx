import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarCheck } from 'lucide-react'
import { useAllRecruitments } from '@/lib/recruitmentsSource'
import FilterPanel from '@/components/board/FilterPanel'
import CalendarBoard from '@/components/board/CalendarBoard'
import RecruitmentListCard from '@/components/board/RecruitmentListCard'
import SortDropdown from '@/components/board/SortDropdown'
import ActiveFilterTags from '@/components/board/ActiveFilterTags'
import BoardSearchBar from '@/components/board/BoardSearchBar'
import EmptyState from '@/components/ui/EmptyState'
import {
  emptyFilter,
  filterRecruitments,
  sortRecruitments,
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dateBasis, setDateBasis] = useState<DateBasis>('recruitEnd')
  const [sort, setSort] = useState<SortKey>('deadline')
  const allRecruitments = useAllRecruitments()

  // URL의 q 파라미터가 바뀌면(예: 헤더 검색·뒤로가기) 필터에 반영한다.
  // effect 대신 렌더 중 이전 값과 비교해 동기화한다.
  const urlQuery = searchParams.get('q') ?? ''
  const [syncedQuery, setSyncedQuery] = useState(urlQuery)
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery)
    setFilter((prev) => (prev.query === urlQuery ? prev : { ...prev, query: urlQuery }))
  }

  const filteredByCondition = useMemo(
    () => filterRecruitments(allRecruitments, filter),
    [allRecruitments, filter],
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

  // 검증을 통과한 검색어를 URL에 확정한다. 빈 문자열이면 q 파라미터 제거.
  const handleCommitQuery = (query: string) => {
    const next = new URLSearchParams(searchParams)
    if (query) next.set('q', query)
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }

  const toolbar = (
    <div className="flex items-start gap-3 flex-wrap">
      <BoardSearchBar
        committedQuery={urlQuery}
        onCommit={handleCommitQuery}
        className="w-full sm:flex-1 sm:min-w-[300px] sm:max-w-[440px]"
      />

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
            onClearQuery={() => handleCommitQuery('')}
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
