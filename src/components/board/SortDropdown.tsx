import { useCallback, useRef, useState } from 'react'
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useDismissOnOutside } from '@/lib/useDismissOnOutside'
import { SORT_OPTIONS, type SortKey } from '@/lib/recruitmentFilter'

interface SortDropdownProps {
  value: SortKey
  onChange: (value: SortKey) => void
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismissOnOutside(ref, open, close)

  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0]

  const handleSelect = (next: SortKey) => {
    onChange(next)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50"
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
        <span>{current.label}</span>
        <ChevronDown
          className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-20 min-w-[150px] rounded-xl border border-stone-200 bg-white shadow-lg p-1.5">
          {SORT_OPTIONS.map((opt) => {
            const active = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-stone-600 hover:bg-stone-50',
                )}
              >
                {opt.label}
                {active && <Check className="w-3.5 h-3.5" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
