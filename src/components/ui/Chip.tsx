import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type ChipColor = 'orange' | 'blue' | 'rose'

interface ChipProps {
  selected: boolean
  onClick: () => void
  children: ReactNode
  color?: ChipColor
  disabled?: boolean
  className?: string
}

const selectedStyles: Record<ChipColor, string> = {
  orange: 'border-orange-300 bg-orange-50 text-orange-700',
  blue: 'border-blue-300 bg-blue-50 text-blue-700',
  rose: 'border-rose-300 bg-rose-50 text-rose-700',
}

export default function Chip({
  selected,
  onClick,
  children,
  color = 'orange',
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
          ? selectedStyles[color]
          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50',
        className,
      )}
    >
      {children}
    </button>
  )
}
