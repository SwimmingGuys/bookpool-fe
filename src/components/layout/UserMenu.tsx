import { useCallback, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  UserCog,
  ClipboardList,
  Bell,
  Headphones,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/lib/auth'
import { showToast } from '@/lib/toast'
import { useDismissOnOutside } from '@/lib/useDismissOnOutside'

const MENU_LINKS = [
  { to: '/mypage/account', label: '내 계정 관리', icon: UserCog },
  { to: '/mypage/recruitments', label: '공고 관리', icon: ClipboardList },
  { to: '/mypage/notifications', label: '알림 설정 관리', icon: Bell },
  { to: '/support', label: '문의 / 요청', icon: Headphones },
]

export default function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismissOnOutside(ref, open, close)

  if (!user) return null

  // 관리자 계정에만 백오피스 입구를 보여준다. 링크가 없으면 /admin 주소를 아는 사람만
  // 들어갈 수 있어, 공고를 직접 등록할 방법이 화면에 전혀 드러나지 않았다.
  // 관리자 세션은 사용자 세션과 분리돼 있어 여기서 눌러도 관리자 로그인을 한 번 더 거친다.
  const isAdmin = user.role === 'ADMIN'

  const handleLogout = () => {
    logout()
    setOpen(false)
    showToast('로그아웃되었습니다.', 'info')
    navigate('/', { replace: true })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="사용자 메뉴"
        className={cn(
          'p-2 rounded-lg transition-colors',
          open
            ? 'text-orange-600 bg-orange-50'
            : 'text-stone-400 hover:text-orange-600 hover:bg-orange-50',
        )}
      >
        <User className="h-6 w-6" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 z-30 w-60 rounded-xl border border-stone-200 bg-white shadow-lg overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-stone-100">
            <p className="text-sm font-bold text-stone-800 truncate">
              {user.nickname}
            </p>
            <p className="text-xs text-stone-500 truncate">{user.email}</p>
          </div>

          <div className="py-1">
            {MENU_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors no-underline"
              >
                <Icon className="w-4 h-4 text-stone-500" />
                {label}
              </Link>
            ))}
          </div>

          {isAdmin && (
            <Link
              to="/admin/recruitments"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 border-t border-stone-100 px-4 py-2.5 text-sm font-semibold text-stone-700 no-underline transition-colors hover:bg-stone-50"
            >
              <ShieldCheck className="w-4 h-4 text-stone-500" />
              관리자 페이지
            </Link>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors border-t border-stone-100"
          >
            <LogOut className="w-4 h-4 text-stone-500" />
            로그아웃
          </button>
        </div>
      )}
    </div>
  )
}
