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

export function sortByDeadline(recruitments: Recruitment[]): Recruitment[] {
  return [...recruitments].sort((a, b) => a.daysRemaining - b.daysRemaining)
}
