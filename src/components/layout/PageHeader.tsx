import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/cn'

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  // 목록으로 돌아가는 링크. 상세 화면에서 쓴다.
  backTo?: string
  backLabel?: string
  // 우측 액션 영역 (버튼·정렬 등)
  actions?: ReactNode
  className?: string
}

/**
 * 페이지 제목 영역. 화면마다 h1이 있기도 없기도 하고 크기도 달라서 하나로 맞춘다.
 * 모바일에서는 액션이 제목 아래로 떨어진다.
 */
export default function PageHeader({
  title,
  description,
  backTo,
  backLabel = '돌아가기',
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('mb-6 sm:mb-8', className)}>
      {backTo && (
        <Link
          to={backTo}
          className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 no-underline transition-colors hover:text-stone-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight text-stone-800 sm:text-2xl">
            {title}
          </h1>
          {description && (
            <div className="mt-1.5 text-sm leading-relaxed text-stone-500">
              {description}
            </div>
          )}
        </div>

        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
