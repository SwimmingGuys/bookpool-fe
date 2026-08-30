import { useMemo, useState } from 'react'
import { CalendarCheck } from 'lucide-react'
import {
  useRecruitmentCalendar,
  useRecruitmentsByLoader,
  type RecruitmentQuery,
} from '@/lib/recruitmentsSource'
import { listBookmarkedCampaigns } from '@/lib/api/campaigns'
import { useFavorites } from '@/lib/recruitmentState'
import { useBoardFilter } from '@/lib/useBoardFilter'
import CalendarBoard from '@/components/board/CalendarBoard'
import BoardToolbar from '@/components/board/BoardToolbar'
import BoardEmpty from '@/components/board/BoardEmpty'
import RecruitmentListCard from '@/components/board/RecruitmentListCard'
import SortDropdown from '@/components/board/SortDropdown'
import ActiveFilterTags from '@/components/board/ActiveFilterTags'
import { RecruitmentGridSkeleton } from '@/components/ui/Skeleton'
import PageContainer from '@/components/layout/PageContainer'
import {
  filterRecruitments,
  sortRecruitments,
  type SortKey,
} from '@/lib/recruitmentFilter'
import { getDateByBasis, getDateBasisLabel, type DateBasis } from '@/lib/dateBasis'
import { TODAY_DATE } from '@/lib/date'
import { usePageMeta } from '@/lib/useDocumentTitle'

/**
 * 모집 달력.
 *
 * 보고 있는 달의 공고만 다룬다. 전체 공고를 훑는 건 '전체 모집 목록'(/board)의 일이다.
 * 달력 아래 목록은 그 달 전체이고, 날짜를 고르면 그 날로 좁혀진다.
 * 달 전체를 이미 받아오므로 목록을 그리는 데 추가 요청이 없다.
 */
export default function CalendarPage() {
  usePageMeta({
    title: '모집 달력',
    description:
      '서평단·베타리더 모집 일정을 달력으로 확인하세요. 모집 시작·마감·발표일 기준으로 볼 수 있습니다.',
  })

  const { filter, setFilter, favoritesOnly, setFavoritesOnly, urlQuery, commitQuery } =
    useBoardFilter()
  const { favoritesVersion } = useFavorites()

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dateBasis, setDateBasis] = useState<DateBasis>('recruitEnd')
  const [sort, setSort] = useState<SortKey>('deadline')
  const [month, setMonth] = useState(() => ({
    year: TODAY_DATE.getFullYear(),
    index: TODAY_DATE.getMonth(),
  }))

  const query: RecruitmentQuery = useMemo(
    () => ({
      query: filter.query,
      categories: filter.categories,
      types: filter.types,
      deadline: filter.deadline,
      sort,
    }),
    [filter, sort],
  )

  const calendar = useRecruitmentCalendar(month.year, month.index, dateBasis, query)

  // 즐겨찾기는 개인의 유한한 목록이라 통째로 받아 클라이언트에서 거른다.
  const favorites = useRecruitmentsByLoader(
    () => (favoritesOnly ? listBookmarkedCampaigns() : Promise.resolve([])),
    [favoritesOnly, favoritesVersion],
  )

  const favoriteMatches = useMemo(
    () =>
      favoritesOnly
        ? sortRecruitments(filterRecruitments(favorites.recruitments, filter), sort)
        : null,
    [favoritesOnly, favorites.recruitments, filter, sort],
  )

  const monthItems = favoriteMatches ?? calendar.recruitments
  const isLoading = favoritesOnly
    ? favorites.status === 'loading'
    : calendar.status === 'loading'

  // 날짜를 고르면 이미 받아둔 그 달의 공고에서 추린다(추가 요청 없음).
  const visible = useMemo(() => {
    const base = selectedDate
      ? monthItems.filter((r) => getDateByBasis(r, dateBasis) === selectedDate)
      : monthItems
    return sortRecruitments(base, sort)
  }, [monthItems, selectedDate, dateBasis, sort])

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

  const monthLabel = `${month.year}년 ${month.index + 1}월`

  return (
    <PageContainer width="wide">
      <div className="mb-8 sm:mb-10">
        <CalendarBoard
          recruitments={monthItems}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          dateBasis={dateBasis}
          onChangeDateBasis={handleChangeDateBasis}
          year={month.year}
          monthIndex={month.index}
          onChangeMonth={handleChangeMonth}
          loading={isLoading}
          toolbar={
            <BoardToolbar
              filter={filter}
              onChangeFilter={setFilter}
              urlQuery={urlQuery}
              onCommitQuery={commitQuery}
              favoritesOnly={favoritesOnly}
              onToggleFavoritesOnly={handleToggleFavoritesOnly}
            />
          }
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
              {selectedDate ? `${getDateBasisLabel(dateBasis)} 공고` : `${monthLabel} 공고`}
              {!isLoading && (
                <span className="ml-2 text-sm font-bold text-orange-500">
                  {visible.length}
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
          onClearQuery={() => commitQuery('')}
          className="mb-4"
        />

        {isLoading ? (
          <RecruitmentGridSkeleton />
        ) : visible.length === 0 ? (
          <BoardEmpty
            query={filter.query}
            favoritesOnly={favoritesOnly}
            selectedDate={selectedDate}
            dateBasis={dateBasis}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((r) => (
              <RecruitmentListCard key={r.id} recruitment={r} />
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  )
}
