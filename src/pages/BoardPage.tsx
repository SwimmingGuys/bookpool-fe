import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarCheck, Star } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  useRecruitmentCalendar,
  useRecruitmentList,
  useRecruitmentsByLoader,
  type RecruitmentQuery,
} from '@/lib/recruitmentsSource'
import { listBookmarkedCampaigns } from '@/lib/api/campaigns'
import { useAuth } from '@/lib/auth'
import FilterPanel from '@/components/board/FilterPanel'
import CalendarBoard from '@/components/board/CalendarBoard'
import RecruitmentListCard from '@/components/board/RecruitmentListCard'
import SortDropdown from '@/components/board/SortDropdown'
import ActiveFilterTags from '@/components/board/ActiveFilterTags'
import BoardSearchBar from '@/components/board/BoardSearchBar'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Button from '@/components/ui/Button'
import { RecruitmentGridSkeleton } from '@/components/ui/Skeleton'
import PageContainer from '@/components/layout/PageContainer'
import PageHeader from '@/components/layout/PageHeader'
import {
  deadlineToWithinDays,
  emptyFilter,
  filterRecruitments,
  sortRecruitments,
  MAX_QUERY_LENGTH,
  type RecruitmentFilter,
  type SortKey,
} from '@/lib/recruitmentFilter'
import { getDateByBasis, getDateBasisLabel, type DateBasis } from '@/lib/dateBasis'
import { TODAY_DATE } from '@/lib/date'
import { usePageMeta } from '@/lib/useDocumentTitle'

