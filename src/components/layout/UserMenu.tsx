import { useCallback, useRef, useState } from 'react'
import { User, LogOut } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/lib/auth'
import { showToast } from '@/lib/toast'
import { useDismissOnOutside } from '@/lib/useDismissOnOutside'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismissOnOutside(ref, open, close)

  if (!user) return null

  const handleLogout = () => {
    logout()
    setOpen(false)
    showToast('로그아웃되었습니다.', 'info')
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
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-stone-500" />
            로그아웃
          </button>
        </div>
      )}
    </div>
  )
}
