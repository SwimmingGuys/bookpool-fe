import { useState } from 'react'
import { cn } from '@/lib/cn'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { answerInquiry, listAdminInquiries } from '@/lib/api/inquiries'
import { getAdminToken } from '@/lib/adminAuth'
import { useAsyncData } from '@/lib/useAsyncData'
import { AuthError } from '@/lib/api/errors'
import { showToast } from '@/lib/toast'
import { formatFullDate } from '@/lib/date'
import {
  INQUIRY_STATUS_LABELS,
  INQUIRY_TYPE_LABELS,
  type Inquiry,
  type InquiryStatus,
} from '@/types/inquiry'
import PageHeader from '@/components/layout/PageHeader'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

const EMPTY: Inquiry[] = []

const TABS: { value: InquiryStatus | 'all'; label: string }[] = [
  { value: 'pending', label: INQUIRY_STATUS_LABELS.pending },
  { value: 'answered', label: INQUIRY_STATUS_LABELS.answered },
  { value: 'all', label: '전체' },
]

const inputClass =
  'w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 outline-none transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-100'

/**
 * 1:1 문의 답변. 사용자는 문의를 넣을 수 있는데 받을 화면이 없었다.
 */
export default function AdminInquiriesPage() {
  useDocumentTitle('문의 관리')
  const [tab, setTab] = useState<InquiryStatus | 'all'>('pending')

  const { data, status, error, reload } = useAsyncData(
    () =>
      listAdminInquiries(
        { status: tab === 'all' ? undefined : tab },
        getAdminToken(),
      ),
    EMPTY,
    [tab],
  )

  const [answeringId, setAnsweringId] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleAnswer = async (id: string) => {
    if (!answer.trim()) {
      showToast('답변 내용을 입력해주세요.', 'warning')
      return
    }
    setSubmitting(true)
    try {
      await answerInquiry(id, answer, getAdminToken())
      showToast('답변을 등록했습니다.', 'success')
      setAnsweringId(null)
      setAnswer('')
      reload()
    } catch (err) {
      showToast(
        err instanceof AuthError ? err.message : '답변 등록에 실패했습니다.',
        'error',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="문의 관리"
        description={status === 'success' ? `${data.length}건` : '불러오는 중...'}
        className="mb-6"
      />

      <div
        role="tablist"
        aria-label="문의 상태"
        className="-mx-4 mb-4 flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-stone-200 px-4 sm:mx-0 sm:px-0"
      >
        {TABS.map((item) => {
          const active = tab === item.value
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.value)}
              className={cn(
                'relative shrink-0 px-4 py-2.5 text-sm font-semibold transition-colors',
                active ? 'text-orange-600' : 'text-stone-500 hover:text-stone-800',
              )}
            >
              {item.label}
              {active && (
                <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-orange-500" />
              )}
            </button>
          )
        })}
      </div>

      {status === 'loading' ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : status === 'error' ? (
        <ErrorState
          title="문의를 불러오지 못했습니다."
          description={error?.message}
          onRetry={reload}
        />
      ) : data.length === 0 ? (
        <EmptyState
          title="해당하는 문의가 없습니다."
          description="새 문의가 들어오면 여기에 표시됩니다."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {data.map((inquiry) => (
            <li
              key={inquiry.id}
              className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600">
                  {INQUIRY_TYPE_LABELS[inquiry.type]}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-semibold',
                    inquiry.status === 'answered'
                      ? 'bg-orange-50 text-orange-700'
                      : 'bg-stone-100 text-stone-500',
                  )}
                >
                  {INQUIRY_STATUS_LABELS[inquiry.status]}
                </span>
                {inquiry.authorNickname && (
                  <span className="text-xs text-stone-500">
                    {inquiry.authorNickname}
                    {inquiry.authorEmail && ` (${inquiry.authorEmail})`}
                  </span>
                )}
                <span className="ml-auto text-xs text-stone-400">
                  {formatFullDate(inquiry.createdAt)}
                </span>
              </div>

              <h2 className="mt-2.5 text-sm font-bold text-stone-800">
                {inquiry.title}
              </h2>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-stone-600">
                {inquiry.content}
              </p>

              {inquiry.answer && (
                <div className="mt-4 rounded-lg border-l-2 border-orange-300 bg-orange-50/50 p-3">
                  <p className="text-xs font-semibold text-orange-700">
                    답변
                    {inquiry.answeredAt && (
                      <span className="ml-2 font-normal text-stone-400">
                        {formatFullDate(inquiry.answeredAt)}
                      </span>
                    )}
                  </p>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-stone-600">
                    {inquiry.answer}
                  </p>
                </div>
              )}

              {answeringId === inquiry.id ? (
                <div className="mt-4 flex flex-col gap-2">
                  <label
                    htmlFor={`answer-${inquiry.id}`}
                    className="text-xs font-semibold text-stone-700"
                  >
                    답변 작성
                  </label>
                  <textarea
                    id={`answer-${inquiry.id}`}
                    rows={4}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="답변 내용을 입력하세요"
                    disabled={submitting}
                    className={cn(inputClass, 'resize-y')}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAnsweringId(null)
                        setAnswer('')
                      }}
                      disabled={submitting}
                    >
                      취소
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAnswer(inquiry.id)}
                      disabled={submitting}
                    >
                      {submitting ? '등록 중...' : '답변 등록'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setAnsweringId(inquiry.id)
                      setAnswer(inquiry.answer ?? '')
                    }}
                  >
                    {inquiry.answer ? '답변 수정' : '답변하기'}
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
