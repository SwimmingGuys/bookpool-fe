import { categoryLabel } from '@/types/recruitment'
import type {
  Category,
  DeadlineFilter,
  Recruitment,
  RecruitmentType,
} from '@/types/recruitment'
import type { CampaignSortKey } from '@/lib/api/campaigns'

export type { DeadlineFilter } from '@/types/recruitment'

export interface RecruitmentFilter {
  query: string
  categories: Category[]
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

// 마감 조건 → '남은 일수 상한'. 서버는 deadline=WEEK|IMMINENT를 그대로 받으므로
// 이 변환은 클라이언트에서 거르는 경우(즐겨찾기 보기)에만 쓴다.
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

/**
 * 클라이언트 필터. 목록 필터링은 서버가 하지만, 즐겨찾기 전용 보기처럼
 * 이미 전부 받아둔 유한한 목록에는 이 함수를 쓴다.
 */
export function filterRecruitments(
  recruitments: readonly Recruitment[],
  filter: RecruitmentFilter,
): Recruitment[] {
  const q = filter.query.trim().toLowerCase()
  const withinDays = deadlineToWithinDays(filter.deadline)

  return recruitments.filter((r) => {
    if (q.length > 0) {
      const haystack = [r.title, r.bookTitle, r.publisher, categoryLabel(r.category)]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }
    if (filter.categories.length > 0 && !filter.categories.includes(r.category)) {
      return false
    }
    if (filter.types.length > 0 && !filter.types.includes(r.badgeLabel)) {
      return false
    }
    if (withinDays !== undefined && r.daysRemaining > withinDays) return false
    return true
  })
}

export type SortKey = CampaignSortKey

// 서버가 정렬해 내려주므로 백엔드 SortKey에 있는 값만 노출한다.
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
