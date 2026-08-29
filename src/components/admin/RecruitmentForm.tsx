import { useId, useState } from 'react'
import { cn } from '@/lib/cn'
import FormField from '@/components/auth/FormField'
import Button from '@/components/ui/Button'
import ImageUpload from '@/components/admin/ImageUpload'
import {
  BOOK_FORMAT_OPTIONS,
  CATEGORIES,
  RECRUITMENT_SOURCE_OPTIONS,
  RECRUITMENT_TYPE_OPTIONS,
  REVIEW_CHANNEL_OPTIONS,
  type BookFormat,
  type PublishStatus,
  type RecruitmentSource,
  type RecruitmentType,
  type ReviewChannel,
} from '@/types/recruitment'
import type { RecruitmentInput } from '@/lib/adminRecruitments'
import { TODAY_ISO } from '@/lib/date'
import Chip from '@/components/ui/Chip'

interface RecruitmentFormProps {
  initial?: Partial<RecruitmentInput>
  submitLabel: string
  submitting?: boolean
  onSubmit: (input: RecruitmentInput, publishStatus: PublishStatus) => void
  onCancel: () => void
}

const inputClass =
  'w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 outline-none transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-100'

type DateField = 'recruitStartDate' | 'recruitEndDate' | 'announcementDate'

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function toggleArray<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

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
  const [category, setCategory] = useState<string>(initial?.category ?? CATEGORIES[0])
  const [badgeLabel, setBadgeLabel] = useState<RecruitmentType>(
    initial?.badgeLabel ?? 'Reviewer',
  )
  const [recruitStartDate, setRecruitStartDate] = useState(
    initial?.recruitStartDate ?? TODAY_ISO,
  )
  const [recruitEndDate, setRecruitEndDate] = useState(initial?.recruitEndDate ?? '')
  const [announcementDate, setAnnouncementDate] = useState(
    initial?.announcementDate ?? '',
  )
  const [description, setDescription] = useState(initial?.description ?? '')
  const [coverImage, setCoverImage] = useState<string | undefined>(initial?.coverImage)

  // 신청·모집 조건
  const [applyUrl, setApplyUrl] = useState(initial?.applyUrl ?? '')
  const [capacity, setCapacity] = useState(
    initial?.capacity !== undefined ? String(initial.capacity) : '',
  )
  const [bookFormat, setBookFormat] = useState<BookFormat>(
    initial?.bookFormat ?? 'paper',
  )
  const [reviewChannels, setReviewChannels] = useState<ReviewChannel[]>(
    initial?.reviewChannels ?? ['blog'],
  )
  const [reviewDueDate, setReviewDueDate] = useState(initial?.reviewDueDate ?? '')
  const [requirements, setRequirements] = useState(initial?.requirements ?? '')

  // 수집 출처
  const [source, setSource] = useState<RecruitmentSource>(initial?.source ?? 'manual')
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? '')

  const [error, setError] = useState<string | null>(null)

  const buildInput = (): RecruitmentInput | null => {
    if (
      !title.trim() ||
      !bookTitle.trim() ||
      !publisher.trim() ||
      !recruitStartDate ||
      !recruitEndDate ||
      !announcementDate ||
      !description.trim()
    ) {
      setError('표지·선택 항목을 제외한 모든 항목을 입력해주세요.')
      return null
    }
    if (recruitEndDate < recruitStartDate) {
      setError('모집 마감일은 시작일보다 빠를 수 없습니다.')
      return null
    }
    if (announcementDate < recruitEndDate) {
      setError('발표일은 모집 마감일보다 빠를 수 없습니다.')
      return null
    }
    if (reviewDueDate && reviewDueDate < announcementDate) {
      setError('서평 제출 기한은 발표일보다 빠를 수 없습니다.')
      return null
    }
    if (applyUrl.trim() && !isValidHttpUrl(applyUrl.trim())) {
      setError('신청 링크는 http(s):// 형식으로 입력해주세요.')
      return null
    }
    if (sourceUrl.trim() && !isValidHttpUrl(sourceUrl.trim())) {
      setError('원문 링크는 http(s):// 형식으로 입력해주세요.')
      return null
    }
    const capacityValue = capacity.trim() ? Number(capacity) : undefined
    if (capacityValue !== undefined && (!Number.isFinite(capacityValue) || capacityValue < 1)) {
      setError('모집 인원은 1 이상의 숫자로 입력해주세요.')
      return null
    }

    setError(null)
    return {
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
      applyUrl: applyUrl.trim() || undefined,
      capacity: capacityValue,
      bookFormat,
      reviewChannels,
      reviewDueDate: reviewDueDate || undefined,
      requirements: requirements.trim() || undefined,
      source,
      sourceUrl: sourceUrl.trim() || undefined,
      publishStatus: initial?.publishStatus ?? 'published',
    }
  }

  const handleSave = (publishStatus: PublishStatus) => {
    const input = buildInput()
    if (!input) return
    onSubmit({ ...input, publishStatus }, publishStatus)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSave('published')
  }

  const dateFields: {
    key: DateField
    label: string
    value: string
    set: (v: string) => void
  }[] = [
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
        <Select
          id={`${baseId}-category`}
          label="카테고리"
          value={category}
          onChange={setCategory}
          disabled={submitting}
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
        <Select
          id={`${baseId}-type`}
          label="모집 유형"
          value={badgeLabel}
          onChange={(v) => setBadgeLabel(v as RecruitmentType)}
          disabled={submitting}
          options={RECRUITMENT_TYPE_OPTIONS}
        />
      </div>

      <fieldset className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {dateFields.map(({ key, label, value, set }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label
              htmlFor={`${baseId}-${key}`}
              className="text-sm font-semibold text-stone-700"
            >
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
        <label
          htmlFor={`${baseId}-description`}
          className="text-sm font-semibold text-stone-700"
        >
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

      {/* ---------- 신청 · 모집 조건 ---------- */}
      <fieldset className="rounded-xl border border-stone-200 p-5">
        <legend className="px-1.5 text-sm font-semibold text-stone-700">
          신청 · 모집 조건
        </legend>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${baseId}-applyUrl`}
            className="text-sm font-semibold text-stone-700"
          >
            신청 링크
          </label>
          <input
            id={`${baseId}-applyUrl`}
            type="url"
            inputMode="url"
            placeholder="https://forms.gle/..."
            value={applyUrl}
            onChange={(e) => setApplyUrl(e.target.value)}
            disabled={submitting}
            className={inputClass}
          />
          <p className="text-xs text-stone-400">
            비워두면 상세 페이지의 신청 버튼이 비활성화됩니다.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`${baseId}-capacity`}
              className="text-sm font-semibold text-stone-700"
            >
              모집 인원
            </label>
            <input
              id={`${baseId}-capacity`}
              type="number"
              min={1}
              placeholder="예: 10"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              disabled={submitting}
              className={inputClass}
            />
          </div>

          <Select
            id={`${baseId}-bookFormat`}
            label="제공 도서"
            value={bookFormat}
            onChange={(v) => setBookFormat(v as BookFormat)}
            disabled={submitting}
            options={BOOK_FORMAT_OPTIONS}
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`${baseId}-reviewDueDate`}
              className="text-sm font-semibold text-stone-700"
            >
              서평 제출 기한
            </label>
            <input
              id={`${baseId}-reviewDueDate`}
              type="date"
              value={reviewDueDate}
              onChange={(e) => setReviewDueDate(e.target.value)}
              disabled={submitting}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-stone-700">서평 등록 채널</span>
          <div className="flex flex-wrap gap-1.5">
            {REVIEW_CHANNEL_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                selected={reviewChannels.includes(opt.value)}
                onClick={() =>
                  setReviewChannels((prev) => toggleArray(prev, opt.value))
                }
              >
                {opt.label}
              </Chip>
            ))}
          </div>
          <p className="text-xs text-stone-400">
            의무 채널을 명시하지 않으면 참여자와 분쟁이 생기기 쉽습니다.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-1.5">
          <label
            htmlFor={`${baseId}-requirements`}
            className="text-sm font-semibold text-stone-700"
          >
            신청 자격
          </label>
          <textarea
            id={`${baseId}-requirements`}
            rows={3}
            placeholder="예: 블로그 운영 3개월 이상, 서평 3건 이상 작성 경험"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            disabled={submitting}
            className={cn(inputClass, 'resize-y')}
          />
        </div>
      </fieldset>

      {/* ---------- 수집 출처 ---------- */}
      <fieldset className="rounded-xl border border-stone-200 p-5">
        <legend className="px-1.5 text-sm font-semibold text-stone-700">
          수집 출처
        </legend>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Select
            id={`${baseId}-source`}
            label="출처"
            value={source}
            onChange={(v) => setSource(v as RecruitmentSource)}
            disabled={submitting}
            options={RECRUITMENT_SOURCE_OPTIONS}
          />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`${baseId}-sourceUrl`}
              className="text-sm font-semibold text-stone-700"
            >
              원문 링크
            </label>
            <input
              id={`${baseId}-sourceUrl`}
              type="url"
              inputMode="url"
              placeholder="https://instagram.com/p/..."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              disabled={submitting}
              className={inputClass}
            />
          </div>
        </div>
      </fieldset>

      {error && <p className="text-sm font-medium text-red-500">{error}</p>}

      <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-5">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={submitting}
        >
          취소
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleSave('draft')}
          disabled={submitting}
        >
          검수 대기로 저장
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? '저장 중...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

function Select({
  id,
  label,
  value,
  onChange,
  disabled,
  options,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  options: readonly { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-stone-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={inputClass}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
