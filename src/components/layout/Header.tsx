import { NavLink } from 'react-router-dom'
import { Bell, User } from 'lucide-react'
import { cn } from '@/lib/cn'
import Logo from './Logo'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative text-sm font-semibold no-underline transition-colors py-1',
    isActive
      ? 'text-orange-600'
      : 'text-stone-500 hover:text-stone-800',
  )

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-2.5 bg-white border-b border-stone-200">
      <div className="flex items-center gap-8">
        <Logo />
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/board" className={navLinkClass}>
            {({ isActive }) => (
              <>
                보드
                {isActive && (
                  <span className="absolute -bottom-[11px] left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                )}
              </>
            )}
          </NavLink>
          <NavLink to="/notice" className={navLinkClass}>
            {({ isActive }) => (
              <>
                공지사항
                {isActive && (
                  <span className="absolute -bottom-[11px] left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                )}
              </>
            )}
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-stone-400 hover:text-orange-600 hover:bg-orange-50 transition-colors">
          <Bell className="h-6 w-6" />
        </button>
        <button className="p-2 rounded-lg text-stone-400 hover:text-orange-600 hover:bg-orange-50 transition-colors">
          <User className="h-6 w-6" />
        </button>
      </div>
    </header>
  )
}
