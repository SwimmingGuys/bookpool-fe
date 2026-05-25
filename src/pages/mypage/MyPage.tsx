import { Outlet, useLocation } from 'react-router-dom'
import { Bell, ClipboardList, UserCog, type LucideIcon } from 'lucide-react'

const SECTION_ICON: Record<string, LucideIcon> = {
  '/mypage/account': UserCog,
  '/mypage/recruitments': ClipboardList,
  '/mypage/notifications': Bell,
}

const SECTION_LABEL: Record<string, string> = {
  '/mypage/account': '내 계정 관리',
  '/mypage/recruitments': '공고 관리',
  '/mypage/notifications': '알림 설정 관리',
}

export default function MyPage() {
  const { pathname } = useLocation()
  const Icon = SECTION_ICON[pathname]
  const label = SECTION_LABEL[pathname]

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {Icon && (
        <div
          aria-label={label}
          title={label}
          className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 ring-1 ring-orange-100"
        >
          <Icon className="w-6 h-6" strokeWidth={2.25} />
        </div>
      )}
      <Outlet />
    </div>
  )
}
