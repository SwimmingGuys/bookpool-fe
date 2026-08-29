import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, User, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/lib/auth'
import Logo from './Logo'
import NotificationBell from './NotificationBell'
import UserMenu from './UserMenu'

// 헤더에는 서비스를 쓰는 흐름만 둔다.
// 공지사항·문의는 도움말에 가까워 푸터로 옮겼다.
const NAV_LINKS = [{ to: '/board', label: '보드' }]

// 모바일 메뉴에서는 헤더에 없는 도움말 링크도 함께 노출한다.
const MOBILE_SUPPORT_LINKS = [
  { to: '/notice', label: '공지사항' },
  { to: '/support', label: '문의 / 요청' },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative py-1 text-sm font-semibold no-underline transition-colors',
    isActive ? 'text-orange-600' : 'text-stone-500 hover:text-stone-800',
  )

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'block rounded-lg px-3 py-2.5 text-sm font-semibold no-underline transition-colors',
    isActive ? 'bg-orange-50 text-orange-600' : 'text-stone-600 hover:bg-stone-100',
  )

export default function Header() {
  const { isLoggedIn } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="relative border-b border-stone-200 bg-white">
      <div className="flex items-center justify-between px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-8">
          <button
            type="button"
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="-ml-2 rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                {({ isActive }) => (
                  <>
                    {label}
                    {isActive && (
                      <span className="absolute -bottom-[11px] left-0 right-0 h-0.5 rounded-full bg-orange-500" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          {isLoggedIn && <NotificationBell />}
          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <Link
              to="/login"
              aria-label="로그인"
              className="rounded-lg p-2 text-stone-400 no-underline transition-colors hover:bg-orange-50 hover:text-orange-600"
            >
              <User className="h-6 w-6" />
            </Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-stone-200 px-4 py-2 sm:px-6 md:hidden">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={mobileLinkClass}
            >
              {label}
            </NavLink>
          ))}

          <div className="my-2 border-t border-stone-100" />

          {MOBILE_SUPPORT_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={mobileLinkClass}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
