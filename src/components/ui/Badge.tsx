import { cn } from '@/lib/cn'

interface BadgeProps {
  label: string
  className?: string
}

const badgeStyles: Record<string, string> = {
  Reviewer: 'border-orange-300 text-orange-600 bg-orange-50',
  'Beta Reader': 'border-violet-300 text-violet-600 bg-violet-50',
}

export default function Badge({ label, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border',
        badgeStyles[label] ?? 'border-gray-400 text-gray-700 bg-white',
        className,
      )}
    >
      {label}
    </span>
  )
}
