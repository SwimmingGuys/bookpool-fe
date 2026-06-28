import { useId, useRef, type ChangeEvent } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { showToast } from '@/lib/toast'

// data URL을 localStorage에 저장하므로 용량을 제한한다. (mock 한정 — 실제 API에서는 파일 업로드로 대체)
const MAX_FILE_SIZE = 1.5 * 1024 * 1024

interface ImageUploadProps {
  label?: string
  value?: string
  onChange: (dataUrl: string | undefined) => void
  className?: string
}

export default function ImageUpload({
  label = '표지 이미지',
  value,
  onChange,
  className,
}: ImageUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드할 수 있습니다.', 'error')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      showToast('이미지 용량은 1.5MB 이하여야 합니다.', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') onChange(reader.result)
    }
    reader.onerror = () => {
      showToast('이미지를 불러오지 못했습니다.', 'error')
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    onChange(undefined)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className="text-sm font-semibold text-stone-700">
        {label}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleSelect}
        className="hidden"
      />

      {value ? (
        <div className="relative w-40">
          <img
            src={value}
            alt="표지 미리보기"
            className="h-52 w-40 rounded-lg border border-stone-200 object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            aria-label="이미지 제거"
            className="absolute -right-2 -top-2 rounded-full bg-stone-800 p-1 text-white shadow hover:bg-stone-900"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-52 w-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 bg-stone-50 text-stone-400 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-500"
        >
          <ImagePlus className="h-7 w-7" />
          <span className="text-xs font-medium">이미지 선택</span>
        </button>
      )}
      <p className="text-xs text-stone-400">JPG·PNG, 최대 1.5MB</p>
    </div>
  )
}
