import type { Recruitment, RecruitmentType } from '@/types/recruitment'
import type { CampaignSortKey } from '@/lib/api/campaigns'

export type DeadlineFilter = 'all' | 'week' | 'imminent'

export interface RecruitmentFilter {
  query: string
  categories: string[]
  types: RecruitmentType[]
  deadline: DeadlineFilter
}

export const emptyFilter: RecruitmentFilter = {
  query: '',
  categories: [],
  types: [],
  deadline: 'all',
}

export const MAX_QUERY_LENGTH = 50
const FORBIDDEN_QUERY_CHARS = /[<>"'`;]/

export type QueryValidation =
  | { ok: true; query: string }
  | { ok: false; error: string }

export function validateQuery(raw: string): QueryValidation {
  const trimmed = raw.trim()
  if (FORBIDDEN_QUERY_CHARS.test(trimmed)) {
    return { ok: false, error: '허용되지 않는 특수문자가 포함되어 있습니다.' }
  }
  if (trimmed.length > MAX_QUERY_LENGTH) {
    return { ok: false, error: `검색어는 ${MAX_QUERY_LENGTH}자 이하로 입력해주세요.` }
  }
  return { ok: true, query: trimmed }
}

// 마감 조건 → 서버에 넘길 '남은 일수 상한'.
// 필터링 자체는 서버가 하므로 프론트는 값만 변환한다.
export function deadlineToWithinDays(deadline: DeadlineFilter): number | undefined {
  switch (deadline) {
    case 'week':
      return 7
    case 'imminent':
      return 3
    case 'all':
      return undefined
  }
}

export function hasActiveFilter(filter: RecruitmentFilter): boolean {
  return (
    filter.query.length > 0 ||
    filter.categories.length > 0 ||
    filter.types.length > 0 ||
    filter.deadline !== 'all'
  )
}

export type SortKey = CampaignSortKey

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'deadline', label: '마감 임박순' },
  { value: 'popular', label: '조회순' },
  { value: 'latest', label: '최신 등록순' },
]

/**
 * 클라이언트 정렬. 목록은 서버가 정렬해 내려주지만, 캘린더에서 특정 날짜를 골랐을 때는
 * 이미 받아둔 그 달의 공고를 다시 정렬해 보여주므로 이 함수를 쓴다.
 */
export function sortRecruitments(
  recruitments: Recruitment[],
  sort: SortKey,
): Recruitment[] {
  const list = [...recruitments]
  switch (sort) {
    case 'deadline':
      return list.sort((a, b) => a.daysRemaining - b.daysRemaining)
    case 'popular':
      return list.sort((a, b) => b.viewCount - a.viewCount)
    case 'latest':
      return list.sort((a, b) =>
        b.recruitStartDate.localeCompare(a.recruitStartDate),
      )
  }
}
