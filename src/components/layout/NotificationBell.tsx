import { NavLink } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useNotifications } from '@/lib/notifications'

export default function NotificationBell() {
  const { unreadCount } = useNotifications()

  return (
    <NavLink
      to="/notifications"
      aria-label={
        unreadCount > 0 ? `알림 ${unreadCount}개 안 읽음` : '알림'
      }
      className={({ isActive }) =>
        cn(
          'relative p-2 rounded-lg transition-colors no-underline',
          isActive
            ? 'text-orange-600 bg-orange-50'
            : 'text-stone-400 hover:text-orange-600 hover:bg-orange-50',
        )
      }
    >
      <Bell className="h-6 w-6" />
      {unreadCount > 0 && (
        <span
          aria-hidden
          className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-orange-500 text-white text-[10px] font-bold tabular-nums"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </NavLink>
  )
}
