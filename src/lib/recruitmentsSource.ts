import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  Category,
  DeadlineFilter,
  Recruitment,
  RecruitmentType,
} from '@/types/recruitment'
import {
  DEFAULT_PAGE_SIZE,
  getCampaign,
  listCampaigns,
  type CampaignSortKey,
} from '@/lib/api/campaigns'
import { useAsyncData, type LoadStatus } from '@/lib/useAsyncData'
import { getDateByBasis, type DateBasis } from '@/lib/dateBasis'

const EMPTY: Recruitment[] = []

export interface RecruitmentQuery {
  query: string
  categories: Category[]
  types: RecruitmentType[]
  deadline?: DeadlineFilter
  // 출판사 페이지처럼 한 출판사로 고정해 볼 때 쓴다.
  publisher?: string
  sort: CampaignSortKey
}

// ---------- 목록 (서버 검색 + 무한 스크롤식 더 보기) ----------

export interface RecruitmentListResult {
  recruitments: Recruitment[]
  status: LoadStatus
  error: Error | null
  total: number
  hasNext: boolean
  isLoadingMore: boolean
  loadMore: () => void
  reload: () => void
}

/**
 * 보드 목록. 검색·필터·정렬을 전부 서버에 넘기고, '더 보기'로 다음 페이지를 이어 붙인다.
 * 필터가 바뀌면 첫 페이지부터 다시 받는다.
 */
export function useRecruitmentList(
  params: RecruitmentQuery,
  size = DEFAULT_PAGE_SIZE,
): RecruitmentListResult {
  const first = useAsyncData(
    () =>
      listCampaigns({
        query: params.query || undefined,
        publisher: params.publisher,
        categories: params.categories.length > 0 ? params.categories : undefined,
        types: params.types.length > 0 ? params.types : undefined,
        deadline: params.deadline,
        sort: params.sort,
        page: 0,
        size,
      }),
    { content: EMPTY, page: 0, size, totalElements: 0, totalPages: 0, hasNext: false },
    [
      params.query,
      params.publisher,
      params.categories,
      params.types,
      params.deadline,
      params.sort,
      size,
    ],
  )

  // 첫 페이지는 useAsyncData가 들고 있고, '더 보기'로 이어붙인 페이지만 따로 쌓는다.
  // 이렇게 두면 첫 페이지 응답을 상태로 복사하는 effect가 필요 없다.
  const [appended, setAppended] = useState<Recruitment[]>(EMPTY)
  const [lastPage, setLastPage] = useState(0)
  const [appendedHasNext, setAppendedHasNext] = useState<boolean | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // 필터가 바뀌면 이어붙인 페이지를 버린다. effect 대신 렌더 중 이전 값과 비교한다.
  const resetKey = JSON.stringify([
    params.query,
    params.publisher,
    params.categories,
    params.types,
    params.deadline,
    params.sort,
    size,
  ])
  const [prevResetKey, setPrevResetKey] = useState(resetKey)
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey)
    setAppended(EMPTY)
    setLastPage(0)
    setAppendedHasNext(null)
  }

  const recruitments = useMemo(
    () =>
      appended.length === 0
        ? first.data.content
        : [...first.data.content, ...appended],
    [first.data.content, appended],
  )

  const hasNext = appendedHasNext ?? first.data.hasNext

  // '더 보기'는 이벤트 핸들러라 최신 필터를 참조로 읽는다.
  // 렌더 중 ref를 쓰지 않도록 effect에서 갱신한다.
  const paramsRef = useRef(params)
  useEffect(() => {
    paramsRef.current = params
  })

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasNext) return
    const current = paramsRef.current
    const nextPage = lastPage + 1
    setIsLoadingMore(true)
    listCampaigns({
      query: current.query || undefined,
      publisher: current.publisher,
      categories: current.categories.length > 0 ? current.categories : undefined,
      types: current.types.length > 0 ? current.types : undefined,
      deadline: current.deadline,
      sort: current.sort,
      page: nextPage,
      size,
    })
      .then((result) => {
        setAppended((prev) => [...prev, ...result.content])
        setLastPage(result.page)
        setAppendedHasNext(result.hasNext)
      })
      .catch(() => {
        // 더 보기 실패는 목록을 비우지 않는다. 버튼이 남아 재시도할 수 있다.
      })
      .finally(() => setIsLoadingMore(false))
  }, [hasNext, isLoadingMore, lastPage, size])

  return {
    recruitments,
    status: first.status,
    error: first.error,
    total: first.data.totalElements,
    hasNext,
    isLoadingMore,
    loadMore,
    reload: first.reload,
  }
}

