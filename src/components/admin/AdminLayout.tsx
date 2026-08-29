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

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold no-underline transition-colors',
    isActive
      ? 'bg-orange-50 text-orange-600'
      : 'text-stone-600 hover:bg-stone-100',
  )

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    showToast('로그아웃되었습니다.', 'success')
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-stone-200 bg-white px-4 py-6 md:flex">
        <div className="px-2 mb-8">
          <span className="text-lg font-extrabold tracking-tight text-orange-500">
            bookpool
          </span>
          <p className="mt-0.5 text-xs font-medium text-stone-400">백오피스</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-3">
          <span className="text-sm font-semibold text-stone-700 md:hidden">
            bookpool 백오피스
          </span>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-stone-500">
              {admin?.name ?? '관리자'}님
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-4xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
