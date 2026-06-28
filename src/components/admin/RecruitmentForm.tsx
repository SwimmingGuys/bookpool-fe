import { useId, useState } from 'react'
import { cn } from '@/lib/cn'
import FormField from '@/components/auth/FormField'
import Button from '@/components/ui/Button'
import ImageUpload from '@/components/admin/ImageUpload'
import {
  CATEGORIES,
  RECRUITMENT_TYPE_OPTIONS,
  type RecruitmentType,
} from '@/types/recruitment'
import type { RecruitmentInput } from '@/lib/adminRecruitments'
import { TODAY_ISO } from '@/lib/date'

interface RecruitmentFormProps {
  initial?: Partial<RecruitmentInput>
  submitLabel: string
  submitting?: boolean
  onSubmit: (input: RecruitmentInput) => void
  onCancel: () => void
}

const inputClass =
  'w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 outline-none transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-100'

type DateField = 'recruitStartDate' | 'recruitEndDate' | 'announcementDate'

export default function RecruitmentForm({
  initial,
  submitLabel,
  submitting,
  onSubmit,
  onCancel,
}: RecruitmentFormProps) {
  const baseId = useId()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [bookTitle, setBookTitle] = useState(initial?.bookTitle ?? '')
  const [publisher, setPublisher] = useState(initial?.publisher ?? '')
  const [category, setCategory] = useState<string>(
    initial?.category ?? CATEGORIES[0],
  )
  const [badgeLabel, setBadgeLabel] = useState<RecruitmentType>(
    initial?.badgeLabel ?? 'Reviewer',
  )
  const [recruitStartDate, setRecruitStartDate] = useState(
    initial?.recruitStartDate ?? TODAY_ISO,
  )
  const [recruitEndDate, setRecruitEndDate] = useState(
    initial?.recruitEndDate ?? '',
  )
  const [announcementDate, setAnnouncementDate] = useState(
    initial?.announcementDate ?? '',
  )
  const [description, setDescription] = useState(initial?.description ?? '')
  const [coverImage, setCoverImage] = useState<string | undefined>(
    initial?.coverImage,
  )
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !title.trim() ||
      !bookTitle.trim() ||
      !publisher.trim() ||
      !recruitStartDate ||
      !recruitEndDate ||
      !announcementDate ||
      !description.trim()
    ) {
      setError('표지를 제외한 모든 항목을 입력해주세요.')
      return
    }
    if (recruitEndDate < recruitStartDate) {
      setError('모집 마감일은 시작일보다 빠를 수 없습니다.')
      return
    }
    if (announcementDate < recruitEndDate) {
      setError('발표일은 모집 마감일보다 빠를 수 없습니다.')
      return
    }
    setError(null)
    onSubmit({
      title: title.trim(),
      bookTitle: bookTitle.trim(),
      publisher: publisher.trim(),
      category,
      badgeLabel,
      recruitStartDate,
      recruitEndDate,
      announcementDate,
      description: description.trim(),
      coverImage,
    })
  }

  const dateFields: { key: DateField; label: string; value: string; set: (v: string) => void }[] = [
    { key: 'recruitStartDate', label: '모집 시작일', value: recruitStartDate, set: setRecruitStartDate },
    { key: 'recruitEndDate', label: '모집 마감일', value: recruitEndDate, set: setRecruitEndDate },
    { key: 'announcementDate', label: '발표일', value: announcementDate, set: setAnnouncementDate },
  ]

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <FormField
        label="모집 제목"
        placeholder="예: 모던 리액트 Deep Dive 서평단 모집"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={submitting}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          label="도서명"
          placeholder="도서명을 입력하세요"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          disabled={submitting}
        />
        <FormField
          label="출판사"
          placeholder="출판사를 입력하세요"
          value={publisher}
          onChange={(e) => setPublisher(e.target.value)}
          disabled={submitting}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${baseId}-category`} className="text-sm font-semibold text-stone-700">
            카테고리
          </label>
          <select
            id={`${baseId}-category`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={submitting}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${baseId}-type`} className="text-sm font-semibold text-stone-700">
            모집 유형
          </label>
          <select
            id={`${baseId}-type`}
            value={badgeLabel}
            onChange={(e) => setBadgeLabel(e.target.value as RecruitmentType)}
            disabled={submitting}
            className={inputClass}
          >
            {RECRUITMENT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {dateFields.map(({ key, label, value, set }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label htmlFor={`${baseId}-${key}`} className="text-sm font-semibold text-stone-700">
              {label}
            </label>
            <input
              id={`${baseId}-${key}`}
              type="date"
              value={value}
              onChange={(e) => set(e.target.value)}
              disabled={submitting}
              className={inputClass}
            />
          </div>
        ))}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${baseId}-description`} className="text-sm font-semibold text-stone-700">
          도서 소개
        </label>
        <textarea
          id={`${baseId}-description`}
          rows={5}
          placeholder="도서 소개와 모집 안내를 입력하세요"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={submitting}
          className={cn(inputClass, 'resize-y')}
        />
      </div>

      <ImageUpload value={coverImage} onChange={setCoverImage} />

      {error && <p className="text-sm font-medium text-red-500">{error}</p>}

      <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-5">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          취소
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? '저장 중...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
