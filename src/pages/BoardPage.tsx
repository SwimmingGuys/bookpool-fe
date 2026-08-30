import { useMemo, useState } from 'react'
import {
  useRecruitmentList,
  useRecruitmentsByLoader,
  type RecruitmentQuery,
} from '@/lib/recruitmentsSource'
import { listBookmarkedCampaigns } from '@/lib/api/campaigns'
import { useFavorites } from '@/lib/recruitmentState'
import { useBoardFilter } from '@/lib/useBoardFilter'
import BoardToolbar from '@/components/board/BoardToolbar'
import BoardEmpty from '@/components/board/BoardEmpty'
import RecruitmentListRow from '@/components/board/RecruitmentListRow'
import SortDropdown from '@/components/board/SortDropdown'
import ActiveFilterTags from '@/components/board/ActiveFilterTags'
import ErrorState from '@/components/ui/ErrorState'
import Button from '@/components/ui/Button'
import { RecruitmentRowListSkeleton } from '@/components/ui/Skeleton'
import PageContainer from '@/components/layout/PageContainer'
import {
  filterRecruitments,
  sortRecruitments,
  type SortKey,
} from '@/lib/recruitmentFilter'
import { usePageMeta } from '@/lib/useDocumentTitle'

/**
 * 전체 모집 목록.
 *
 * 달력 없이 공고만 훑는 화면이다. 검색·필터·정렬은 전부 서버로 넘기고
 * '더 보기'로 이어 받는다. 예전처럼 앞 100건만 받아 클라이언트에서 거르면
 * 공고가 늘어나는 순간 결과가 조용히 잘려나간다.
 * 특정 달의 일정을 보는 건 '모집 달력'(/calendar)의 일이다.
 */
export default function BoardPage() {
  usePageMeta({
    title: '전체 모집 목록',
    description:
      '진행 중인 서평단·베타리더 모집을 한곳에서 확인하세요. 카테고리·유형·마감 조건으로 좁혀 볼 수 있습니다.',
  })

  const { filter, setFilter, favoritesOnly, setFavoritesOnly, urlQuery, commitQuery } =
    useBoardFilter()
  const { favoritesVersion } = useFavorites()
  const [sort, setSort] = useState<SortKey>('deadline')

  const listQuery: RecruitmentQuery = useMemo(
    () => ({
      query: filter.query,
      categories: filter.categories,
      types: filter.types,
      deadline: filter.deadline,
      sort,
    }),
    [filter, sort],
  )

  const list = useRecruitmentList(listQuery)

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

  const visible = favoriteMatches ?? list.recruitments
  const visibleCount = favoriteMatches ? favoriteMatches.length : list.total
  const isLoading = favoriteMatches
    ? favorites.status === 'loading'
    : list.status === 'loading'
  // '더 보기'는 서버 페이지네이션 목록일 때만 의미가 있다.
  const canLoadMore = !favoriteMatches && list.hasNext

  return (
    <PageContainer width="wide">
      <BoardToolbar
        filter={filter}
        onChangeFilter={setFilter}
        urlQuery={urlQuery}
        onCommitQuery={commitQuery}
        favoritesOnly={favoritesOnly}
        onToggleFavoritesOnly={() => setFavoritesOnly((prev) => !prev)}
        className="mb-4"
      />

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-stone-700">
            {favoritesOnly ? '즐겨찾기한 공고' : '전체 공고'}
            {!isLoading && (
              <span className="ml-2 text-sm font-bold text-orange-500">
                {visibleCount}
              </span>
            )}
          </h2>
          <SortDropdown value={sort} onChange={setSort} />
        </div>

        <ActiveFilterTags
          filter={filter}
          onChange={setFilter}
          onClearQuery={() => commitQuery('')}
          className="mb-4"
        />

        {isLoading ? (
          <RecruitmentRowListSkeleton />
        ) : !favoriteMatches && list.status === 'error' ? (
          <ErrorState
            title="공고를 불러오지 못했습니다."
            description="네트워크 상태를 확인한 뒤 다시 시도해 주세요."
            onRetry={list.reload}
          />
        ) : visible.length === 0 ? (
          <BoardEmpty query={filter.query} favoritesOnly={favoritesOnly} />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {visible.map((r) => (
                <RecruitmentListRow key={r.id} recruitment={r} />
              ))}
            </div>

            {/* 즐겨찾기 보기는 이미 전부 받아둔 상태라 더 보기가 없다. */}
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
