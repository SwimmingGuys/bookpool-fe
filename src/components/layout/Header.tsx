import { Link } from 'react-router-dom'
import { Bell, User } from 'lucide-react'
import Logo from './Logo'
import SearchBar from './SearchBar'

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
      <div className="flex items-center gap-8">
        <Logo />
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/board"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 no-underline"
          >
            보드
          </Link>
          <Link
            to="/notice"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 no-underline"
          >
            공지사항
          </Link>
        </nav>
      </div>

      <div className="hidden md:block flex-1 max-w-md mx-8">
        <SearchBar />
      </div>

      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-700">
          <Bell className="h-5 w-5" />
        </button>
        <button className="text-gray-500 hover:text-gray-700">
          <User className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
