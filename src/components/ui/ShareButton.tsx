import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { showToast } from '@/lib/toast'

interface ShareButtonProps {
  title: string
  text?: string
  className?: string
}

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch {
    // 아래 폴백으로 넘어간다.
  }
  // clipboard API를 쓸 수 없는 환경(비 HTTPS 등) 폴백
  try {
    const area = document.createElement('textarea')
    area.value = value
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}

/**
 * 공고 링크 공유. 모바일에서는 OS 공유 시트를, 데스크톱에서는 링크 복사를 쓴다.
 * 공고는 카톡·인스타로 링크가 퍼지는 게 주 유입 경로라 상세에 상시 노출한다.
 */
export default function ShareButton({ title, text, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return
      } catch (err) {
        // 사용자가 공유 시트를 닫은 경우는 실패로 다루지 않는다.
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    }

    const ok = await copyToClipboard(url)
    if (!ok) {
      showToast('링크 복사에 실패했습니다.', 'error')
      return
    }
    setCopied(true)
    showToast('링크를 복사했습니다.', 'success')
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="공유하기"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-2 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-700',
        className,
      )}
    >
      {copied ? (
        <Check className="h-4 w-4 text-orange-500" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
    </button>
  )
}
