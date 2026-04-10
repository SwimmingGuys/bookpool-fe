import { useState } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
}

export default function SearchBar({ placeholder = 'Search...', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(query)
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/30 px-4 py-2 w-full max-w-md">
      <Search className="h-4 w-4 text-stone-400 shrink-0" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-stone-700 placeholder-stone-400 outline-none"
      />
    </div>
  )
}