// ---------- 캘린더 (보고 있는 달만) ----------

function monthRange(year: number, monthIndex: number): { from: string; to: string } {
  const pad = (n: number) => String(n).padStart(2, '0')
  const lastDay = new Date(year, monthIndex + 1, 0).getDate()
  return {
    from: `${year}-${pad(monthIndex + 1)}-01`,
    to: `${year}-${pad(monthIndex + 1)}-${pad(lastDay)}`,
  }
}

// 캘린더가 한 달치를 확보하기 위해 받아오는 건수.
// 서버가 from/to를 지원하면 이 값과 아래 재필터링을 함께 지운다.
const CALENDAR_FETCH_SIZE = 200

/**
 * 캘린더에 점을 찍으려면 그 달의 공고가 전부 필요하다. 목록과 달리 페이지를 나누지 않고
 * 보고 있는 달만 통째로 받아온다.
 *
 * 백엔드 GET /api/campaigns는 아직 from/to/dateBasis를 받지 않는다. 파라미터는 그대로
 * 보내되(서버가 지원하는 순간 그 필터가 먹는다), 응답을 한 번 더 보고 있는 달로 거른다.
 * 이 재필터링이 없으면 어느 달을 넘겨도 같은 공고가 그려진다.
 */
export function useRecruitmentCalendar(
  year: number,
  monthIndex: number,
  basis: DateBasis,
  params: RecruitmentQuery,
): { recruitments: Recruitment[]; status: LoadStatus } {
  const { from, to } = monthRange(year, monthIndex)

  const result = useAsyncData(
    () =>
      listCampaigns({
        query: params.query || undefined,
        publisher: params.publisher,
        categories: params.categories.length > 0 ? params.categories : undefined,
        types: params.types.length > 0 ? params.types : undefined,
        deadline: params.deadline,
        from,
        to,
        dateBasis: basis,
        size: CALENDAR_FETCH_SIZE,
      }),
    {
      content: EMPTY,
      page: 0,
      size: CALENDAR_FETCH_SIZE,
      totalElements: 0,
      totalPages: 0,
      hasNext: false,
    },
    [
      from,
      to,
      basis,
      params.query,
      params.publisher,
      params.categories,
      params.types,
      params.deadline,
    ],
  )

  const recruitments = useMemo(() => {
    const inMonth = result.data.content.filter((r) => {
      const date = getDateByBasis(r, basis)
      return Boolean(date) && date >= from && date <= to
    })
    return inMonth.length === 0 ? EMPTY : inMonth
  }, [result.data.content, basis, from, to])

  return { recruitments, status: result.status }
}

// ---------- 단건 ----------

export interface RecruitmentDetailResult {
  recruitment: Recruitment | null
  status: LoadStatus
  error: Error | null
  reload: () => void
}

/**
 * 상세 페이지는 목록 캐시를 뒤지지 않고 단건으로 조회한다.
 * 목록에서 찾는 방식은 링크를 직접 열었을 때 "존재하지 않는 공고"로 보이는 문제가 있었다.
 */
export function useRecruitment(id: string | undefined): RecruitmentDetailResult {
  const result = useAsyncData<Recruitment | null>(
    () => (id ? getCampaign(id) : Promise.resolve(null)),
    null,
    [id],
  )

  return {
    recruitment: result.data,
    status: result.status,
    error: result.error,
    reload: result.reload,
  }
}

// ---------- 홈: 마감 임박 큐레이션 ----------

export function useFeaturedRecruitments(limit = 8): {
  recruitments: Recruitment[]
  status: LoadStatus
} {
  const result = useAsyncData(
    () => listCampaigns({ sort: 'deadline', page: 0, size: limit }),
    { content: EMPTY, page: 0, size: limit, totalElements: 0, totalPages: 0, hasNext: false },
    [limit],
  )

  return { recruitments: result.data.content, status: result.status }
}

// ---------- 즐겨찾기·최근 본 목록을 공고 객체로 ----------

/**
 * ID 목록만 갖고 있는 화면(마이페이지)에서 공고 본문을 함께 받아온다.
 * 서버가 목록 엔드포인트를 제공하므로 ID로 하나씩 조회하지 않는다.
 */
export function useRecruitmentsByLoader(
  load: () => Promise<Recruitment[]>,
  deps: unknown[],
): { recruitments: Recruitment[]; status: LoadStatus; reload: () => void } {
  const result = useAsyncData(load, EMPTY, deps)
  return {
    recruitments: result.data,
    status: result.status,
    reload: result.reload,
  }
}
