import { NavLink, Outlet } from 'react-router-dom'
import { Bell, ClipboardList, UserCog } from 'lucide-react'
import { cn } from '@/lib/cn'
import PageContainer from '@/components/layout/PageContainer'
import PageHeader from '@/components/layout/PageHeader'

// 그동안 마이페이지 하위 화면은 사용자 메뉴 드롭다운으로만 갈 수 있었다.
const TABS = [
  { to: '/mypage/account', label: '계정', icon: UserCog },
  { to: '/mypage/recruitments', label: '공고 · 서평', icon: ClipboardList },
  { to: '/mypage/notifications', label: '알림 설정', icon: Bell },
]

export default function MyPage() {
  return (
    <PageContainer>
      <PageHeader title="마이페이지" />

      {/* 모바일에서는 탭이 넘치면 가로로 스크롤된다 */}
      <nav
        aria-label="마이페이지"
        className="-mx-4 mb-6 overflow-x-auto scrollbar-none border-b border-stone-200 px-4 sm:mx-0 sm:px-0"
      >
        <div className="flex min-w-max items-center gap-1">
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'relative flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-sm font-semibold no-underline transition-colors',
                  isActive
                    ? 'text-orange-600'
                    : 'text-stone-500 hover:text-stone-800',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-4 w-4" />
                  {label}
                  {isActive && (
                    <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-orange-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <Outlet />
    </PageContainer>
  )
}
