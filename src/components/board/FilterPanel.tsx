import {
  CATEGORIES,
  RECRUITMENT_TYPE_OPTIONS,
  type RecruitmentType,
} from '@/types/recruitment'
import type { RecruitmentFilter } from '@/lib/recruitmentFilter'
import Chip from '@/components/ui/Chip'
import FilterDropdown from './FilterDropdown'
import {
  DEADLINE_OPTIONS,
  TYPE_FILTER_COLOR,
  CATEGORY_FILTER_COLOR,
  DEADLINE_FILTER_COLOR,
  type DeadlineValue,
} from './filterMeta'

interface FilterPanelProps {
  filter: RecruitmentFilter
  onChange: (next: RecruitmentFilter) => void
}

function toggleArray<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export default function FilterPanel({ filter, onChange }: FilterPanelProps) {
  const toggleCategory = (cat: string) =>
    onChange({ ...filter, categories: toggleArray(filter.categories, cat) })

  const toggleType = (type: RecruitmentType) =>
    onChange({ ...filter, types: toggleArray(filter.types, type) })

  const toggleDeadline = (value: DeadlineValue) =>
    onChange({ ...filter, deadline: filter.deadline === value ? 'all' : value })

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <FilterDropdown
        label="공고 유형"
        selectedCount={filter.types.length}
        color={TYPE_FILTER_COLOR}
      >
        <div className="flex flex-wrap gap-1.5">
          {RECRUITMENT_TYPE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              selected={filter.types.includes(opt.value)}
              color={TYPE_FILTER_COLOR}
              onClick={() => toggleType(opt.value)}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </FilterDropdown>

      <FilterDropdown
        label="카테고리"
        selectedCount={filter.categories.length}
        color={CATEGORY_FILTER_COLOR}
      >
        <div className="flex flex-wrap gap-1.5 max-w-[260px]">
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              selected={filter.categories.includes(cat)}
              color={CATEGORY_FILTER_COLOR}
              onClick={() => toggleCategory(cat)}
            >
              {cat}
            </Chip>
          ))}
        </div>
      </FilterDropdown>

      <FilterDropdown
        label="마감 조건"
        selectedCount={filter.deadline !== 'all' ? 1 : 0}
        color={DEADLINE_FILTER_COLOR}
      >
        <div className="flex flex-wrap gap-1.5">
          {DEADLINE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              selected={filter.deadline === opt.value}
              color={DEADLINE_FILTER_COLOR}
              onClick={() => toggleDeadline(opt.value)}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </FilterDropdown>
    </div>
  )
}
