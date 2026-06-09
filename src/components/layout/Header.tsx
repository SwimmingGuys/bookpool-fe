import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, User, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/lib/auth'
import Logo from './Logo'
import NotificationBell from './NotificationBell'
import UserMenu from './UserMenu'

const NAV_LINKS = [
  { to: '/board', label: '보드' },
  { to: '/notice', label: '공지사항' },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative text-sm font-semibold no-underline transition-colors py-1',
    isActive ? 'text-orange-600' : 'text-stone-500 hover:text-stone-800',
  )

export default function Header() {
  const { isLoggedIn } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="relative bg-white border-b border-stone-200">
      <div className="flex items-center justify-between px-6 py-2.5">
        <div className="flex items-center gap-8">
          <button
            type="button"
            aria-label="메뉴 열기"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden p-2 -ml-2 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                {({ isActive }) => (
                  <>
                    {label}
                    {isActive && (
                      <span className="absolute -bottom-[11px] left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn && <NotificationBell />}
          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <Link
              to="/login"
              aria-label="로그인"
              className="p-2 rounded-lg text-stone-400 hover:text-orange-600 hover:bg-orange-50 transition-colors no-underline"
            >
              <User className="h-6 w-6" />
            </Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-stone-200 px-6 py-2">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'block rounded-lg px-3 py-2.5 text-sm font-semibold no-underline transition-colors',
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-stone-600 hover:bg-stone-100',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
