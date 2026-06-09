import {
  RECRUITMENT_TYPE_OPTIONS,
  type RecruitmentType,
} from '@/types/recruitment'
import type { DeadlineFilter } from '@/lib/recruitmentFilter'
import type { FilterColor } from './FilterDropdown'

export type DeadlineValue = Exclude<DeadlineFilter, 'all'>

// 필터 종류별 색상 — FilterPanel(드롭다운·칩)과 ActiveFilterTags(태그)가 공유한다
export const TYPE_FILTER_COLOR: FilterColor = 'blue'
export const CATEGORY_FILTER_COLOR: FilterColor = 'orange'
export const DEADLINE_FILTER_COLOR: FilterColor = 'rose'

export const DEADLINE_OPTIONS: { value: DeadlineValue; label: string }[] = [
  { value: 'week', label: '일주일 이내' },
  { value: 'imminent', label: '마감 임박 (D-3)' },
]

export const DEADLINE_LABELS: Record<DeadlineValue, string> = Object.fromEntries(
  DEADLINE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<DeadlineValue, string>

export const TYPE_LABELS: Record<RecruitmentType, string> = Object.fromEntries(
  RECRUITMENT_TYPE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<RecruitmentType, string>
