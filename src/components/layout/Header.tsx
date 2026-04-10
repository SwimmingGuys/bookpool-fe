import { Link } from 'react-router-dom'
import { Bell, User } from 'lucide-react'
import Logo from './Logo'
import SearchBar from './SearchBar'

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-2.5 bg-white border-b border-amber-100">
      <div className="flex items-center gap-8">
        <Logo />
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/board"
            className="text-sm font-medium text-stone-600 hover:text-amber-900 no-underline transition-colors"
          >
            보드
          </Link>
          <Link
            to="/notice"
            className="text-sm font-medium text-stone-600 hover:text-amber-900 no-underline transition-colors"
          >
            공지사항
          </Link>
        </nav>
      </div>

      <div className="hidden md:block flex-1 max-w-md mx-8">
        <SearchBar />
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-stone-500 hover:text-amber-800 hover:bg-amber-50 transition-colors">
          <Bell className="h-6 w-6" />
        </button>
        <button className="p-2 rounded-lg text-stone-500 hover:text-amber-800 hover:bg-amber-50 transition-colors">
          <User className="h-6 w-6" />
        </button>
      </div>
    </header>
  )
}
