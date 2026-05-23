import { cn } from '@/lib/cn'

interface BadgeProps {
  label: string
  className?: string
}

const badgeStyles: Record<string, string> = {
  Reviewer: 'border-orange-200 text-orange-700 bg-orange-50',
  'Beta Reader': 'border-stone-300 text-stone-600 bg-stone-50',
}

const displayLabels: Record<string, string> = {
  Reviewer: '서평단',
  'Beta Reader': '베타리더',
}

export default function Badge({ label, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border',
        badgeStyles[label] ?? 'border-gray-300 text-gray-600 bg-white',
        className,
      )}
    >
      {displayLabels[label] ?? label}
    </span>
  )
}
