import { cn } from '@/lib/cn'

interface BadgeProps {
  label: string
  className?: string
}

const badgeStyles: Record<string, string> = {
  Reviewer: 'border-amber-300 text-amber-800 bg-amber-50',
  'Beta Reader': 'border-orange-300 text-orange-800 bg-orange-50',
}

export default function Badge({ label, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border',
        badgeStyles[label] ?? 'border-stone-300 text-stone-700 bg-white',
        className,
      )}
    >
      {label}
    </span>
  )
}
