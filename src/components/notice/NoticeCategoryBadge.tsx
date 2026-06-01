import { cn } from '@/lib/cn'
import { NOTICE_CATEGORY_LABELS, type NoticeCategory } from '@/types/notice'

// 은은한 파스텔 톤 — 배경 50 / 테두리 100 / 텍스트 700로 채도를 낮춰 튀지 않게
const categoryStyles: Record<NoticeCategory, string> = {
  update: 'border-orange-100 bg-orange-50 text-orange-700',
  policy: 'border-sky-100 bg-sky-50 text-sky-700',
  maintenance: 'border-amber-100 bg-amber-50 text-amber-700',
  event: 'border-rose-100 bg-rose-50 text-rose-700',
  general: 'border-stone-200 bg-stone-100 text-stone-600',
}

interface NoticeCategoryBadgeProps {
  category: NoticeCategory
  className?: string
}

export default function NoticeCategoryBadge({
  category,
  className,
}: NoticeCategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
        categoryStyles[category],
        className,
      )}
    >
      {NOTICE_CATEGORY_LABELS[category]}
    </span>
  )
}