export default function BoardPage() {
  usePageMeta({
    title: '보드',
    description:
      '진행 중인 서평단·베타리더 모집을 캘린더로 확인하세요. 카테고리·유형·마감 조건으로 좁혀 볼 수 있습니다.',
  })

  const [searchParams, setSearchParams] = useSearchParams()
  const { isLoggedIn } = useAuth()
  const initialQuery = (searchParams.get('q') ?? '').slice(0, MAX_QUERY_LENGTH)

  const [filter, setFilter] = useState<RecruitmentFilter>({
    ...emptyFilter,
    query: initialQuery,
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dateBasis, setDateBasis] = useState<DateBasis>('recruitEnd')
  const [sort, setSort] = useState<SortKey>('deadline')
  const [month, setMonth] = useState(() => ({
    year: TODAY_DATE.getFullYear(),
    index: TODAY_DATE.getMonth(),
  }))
  // 즐겨찾기 전용 보기. 즐겨찾기는 개인의 유한한 목록이라 통째로 받아
  // 캘린더와 목록을 같은 데이터로 그린다.
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  // URL의 q 파라미터가 바뀌면(예: 헤더 검색·뒤로가기) 필터에 반영한다.
  // effect 대신 렌더 중 이전 값과 비교해 동기화한다.
  const urlQuery = searchParams.get('q') ?? ''
  const [syncedQuery, setSyncedQuery] = useState(urlQuery)
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery)
    setFilter((prev) => (prev.query === urlQuery ? prev : { ...prev, query: urlQuery }))
  }

  // 검색·필터·정렬은 전부 서버로 넘긴다. 예전처럼 앞 100건만 받아 클라이언트에서
  // 거르면 공고가 늘어나는 순간 결과가 조용히 잘려나간다.
  const listQuery: RecruitmentQuery = useMemo(
    () => ({
      query: filter.query,
      categories: filter.categories,
      types: filter.types,
      withinDays: deadlineToWithinDays(filter.deadline),
      sort,
    }),
    [filter, sort],
  )

  const list = useRecruitmentList(listQuery)

  // 캘린더는 점을 찍으려면 그 달 전체가 필요하므로 목록과 따로 받아온다.
  const calendar = useRecruitmentCalendar(month.year, month.index, dateBasis, listQuery)

  const favorites = useRecruitmentsByLoader(
    () => (favoritesOnly ? listBookmarkedCampaigns() : Promise.resolve([])),
    [favoritesOnly],
  )

  // 즐겨찾기 보기에서는 서버에 다시 묻지 않고 받아둔 목록을 걸러 쓴다.
  const favoriteMatches = useMemo(
    () =>
      favoritesOnly
        ? sortRecruitments(filterRecruitments(favorites.recruitments, filter), sort)
        : null,
    [favoritesOnly, favorites.recruitments, filter, sort],
  )

  const calendarItems = favoriteMatches ?? calendar.recruitments
  const calendarLoading = favoritesOnly
    ? favorites.status === 'loading'
    : calendar.status === 'loading'

  // 날짜를 고르면 이미 받아둔 그 달의 공고에서 추린다(추가 요청 없음).
  const dateFiltered = useMemo(() => {
    if (!selectedDate) return null
    const matched = calendarItems.filter(
      (r) => getDateByBasis(r, dateBasis) === selectedDate,
    )
    return sortRecruitments(matched, sort)
  }, [calendarItems, selectedDate, dateBasis, sort])

  // 목록에 뿌릴 것: 날짜 선택 > 즐겨찾기 보기 > 서버 페이지네이션 목록
  const visible = dateFiltered ?? favoriteMatches ?? list.recruitments
  const visibleCount = visible === list.recruitments ? list.total : visible.length
  const isLoading =
    dateFiltered || favoriteMatches ? calendarLoading : list.status === 'loading'
  // '더 보기'는 서버 페이지네이션 목록일 때만 의미가 있다.
  const canLoadMore = !dateFiltered && !favoriteMatches && list.hasNext

  const handleChangeDateBasis = (next: DateBasis) => {
    setDateBasis(next)
    setSelectedDate(null)
  }

  const handleChangeMonth = (year: number, index: number) => {
    setMonth({ year, index })
    setSelectedDate(null)
  }

  const handleToggleFavoritesOnly = () => {
    setFavoritesOnly((prev) => !prev)
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
    <div className="flex flex-wrap items-start gap-3">
      <BoardSearchBar
        committedQuery={urlQuery}
        onCommit={handleCommitQuery}
        className="w-full sm:flex-1 sm:min-w-[300px] sm:max-w-[440px]"
      />

      <div className="mt-0.5 hidden h-9 w-px bg-stone-200 sm:block" />

      <FilterPanel filter={filter} onChange={setFilter} />

      {isLoggedIn && (
        <button
          type="button"
          onClick={handleToggleFavoritesOnly}
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

  return (
    <PageContainer width="wide">
      <PageHeader
        title="모집 보드"
        description="모집 시작·마감·발표일 기준으로 일정을 확인하고, 관심 조건만 골라 보세요."
      />

      <div className="mb-8 sm:mb-10">
        <CalendarBoard
          recruitments={calendarItems}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          dateBasis={dateBasis}
          onChangeDateBasis={handleChangeDateBasis}
          year={month.year}
          monthIndex={month.index}
          onChangeMonth={handleChangeMonth}
          loading={calendarLoading}
          toolbar={toolbar}
        />
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {selectedDate && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">
                <CalendarCheck className="h-3.5 w-3.5" />
                {selectedDate}
              </span>
            )}
            <h2 className="text-base font-bold text-stone-700">
              {selectedDate ? `${getDateBasisLabel(dateBasis)} 공고` : '전체 공고'}
              {!isLoading && (
                <span className="ml-2 text-sm font-bold text-orange-500">
                  {visibleCount}
                </span>
              )}
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

        {isLoading ? (
          <RecruitmentGridSkeleton />
        ) : !dateFiltered && !favoriteMatches && list.status === 'error' ? (
          <ErrorState
            title="공고를 불러오지 못했습니다."
            description="네트워크 상태를 확인한 뒤 다시 시도해 주세요."
            onRetry={list.reload}
          />
        ) : visible.length === 0 ? (
          <BoardEmpty
            query={filter.query}
            selectedDate={selectedDate}
            dateBasis={dateBasis}
            favoritesOnly={favoritesOnly}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((r) => (
                <RecruitmentListCard key={r.id} recruitment={r} />
              ))}
            </div>

            {/* 날짜 선택·즐겨찾기 보기는 이미 전부 받아둔 상태라 더 보기가 없다. */}
            {canLoadMore && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="secondary"
                  onClick={list.loadMore}
                  disabled={list.isLoadingMore}
                >
                  {list.isLoadingMore
                    ? '불러오는 중...'
                    : `공고 더 보기 (${list.recruitments.length}/${list.total})`}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </PageContainer>
  )
}

function BoardEmpty({
  query,
  selectedDate,
  dateBasis,
  favoritesOnly,
}: {
  query: string
  selectedDate: string | null
  dateBasis: DateBasis
  favoritesOnly: boolean
}) {
  let title = '조건에 맞는 공고가 없습니다.'
  if (selectedDate) {
    title = `${selectedDate}이(가) ${getDateBasisLabel(dateBasis)}인 공고가 없습니다.`
  } else if (favoritesOnly) {
    title = '즐겨찾기한 공고가 없습니다.'
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
