import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface AuthLayoutProps {
  title: string
  children: ReactNode
  footer?: ReactNode
}

export default function AuthLayout({ title, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 py-12">
      <Link
        to="/"
        className="text-2xl font-extrabold text-orange-500 no-underline mb-8 tracking-tight"
      >
        bookpool
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-stone-200 px-8 py-9">
        <h1 className="text-2xl font-bold text-stone-800 mb-7">{title}</h1>

        {children}

        {footer && (
          <div className="mt-6 pt-5 border-t border-stone-100 text-center text-sm text-stone-500">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
