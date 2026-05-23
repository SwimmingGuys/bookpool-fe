import { X } from 'lucide-react'
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

const DEADLINE_LABELS: Record<DeadlineValue, string> = {
  week: '일주일 이내',
  imminent: '마감 임박 (D-3)',
}

const TYPE_LABELS: Record<RecruitmentType, string> = Object.fromEntries(
  RECRUITMENT_TYPE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<RecruitmentType, string>

const tagStyles: Record<FilterColor, string> = {
  orange: 'bg-orange-50/80 border-orange-200/70 text-orange-700',
  blue: 'bg-blue-50/80 border-blue-200/70 text-blue-700',
  rose: 'bg-rose-50/80 border-rose-200/70 text-rose-700',
}

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

  const reset = () =>
    onChange({ ...filter, categories: [], types: [], deadline: 'all' })

  const removeCategory = (cat: string) =>
    onChange({ ...filter, categories: filter.categories.filter((c) => c !== cat) })

  const removeType = (type: RecruitmentType) =>
    onChange({ ...filter, types: filter.types.filter((t) => t !== type) })

  const clearDeadline = () => onChange({ ...filter, deadline: 'all' })

  const deadlineActive = filter.deadline !== 'all'
  const hasAny =
    filter.categories.length > 0 || filter.types.length > 0 || deadlineActive

  return (
    <div className="flex flex-col gap-2.5 items-start">
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
          selectedCount={deadlineActive ? 1 : 0}
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

      {hasAny && (
        <div className="flex items-center gap-2 flex-wrap">
          {filter.types.map((type) => (
            <SelectedTag
              key={`t-${type}`}
              color={TYPE_COLOR}
              onRemove={() => removeType(type)}
            >
              {TYPE_LABELS[type]}
            </SelectedTag>
          ))}
          {filter.categories.map((cat) => (
            <SelectedTag
              key={`c-${cat}`}
              color={CATEGORY_COLOR}
              onRemove={() => removeCategory(cat)}
            >
              {cat}
            </SelectedTag>
          ))}
          {deadlineActive && (
            <SelectedTag color={DEADLINE_COLOR} onRemove={clearDeadline}>
              {DEADLINE_LABELS[filter.deadline as DeadlineValue]}
            </SelectedTag>
          )}
          <button
            type="button"
            onClick={reset}
            className="text-xs font-medium text-stone-500 hover:text-stone-800 ml-0.5 underline-offset-2 hover:underline"
          >
            전체 초기화
          </button>
        </div>
      )}
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

function SelectedTag({
  onRemove,
  children,
  color,
}: {
  onRemove: () => void
  children: React.ReactNode
  color: FilterColor
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        tagStyles[color],
      )}
    >
      {children}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full hover:bg-white/60 p-0.5"
        aria-label="필터 제거"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}
