import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface SectionCardProps {
  title?: string
  description?: string
  badge?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}

export default function SectionCard({
  title,
  description,
  badge,
  action,
  children,
  className,
}: SectionCardProps) {
  const hasHeader = title || description || action
  return (
    <section
      className={cn(
        'rounded-2xl border border-stone-200 bg-white p-6',
        className,
      )}
    >
      {hasHeader && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h2 className="text-base font-bold text-stone-800 flex items-center gap-2">
                <span className="truncate">{title}</span>
                {badge}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-xs text-stone-500">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  )
}
