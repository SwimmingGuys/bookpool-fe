import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import Button from '@/components/ui/Button'

interface ErrorStateProps {
  title?: string
  description?: React.ReactNode
  onRetry?: () => void
  className?: string
}

// 조회 실패를 "결과 없음"과 구분해 보여주고 재시도 경로를 준다.
export default function ErrorState({
  title = '정보를 불러오지 못했습니다.',
  description = '잠시 후 다시 시도해 주세요.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border border-dashed border-stone-300 bg-white py-12 text-center',
        className,
      )}
    >
      <AlertCircle className="mx-auto h-8 w-8 text-stone-300" />
      <p className="mt-3 text-sm text-stone-600">{title}</p>
      {description && (
        <div className="mt-1.5 text-xs text-stone-400 leading-relaxed">
          {description}
        </div>
      )}
      {onRetry && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            다시 시도
          </Button>
        </div>
      )}
    </div>
  )
}
