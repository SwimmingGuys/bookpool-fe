import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '@/lib/adminAuth'

interface RequireAdminProps {
  children: ReactNode
}

export default function RequireAdmin({ children }: RequireAdminProps) {
  const { isAdminLoggedIn } = useAdminAuth()
  const location = useLocation()

  if (!isAdminLoggedIn) {
    const redirect = `${location.pathname}${location.search}`
    return (
      <Navigate
        to={`/admin/login?redirect=${encodeURIComponent(redirect)}`}
        replace
      />
    )
  }

  return <>{children}</>
}
