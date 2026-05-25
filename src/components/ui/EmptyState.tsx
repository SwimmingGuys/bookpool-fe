import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed border-stone-300 bg-white py-12 text-center',
        className,
      )}
    >
      {Icon && <Icon className="mx-auto w-8 h-8 text-stone-300" />}
      <p className={cn('text-sm text-stone-600', Icon && 'mt-3')}>{title}</p>
      {description && (
        <div className="mt-1.5 text-xs text-stone-400 leading-relaxed">
          {description}
        </div>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}
