import { useState } from 'react'
import { Check, ExternalLink, Eye, EyeOff, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import Button from '@/components/ui/Button'
import StarRating from '@/components/ui/StarRating'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { showToast } from '@/lib/toast'
import {
  approveReview,
  rejectReview,
  removeReview,
  toggleReviewStatus,
  useAdminReviews,
} from '@/lib/adminReviews'
import { AuthError } from '@/lib/api/errors'
import { formatRelativeTime } from '@/lib/date'
import { REVIEW_CHANNEL_LABELS } from '@/types/recruitment'
import {
  REVIEW_SUBMISSION_STATUS_LABELS,
  type Review,
  type ReviewSubmissionStatus,
} from '@/types/review'

interface ReviewManagerProps {
  recruitmentId: string
}

const statusStyles: Record<ReviewSubmissionStatus, string> = {
  submitted: 'bg-stone-100 text-stone-600',
  approved: 'bg-orange-50 text-orange-700',
  rejected: 'bg-red-50 text-red-600',
}

const inputClass =
  'w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 outline-none transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-100'

/**
 * 공고에 제출된 서평을 인증(승인/반려)하고 노출 여부를 관리한다.
 * 이전에는 관리자가 서평을 직접 타이핑해 localStorage에 넣는 구조라 확장되지 않았다.
 */
export default function ReviewManager({ recruitmentId }: ReviewManagerProps) {
  const { reviews, status, error, reload } = useAdminReviews({ campaignId: recruitmentId })
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const run = async (id: string, action: () => Promise<unknown>, message: string) => {
    setBusyId(id)
    try {
      await action()
      reload()
      showToast(message, 'success')
    } catch (err) {
      showToast(
        err instanceof AuthError ? err.message : '처리에 실패했습니다.',
        'error',
      )
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      showToast('반려 사유를 입력해주세요.', 'warning')
      return
    }
    await run(id, () => rejectReview(id, rejectReason), '서평을 반려했습니다.')
    setRejectingId(null)
    setRejectReason('')
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 서평을 삭제할까요?')) return
    await run(id, () => removeReview(id), '서평을 삭제했습니다.')
  }

  return (
    <section className="mt-8 border-t border-stone-100 pt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-stone-800">
          제출된 서평
          {status === 'success' && (
            <span className="ml-2 text-sm font-bold text-orange-500">
              {reviews.length}
            </span>
          )}
        </h2>
      </div>

      {status === 'loading' && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-stone-100 p-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-4 w-full" />
            </div>
          ))}
        </div>
      )}

      {status === 'error' && (
        <ErrorState
          title="서평을 불러오지 못했습니다."
          description={error?.message}
          onRetry={reload}
        />
      )}

      {status === 'success' && reviews.length === 0 && (
        <EmptyState
          title="아직 제출된 서평이 없습니다."
          description="참여자가 서평을 등록하면 여기에서 인증할 수 있습니다."
        />
      )}

      {status === 'success' && reviews.length > 0 && (
        <ul className="flex flex-col gap-3">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-xl border border-stone-200 bg-white p-4"
            >
              <ReviewHeader review={review} />

              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-600">
                {review.content}
              </p>

              {review.url && (
                <a
                  href={review.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-stone-500 no-underline hover:text-orange-600"
                >
                  {review.channel ? REVIEW_CHANNEL_LABELS[review.channel] : '원문'} 확인
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}

              {review.rejectReason && (
                <p className="mt-2 text-xs text-red-500">
                  반려 사유: {review.rejectReason}
                </p>
              )}

              {rejectingId === review.id ? (
                <div className="mt-3 flex flex-col gap-2 rounded-lg bg-stone-50 p-3">
                  <label
                    htmlFor={`reject-${review.id}`}
                    className="text-xs font-semibold text-stone-700"
                  >
                    반려 사유
                  </label>
                  <input
                    id={`reject-${review.id}`}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="예: 서평 링크가 열리지 않습니다."
                    className={inputClass}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRejectingId(null)
                        setRejectReason('')
                      }}
                    >
                      취소
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReject(review.id)}
                      disabled={busyId === review.id}
                    >
                      반려하기
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {review.submissionStatus !== 'approved' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={busyId === review.id}
                      onClick={() =>
                        run(
                          review.id,
                          () => approveReview(review.id),
                          '서평을 인증했습니다.',
                        )
                      }
                    >
                      <Check className="h-3.5 w-3.5" />
                      인증
                    </Button>
                  )}
                  {review.submissionStatus !== 'rejected' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={busyId === review.id}
                      onClick={() => setRejectingId(review.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                      반려
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={busyId === review.id}
                    onClick={() =>
                      run(
                        review.id,
                        () => toggleReviewStatus(review.id, review.status),
                        review.status === 'visible'
                          ? '서평을 숨겼습니다.'
                          : '서평을 노출했습니다.',
                      )
                    }
                  >
                    {review.status === 'visible' ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        숨기기
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        노출하기
                      </>
                    )}
                  </Button>
                  <button
                    type="button"
                    aria-label="서평 삭제"
                    disabled={busyId === review.id}
                    onClick={() => handleDelete(review.id)}
                    className="ml-auto rounded-lg p-2 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ReviewHeader({ review }: { review: Review }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StarRating value={review.rating} />
      <span className="text-sm font-semibold text-stone-700">{review.author}</span>
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-xs font-semibold',
          statusStyles[review.submissionStatus],
        )}
      >
        {REVIEW_SUBMISSION_STATUS_LABELS[review.submissionStatus]}
      </span>
      {review.status === 'hidden' && (
        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-500">
          숨김
        </span>
      )}
      <span className="ml-auto text-xs text-stone-400">
        {formatRelativeTime(review.createdAt)}
      </span>
    </div>
  )
}
