import { Search, X } from 'lucide-react'
import { cn } from '@/lib/cn'

interface SearchInputProps {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  className?: string
  variant?: 'default' | 'subtle'
}

const variantStyles = {
  default:
    'bg-stone-100 border-stone-100 hover:bg-stone-50 hover:border-stone-200',
  subtle: 'bg-stone-50 border-stone-100',
}

export default function SearchInput({
  value,
  onChange,
  placeholder = '검색',
  className,
  variant = 'default',
}: SearchInputProps) {
  return (
    <label
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-3.5 py-2 border transition-all',
        variantStyles[variant],
        'focus-within:bg-white focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100',
        className,
      )}
    >
      <Search className="h-4 w-4 text-stone-400 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full min-w-0 bg-transparent text-sm text-stone-700 placeholder-stone-400 outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="검색어 지우기"
          className="p-0.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 shrink-0 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </label>
  )
}
