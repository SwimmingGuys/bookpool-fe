import type { Recruitment, RecruitmentType } from '@/types/recruitment'

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

export function filterRecruitments(
  recruitments: Recruitment[],
  filter: RecruitmentFilter,
): Recruitment[] {
  const q = filter.query.trim().toLowerCase()

  return recruitments.filter((r) => {
    if (q.length > 0) {
      const haystack = [r.title, r.bookTitle, r.publisher, r.category]
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

    if (filter.deadline === 'week' && r.daysRemaining > 7) return false
    if (filter.deadline === 'imminent' && r.daysRemaining > 3) return false

    return true
  })
}

export type SortKey = 'deadline' | 'popular'

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'deadline', label: '마감 임박순' },
  { value: 'popular', label: '조회순' },
]

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
  }
}
