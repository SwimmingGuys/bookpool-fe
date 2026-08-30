import { useId, useRef, useState, type ChangeEvent } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { showToast } from '@/lib/toast'
import { uploadImage } from '@/lib/api/uploads'
import { AuthError } from '@/lib/api/errors'

const MAX_FILE_SIZE = 5 * 1024 * 1024

interface ImageUploadProps {
  label?: string
  value?: string
  onChange: (url: string | undefined) => void
  className?: string
}

/**
 * 표지 이미지를 서버에 업로드하고 URL만 폼에 담는다.
 * 예전에는 data URL을 그대로 저장해 목록 응답마다 base64가 따라다녔다.
 */
export default function ImageUpload({
  label = '표지 이미지',
  value,
  onChange,
  className,
}: ImageUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드할 수 있습니다.', 'error')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      showToast('이미지 용량은 5MB 이하여야 합니다.', 'error')
      return
    }

    setUploading(true)
    try {
      const url = await uploadImage(file)
      onChange(url)
    } catch (err) {
      const message =
        err instanceof AuthError ? err.message : '이미지 업로드에 실패했습니다.'
      showToast(message, 'error')
    } finally {
      setUploading(false)
      // 같은 파일을 다시 골라도 change 이벤트가 발생하도록 값을 비운다.
      if (inputRef.current) inputRef.current.value = ''
    }
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
        disabled={uploading}
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
          disabled={uploading}
          className="flex h-52 w-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 bg-stone-50 text-stone-400 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="h-7 w-7 animate-spin" />
              <span className="text-xs font-medium">업로드 중...</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-7 w-7" />
              <span className="text-xs font-medium">이미지 선택</span>
            </>
          )}
        </button>
      )}
      <p className="text-xs text-stone-400">JPG·PNG, 최대 5MB</p>
    </div>
  )
}
