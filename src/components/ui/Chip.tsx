import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ChipProps {
  selected: boolean
  onClick: () => void
  children: ReactNode
  disabled?: boolean
  className?: string
}

export default function Chip({
  selected,
  onClick,
  children,
  disabled,
  className,
}: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        selected
          ? 'border-orange-300 bg-orange-50 text-orange-700'
          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50',
        className,
      )}
    >
      {children}
    </button>
  )
}
