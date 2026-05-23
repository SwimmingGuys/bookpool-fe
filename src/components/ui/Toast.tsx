import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { dismissToast, useToasts, type ToastVariant } from '@/lib/toast'

const VARIANT_STYLES: Record<ToastVariant, string> = {
  info: 'bg-stone-800 text-white',
  success: 'bg-emerald-600 text-white',
  warning: 'bg-amber-500 text-white',
  error: 'bg-red-500 text-white',
}

function VariantIcon({ variant }: { variant: ToastVariant }) {
  const className = 'w-4 h-4 shrink-0'
  switch (variant) {
    case 'success':
      return <CheckCircle2 className={className} />
    case 'warning':
      return <AlertTriangle className={className} />
    case 'error':
      return <XCircle className={className} />
    default:
      return <Info className={className} />
  }
}

export default function ToastContainer() {
  const toasts = useToasts()

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none"
      role="region"
      aria-label="알림"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'animate-toast-in pointer-events-auto flex items-center gap-2 pl-3.5 pr-2 py-2 rounded-full shadow-lg text-sm font-medium',
            VARIANT_STYLES[t.variant],
          )}
        >
          <VariantIcon variant={t.variant} />
          <span>{t.message}</span>
          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            aria-label="알림 닫기"
            className="ml-1 p-1 rounded-full hover:bg-white/15 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  )
}
