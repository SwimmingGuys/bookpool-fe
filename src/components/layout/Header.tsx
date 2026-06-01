import { Link, NavLink } from 'react-router-dom'
import { User } from 'lucide-react'
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

  return (
    <header className="flex items-center justify-between px-6 py-2.5 bg-white border-b border-stone-200">
      <div className="flex items-center gap-8">
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
    </header>
  )
}
