import { useState } from 'react'
import { Headphones } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useInquiries } from '@/lib/inquiries'
import { showToast } from '@/lib/toast'
import {
  INQUIRY_STATUS_LABELS,
  INQUIRY_TYPE_LABELS,
  INQUIRY_TYPE_OPTIONS,
  type Inquiry,
  type InquiryType,
} from '@/types/inquiry'
import { formatMonthDay } from '@/lib/date'
import Chip from '@/components/ui/Chip'
import FormField from '@/components/auth/FormField'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import PageContainer from '@/components/layout/PageContainer'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

const TABS = [
  { value: 'write', label: '문의하기' },
  { value: 'history', label: '내 문의 내역' },
] as const
type TabValue = (typeof TABS)[number]['value']

const TITLE_MAX = 50
const CONTENT_MIN = 10
const CONTENT_MAX = 1000

type Field = 'title' | 'content'
type Errors = Partial<Record<Field, string>>

function validateTitle(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return '제목을 입력해주세요.'
  if (trimmed.length > TITLE_MAX) return `제목은 ${TITLE_MAX}자 이하로 입력해주세요.`
  return undefined
}

function validateContent(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return '내용을 입력해주세요.'
  if (trimmed.length < CONTENT_MIN) return `내용은 ${CONTENT_MIN}자 이상 입력해주세요.`
  if (trimmed.length > CONTENT_MAX) return `내용은 ${CONTENT_MAX}자 이하로 입력해주세요.`
  return undefined
}

export default function SupportPage() {
  useDocumentTitle('문의 / 요청')
  const { inquiries, submitInquiry } = useInquiries()
  const [tab, setTab] = useState<TabValue>('write')

  const [type, setType] = useState<InquiryType>('inquiry')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)

  const resetForm = () => {
    setType('inquiry')
    setTitle('')
    setContent('')
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next: Errors = {
      title: validateTitle(title),
      content: validateContent(content),
    }
    if (next.title || next.content) {
      setErrors(next)
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      await submitInquiry({ type, title, content })
      showToast('문의가 접수되었습니다.', 'success')
      resetForm()
      setTab('history')
    } catch {
      showToast('문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer width="narrow">
      <div
        role="tablist"
        aria-label="문의 탭"
        className="-mx-4 mb-6 flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-stone-200 px-4 sm:mx-0 sm:px-0"
      >
        {TABS.map(({ value, label }) => {
          const active = tab === value
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(value)}
              className={cn(
                'relative shrink-0 px-4 py-2.5 text-sm font-semibold transition-colors',
                active ? 'text-orange-600' : 'text-stone-500 hover:text-stone-800',
              )}
            >
              {label}
              {value === 'history' && inquiries.length > 0 && (
                <span className="ml-1.5 text-stone-400 tabular-nums">
                  {inquiries.length}
                </span>
              )}
              {active && (
                <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {tab === 'write' ? (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-stone-700">유형</span>
            <div className="flex gap-2">
              {INQUIRY_TYPE_OPTIONS.map((o) => (
                <Chip
                  key={o.value}
                  selected={type === o.value}
                  onClick={() => setType(o.value)}
                  disabled={submitting}
                >
                  {o.label}
                </Chip>
              ))}
            </div>
          </div>

          <FormField
            label="제목"
            type="text"
            placeholder="문의 제목을 입력해주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setErrors((p) => ({ ...p, title: validateTitle(title) }))}
            error={errors.title}
            maxLength={TITLE_MAX}
            disabled={submitting}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="inquiry-content" className="text-sm font-semibold text-stone-700">
              내용
            </label>
            <textarea
              id="inquiry-content"
              rows={6}
              placeholder="문의 내용을 자세히 적어주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={() => setErrors((p) => ({ ...p, content: validateContent(content) }))}
              aria-invalid={errors.content ? true : undefined}
              maxLength={CONTENT_MAX}
              disabled={submitting}
              className={cn(
                'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 outline-none transition-all resize-y',
                'focus:ring-4 disabled:bg-stone-50 disabled:text-stone-500',
                errors.content
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-stone-200 focus:border-orange-400 focus:ring-orange-100',
              )}
            />
            {errors.content ? (
              <p className="text-xs text-red-500">{errors.content}</p>
            ) : (
              <p className="text-xs text-stone-400">
                {content.trim().length}/{CONTENT_MAX}자
              </p>
            )}
          </div>

          <Button type="submit" size="lg" fullWidth disabled={submitting} className="mt-2">
            {submitting ? '접수 중...' : '문의 접수'}
          </Button>
        </form>
      ) : inquiries.length === 0 ? (
        <EmptyState
          icon={Headphones}
          title="아직 보낸 문의가 없어요."
          description="궁금한 점이나 요청 사항을 남겨주세요."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {inquiries.map((inquiry) => (
            <InquiryCard key={inquiry.id} inquiry={inquiry} />
          ))}
        </div>
      )}
    </PageContainer>
  )
}

function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
  const answered = inquiry.status === 'answered'
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-xs font-medium text-stone-600">
          {INQUIRY_TYPE_LABELS[inquiry.type]}
        </span>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            answered ? 'bg-orange-50 text-orange-600' : 'bg-stone-100 text-stone-500',
          )}
        >
          {INQUIRY_STATUS_LABELS[inquiry.status]}
        </span>
        <span className="ml-auto text-xs text-stone-400 tabular-nums">
          {formatMonthDay(inquiry.createdAt)}
        </span>
      </div>

      <p className="text-sm font-bold text-stone-800">{inquiry.title}</p>
      <p className="mt-1 text-sm text-stone-600 whitespace-pre-line">{inquiry.content}</p>

      {inquiry.answer && (
        <div className="mt-3 rounded-lg bg-stone-50 border border-stone-100 p-3">
          <p className="text-xs font-semibold text-orange-600 mb-1">답변</p>
          <p className="text-sm text-stone-600 whitespace-pre-line">{inquiry.answer}</p>
        </div>
      )}
    </div>
  )
}
