import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { validateQuery, MAX_QUERY_LENGTH } from '@/lib/recruitmentFilter'

interface BoardSearchBarProps {
  // URL에 반영된(확정된) 검색어. 헤더 검색·뒤로가기로 바뀌면 입력값을 다시 맞춘다.
  committedQuery: string
  // 검증을 통과한 검색어를 확정한다. 빈 문자열이면 검색 해제.
  onCommit: (query: string) => void
  className?: string
}

export default function BoardSearchBar({
  committedQuery,
  onCommit,
  className,
}: BoardSearchBarProps) {
  const [draft, setDraft] = useState(committedQuery)
  const [error, setError] = useState<string | null>(null)

  // 외부에서 확정 검색어가 바뀌면(헤더 검색·뒤로가기·칩 해제) 입력값을 동기화한다.
  const [syncedQuery, setSyncedQuery] = useState(committedQuery)
  if (committedQuery !== syncedQuery) {
    setSyncedQuery(committedQuery)
    setDraft(committedQuery)
    setError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = validateQuery(draft)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError(null)
    onCommit(result.query)
  }

  const handleClear = () => {
    setDraft('')
    setError(null)
    onCommit('')
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <label
        className={cn(
          'flex items-center gap-2.5 rounded-lg px-3.5 py-2 transition-all border',
          'bg-stone-100 border-stone-100',
          'hover:bg-stone-50 hover:border-stone-200',
          'focus-within:bg-white focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100',
        )}
      >
        <Search className="h-4 w-4 text-stone-400 shrink-0" />
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MAX_QUERY_LENGTH))}
          placeholder="제목, 도서, 출판사 검색"
          aria-label="공고 검색"
          className="w-full min-w-0 bg-transparent text-sm text-stone-700 placeholder-stone-400 outline-none"
        />
        {draft ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-0.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 shrink-0 transition-colors"
            aria-label="검색어 지우기"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center justify-center text-[10px] font-semibold text-stone-400 bg-white border border-stone-200 rounded px-1.5 py-0.5 shrink-0">
            Enter
          </kbd>
        )}
      </label>
      {error && <p className="mt-1 text-xs text-red-500 px-1">{error}</p>}
    </form>
  )
}
