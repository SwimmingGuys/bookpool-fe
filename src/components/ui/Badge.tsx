import { cn } from '@/lib/cn'
import { RECRUITMENT_TYPE_LABELS, type RecruitmentType } from '@/types/recruitment'

interface BadgeProps {
  label: RecruitmentType
  className?: string
}

const badgeStyles: Record<RecruitmentType, string> = {
  Reviewer: 'border-orange-200 text-orange-700 bg-orange-50',
  'Beta Reader': 'border-stone-300 text-stone-600 bg-stone-50',
}

export default function Badge({ label, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border',
        badgeStyles[label],
        className,
      )}
    >
      {RECRUITMENT_TYPE_LABELS[label]}
    </span>
  )
}
