import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

// 페이지 폭은 이 세 가지만 쓴다. 예전엔 화면마다 2xl~7xl이 제각각이었다.
type PageWidth = 'narrow' | 'default' | 'wide'

const widthStyles: Record<PageWidth, string> = {
  narrow: 'max-w-3xl', // 읽는 화면 — 공지·문의·알림
  default: 'max-w-5xl', // 폼·상세 — 마이페이지·공고 상세
  wide: 'max-w-7xl', // 목록/캘린더 — 보드·출판사
}

interface PageContainerProps {
  width?: PageWidth
  children: ReactNode
  className?: string
}

/**
 * 모든 페이지의 바깥 여백을 한곳에서 정한다.
 * 모바일에서는 px-4, sm 이상에서 px-6으로 늘린다.
 */
export default function PageContainer({
  width = 'default',
  children,
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 py-8 sm:px-6 sm:py-10',
        widthStyles[width],
        className,
      )}
    >
      {children}
    </div>
  )
}
