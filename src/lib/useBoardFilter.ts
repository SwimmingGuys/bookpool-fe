import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  emptyFilter,
  MAX_QUERY_LENGTH,
  type RecruitmentFilter,
} from '@/lib/recruitmentFilter'
import { CATEGORIES, type Category } from '@/types/recruitment'

// URL로 들어온 카테고리는 신뢰할 수 없으므로 아는 값만 통과시킨다.
function toCategoryParam(raw: string | null): Category | null {
  if (!raw) return null
  return (CATEGORIES as readonly string[]).includes(raw) ? (raw as Category) : null
}

export interface BoardFilterState {
  filter: RecruitmentFilter
  setFilter: React.Dispatch<React.SetStateAction<RecruitmentFilter>>
  favoritesOnly: boolean
  setFavoritesOnly: React.Dispatch<React.SetStateAction<boolean>>
  // 검색창이 보여줄, URL에 확정된 검색어
  urlQuery: string
  commitQuery: (query: string) => void
}

/**
 * 모집 달력과 전체 모집 목록이 함께 쓰는 검색·필터 상태.
 *
 * 두 화면이 같은 조건 UI(검색어·카테고리·유형·마감 조건·즐겨찾기만)를 쓰므로
 * URL 동기화까지 한곳에 둔다. 화면을 오갈 때 조건이 URL에 남아 이어진다.
 */
export function useBoardFilter(): BoardFilterState {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = (searchParams.get('q') ?? '').slice(0, MAX_QUERY_LENGTH)
  const urlCategory = toCategoryParam(searchParams.get('category'))

  const [filter, setFilter] = useState<RecruitmentFilter>({
    ...emptyFilter,
    query: initialQuery,
    categories: urlCategory ? [urlCategory] : [],
  })
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  // URL의 q가 바뀌면(헤더 검색·뒤로가기) 필터에 반영한다.
  // effect 대신 렌더 중 이전 값과 비교해 동기화한다.
  const urlQuery = searchParams.get('q') ?? ''
  const [syncedQuery, setSyncedQuery] = useState(urlQuery)
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery)
    setFilter((prev) => (prev.query === urlQuery ? prev : { ...prev, query: urlQuery }))
  }

  // 홈의 카테고리 타일은 ?category=로 들어온다. 검색어와 같은 방식으로 동기화한다.
  const [syncedCategory, setSyncedCategory] = useState(urlCategory)
  if (urlCategory !== syncedCategory) {
    setSyncedCategory(urlCategory)
    setFilter((prev) =>
      urlCategory ? { ...prev, categories: [urlCategory] } : { ...prev, categories: [] },
    )
  }

  // 검증을 통과한 검색어를 URL에 확정한다. 빈 문자열이면 q 파라미터 제거.
  const commitQuery = (query: string) => {
    const next = new URLSearchParams(searchParams)
    if (query) next.set('q', query)
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }

  return { filter, setFilter, favoritesOnly, setFavoritesOnly, urlQuery, commitQuery }
}
