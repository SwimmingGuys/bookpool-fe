import { cn } from '@/lib/cn'
import {
  CATEGORIES,
  RECRUITMENT_TYPE_OPTIONS,
  type RecruitmentType,
} from '@/types/recruitment'
import type { DeadlineFilter, RecruitmentFilter } from '@/lib/recruitmentFilter'
import FilterDropdown, { type FilterColor } from './FilterDropdown'

interface FilterPanelProps {
  filter: RecruitmentFilter
  onChange: (next: RecruitmentFilter) => void
}

const TYPE_COLOR: FilterColor = 'blue'
const CATEGORY_COLOR: FilterColor = 'orange'
const DEADLINE_COLOR: FilterColor = 'rose'

type DeadlineValue = Exclude<DeadlineFilter, 'all'>

const DEADLINE_OPTIONS: { value: DeadlineValue; label: string }[] = [
  { value: 'week', label: '일주일 이내' },
  { value: 'imminent', label: '마감 임박 (D-3)' },
]

const chipActiveStyles: Record<FilterColor, string> = {
  orange: 'border-orange-300 bg-orange-50/70 text-orange-700',
  blue: 'border-blue-300 bg-blue-50/70 text-blue-700',
  rose: 'border-rose-300 bg-rose-50/70 text-rose-700',
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
        color={TYPE_COLOR}
      >
        <div className="flex flex-wrap gap-1.5">
          {RECRUITMENT_TYPE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              selected={filter.types.includes(opt.value)}
              color={TYPE_COLOR}
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
        color={CATEGORY_COLOR}
      >
        <div className="flex flex-wrap gap-1.5 max-w-[260px]">
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              selected={filter.categories.includes(cat)}
              color={CATEGORY_COLOR}
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
        color={DEADLINE_COLOR}
      >
        <div className="flex flex-wrap gap-1.5">
          {DEADLINE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              selected={filter.deadline === opt.value}
              color={DEADLINE_COLOR}
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

function Chip({
  selected,
  onClick,
  children,
  color,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  color: FilterColor
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
        selected
          ? chipActiveStyles[color]
          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50',
      )}
    >
      {children}
    </button>
  )
}
