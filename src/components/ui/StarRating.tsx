import { Star } from 'lucide-react'
import { cn } from '@/lib/cn'

interface StarRatingProps {
  value: number
  // 값을 주면 클릭으로 별점을 고를 수 있다.
  onChange?: (value: number) => void
  size?: 'sm' | 'md'
  className?: string
}

const RATINGS = [1, 2, 3, 4, 5]

const sizeStyles = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
} as const

export default function StarRating({
  value,
  onChange,
  size = 'sm',
  className,
}: StarRatingProps) {
  const readOnly = !onChange

  if (readOnly) {
    return (
      <span
        className={cn('inline-flex items-center gap-0.5', className)}
        aria-label={`5점 만점에 ${value}점`}
      >
        {RATINGS.map((n) => (
          <Star
            key={n}
            aria-hidden
            className={cn(
              sizeStyles[size],
              n <= value ? 'fill-amber-400 text-amber-400' : 'text-stone-300',
            )}
          />
        ))}
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} role="radiogroup">
      {RATINGS.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={n === value}
          aria-label={`${n}점`}
          onClick={() => onChange(n)}
          className="rounded p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              sizeStyles[size],
              n <= value ? 'fill-amber-400 text-amber-400' : 'text-stone-300',
            )}
          />
        </button>
      ))}
    </span>
  )
}
