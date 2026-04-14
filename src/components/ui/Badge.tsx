import { cn } from '@/lib/cn'

interface BadgeProps {
  label: string
  className?: string
}

const badgeStyles: Record<string, string> = {
  Reviewer: 'border-orange-200 text-orange-700 bg-orange-50',
  'Beta Reader': 'border-stone-300 text-stone-600 bg-stone-50',
}

export default function Badge({ label, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border',
        badgeStyles[label] ?? 'border-gray-300 text-gray-600 bg-white',
        className,
      )}
    >
      {label}
    </span>
  )
}
