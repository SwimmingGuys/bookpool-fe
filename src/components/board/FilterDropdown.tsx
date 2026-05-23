import { useCallback, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useDismissOnOutside } from '@/lib/useDismissOnOutside'

export type FilterColor = 'orange' | 'blue' | 'rose'

interface FilterDropdownProps {
  label: string
  selectedCount: number
  color?: FilterColor
  children: React.ReactNode
}

const activeStyles: Record<FilterColor, string> = {
  orange: 'border-orange-200 bg-orange-50/70 text-orange-700',
  blue: 'border-blue-200 bg-blue-50/70 text-blue-700',
  rose: 'border-rose-200 bg-rose-50/70 text-rose-700',
}

const badgeStyles: Record<FilterColor, string> = {
  orange: 'bg-orange-100 text-orange-700',
  blue: 'bg-blue-100 text-blue-700',
  rose: 'bg-rose-100 text-rose-700',
}

export default function FilterDropdown({
  label,
  selectedCount,
  color = 'orange',
  children,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismissOnOutside(ref, open, close)

  const hasSelection = selectedCount > 0

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
          hasSelection
            ? activeStyles[color]
            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50',
        )}
      >
        <span>{label}</span>
        {hasSelection && (
          <span
            className={cn(
              'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold',
              badgeStyles[color],
            )}
          >
            {selectedCount}
          </span>
        )}
        <ChevronDown
          className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-20 min-w-[220px] rounded-xl border border-stone-200 bg-white shadow-lg p-3">
          {children}
        </div>
      )}
    </div>
  )
}
