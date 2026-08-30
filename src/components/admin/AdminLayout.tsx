import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BookMarked, LogOut, Megaphone, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAdminAuth } from '@/lib/adminAuth'
import { showToast } from '@/lib/toast'

const NAV_LINKS = [
  { to: '/admin/recruitments', label: '서평단 관리', icon: BookMarked },
  { to: '/admin/notices', label: '공지사항 관리', icon: Megaphone },
  { to: '/admin/inquiries', label: '문의 관리', icon: MessageSquare },
]

const sideLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold no-underline transition-colors',
    isActive ? 'bg-orange-50 text-orange-600' : 'text-stone-600 hover:bg-stone-100',
  )

// 사이드바가 숨는 모바일에서는 상단 탭으로 같은 메뉴를 제공한다.
// 예전에는 모바일에서 백오피스 내비게이션이 아예 없었다.
const tabLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold no-underline transition-colors',
    isActive ? 'bg-orange-50 text-orange-600' : 'text-stone-600 hover:bg-stone-100',
  )

export default function AdminLayout() {
  const { admin, logout, linkedToUserSession } = useAdminAuth()
  const navigate = useNavigate()

  // 사용자 세션을 이어받아 들어온 경우엔 여기서 끊을 관리자 세션이 없다.
  // 로그아웃 대신 서비스 화면으로 나가고, 로그아웃은 서비스 헤더에 맡긴다.
  const handleExit = () => {
    if (linkedToUserSession) {
      navigate('/', { replace: true })
      return
    }
    logout()
    showToast('로그아웃되었습니다.', 'success')
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-stone-200 bg-white px-4 py-6 md:flex">
        <div className="mb-8 px-2">
          <span className="text-lg font-extrabold tracking-tight text-orange-500">
            bookpool
          </span>
          <p className="mt-0.5 text-xs font-medium text-stone-400">백오피스</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={sideLinkClass}>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-stone-200 bg-white">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <span className="text-sm font-semibold text-stone-700 md:hidden">
              bookpool 백오피스
            </span>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <span className="hidden text-sm text-stone-500 sm:inline">
                {admin?.name ?? '관리자'}님
              </span>
              <button
                type="button"
                onClick={handleExit}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {linkedToUserSession ? '서비스로 나가기' : '로그아웃'}
                </span>
              </button>
            </div>
          </div>

          <nav
            aria-label="백오피스 메뉴"
            className="flex gap-1 overflow-x-auto scrollbar-none border-t border-stone-100 px-4 py-2 sm:px-6 md:hidden"
          >
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={tabLinkClass}>
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto max-w-4xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
