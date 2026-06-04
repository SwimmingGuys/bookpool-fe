import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  RECRUITMENT_TYPE_OPTIONS,
  type RecruitmentType,
} from '@/types/recruitment'
import type { DeadlineFilter, RecruitmentFilter } from '@/lib/recruitmentFilter'

interface ActiveFilterTagsProps {
  filter: RecruitmentFilter
  onChange: (next: RecruitmentFilter) => void
  onClearQuery?: () => void
  className?: string
}

type DeadlineValue = Exclude<DeadlineFilter, 'all'>

const DEADLINE_LABELS: Record<DeadlineValue, string> = {
  week: '일주일 이내',
  imminent: '마감 임박 (D-3)',
}

const TYPE_LABELS: Record<RecruitmentType, string> = Object.fromEntries(
  RECRUITMENT_TYPE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<RecruitmentType, string>

const tagStyles = {
  orange: 'bg-orange-50/80 border-orange-200/70 text-orange-700',
  blue: 'bg-blue-50/80 border-blue-200/70 text-blue-700',
  rose: 'bg-rose-50/80 border-rose-200/70 text-rose-700',
  stone: 'bg-stone-100/80 border-stone-200 text-stone-600',
} as const

type TagColor = keyof typeof tagStyles

export default function ActiveFilterTags({
  filter,
  onChange,
  onClearQuery,
  className,
}: ActiveFilterTagsProps) {
  const deadlineActive = filter.deadline !== 'all'
  const hasFilters =
    filter.categories.length > 0 || filter.types.length > 0 || deadlineActive
  const query = filter.query.trim()
  const hasQuery = query.length > 0 && Boolean(onClearQuery)

  if (!hasFilters && !hasQuery) return null

  const removeCategory = (cat: string) =>
    onChange({ ...filter, categories: filter.categories.filter((c) => c !== cat) })

  const removeType = (type: RecruitmentType) =>
    onChange({ ...filter, types: filter.types.filter((t) => t !== type) })

  const clearDeadline = () => onChange({ ...filter, deadline: 'all' })

  const reset = () =>
    onChange({ ...filter, categories: [], types: [], deadline: 'all' })

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {hasQuery && (
        <SelectedTag color="stone" onRemove={onClearQuery!}>
          검색: {query}
        </SelectedTag>
      )}
      {filter.types.map((type) => (
        <SelectedTag key={`t-${type}`} color="blue" onRemove={() => removeType(type)}>
          {TYPE_LABELS[type]}
        </SelectedTag>
      ))}
      {filter.categories.map((cat) => (
        <SelectedTag
          key={`c-${cat}`}
          color="orange"
          onRemove={() => removeCategory(cat)}
        >
          {cat}
        </SelectedTag>
      ))}
      {deadlineActive && (
        <SelectedTag color="rose" onRemove={clearDeadline}>
          {DEADLINE_LABELS[filter.deadline as DeadlineValue]}
        </SelectedTag>
      )}
      {hasFilters && (
        <button
          type="button"
          onClick={reset}
          className="text-xs font-medium text-stone-500 hover:text-stone-800 ml-0.5 underline-offset-2 hover:underline"
        >
          필터 초기화
        </button>
      )}
    </div>
  )
}

function SelectedTag({
  onRemove,
  children,
  color,
}: {
  onRemove: () => void
  children: React.ReactNode
  color: TagColor
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
