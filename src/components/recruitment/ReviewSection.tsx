import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, MessageSquareQuote } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  REVIEW_CHANNEL_LABELS,
  REVIEW_CHANNEL_OPTIONS,
  type ReviewChannel,
} from '@/types/recruitment'
import {
  REVIEW_SUBMISSION_STATUS_LABELS,
  type Review,
  type ReviewSubmissionStatus,
} from '@/types/review'
import { useCampaignReviews, useReviewActions } from '@/lib/reviews'
import { useAuth } from '@/lib/auth'
import { AuthError } from '@/lib/api/errors'
import { showToast } from '@/lib/toast'
import { formatRelativeTime } from '@/lib/date'
import Button from '@/components/ui/Button'
import StarRating from '@/components/ui/StarRating'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

interface ReviewSectionProps {
  recruitmentId: string
}

const inputClass =
  'w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 outline-none transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-100'

const statusStyles: Record<ReviewSubmissionStatus, string> = {
  submitted: 'bg-stone-100 text-stone-600',
  approved: 'bg-orange-50 text-orange-700',
  rejected: 'bg-red-50 text-red-600',
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * 공고에 달린 참여 후기 목록과 작성 폼.
 *
 * 책에 대한 서평이 아니라 **이 모집에 참여한 경험**을 남기는 곳이다.
 * 책 서평의 원본은 블로그·예스24 같은 외부 채널에 있고 여기에 옮겨 적을 이유가 없다.
 * 반면 '발표가 공고대로 났는지, 책이 언제 왔는지, 조건이 달랐는지'는 어디에도 남지
 * 않는 정보이고, 공고를 수집해 오는 이 서비스가 유일하게 쌓을 수 있는 값이다.
 * 그래서 별점은 책이 아니라 모집 진행을 향하고, 서평 원문 링크는 선택이다.
 */
export default function ReviewSection({ recruitmentId }: ReviewSectionProps) {
  const { isLoggedIn } = useAuth()
  const { reviews, status, error, reload } = useCampaignReviews(recruitmentId)
  const { submit } = useReviewActions(reload)

  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [channel, setChannel] = useState<ReviewChannel>('blog')
  const [url, setUrl] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const average = useMemo(() => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    return Math.round((sum / reviews.length) * 10) / 10
  }, [reviews])

  const alreadySubmitted = reviews.some((r) => r.isMine)

  const resetForm = () => {
    setRating(5)
    setChannel('blog')
    setUrl('')
    setContent('')
    setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      setFormError('후기 내용을 입력해주세요.')
      return
    }
    // 원문 링크는 선택. 적었다면 형식만 확인한다.
    const trimmedUrl = url.trim()
    if (trimmedUrl && !isValidUrl(trimmedUrl)) {
      setFormError('서평 원문 주소를 http(s):// 형식으로 입력해주세요.')
      return
    }
    setFormError(null)
    setSubmitting(true)
    try {
      await submit({
        recruitmentId,
        rating,
        content,
        channel: trimmedUrl ? channel : undefined,
        url: trimmedUrl || undefined,
      })
      resetForm()
      setOpen(false)
      showToast('후기를 남겼습니다.', 'success')
    } catch (err) {
      if (err instanceof AuthError) setFormError(err.message)
      else setFormError('후기 등록에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-semibold text-stone-800">
            참여 후기
            <span className="ml-2 text-sm font-bold text-orange-500">
              {reviews.length}
            </span>
          </h2>
          {reviews.length > 0 && (
            <span className="flex items-center gap-1.5">
              <StarRating value={Math.round(average)} />
              <span className="text-xs font-medium text-stone-500 tabular-nums">
                {average.toFixed(1)}
              </span>
            </span>
          )}
        </div>

        {isLoggedIn ? (
          !alreadySubmitted && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setOpen((prev) => !prev)}
            >
              {open ? '취소' : '후기 남기기'}
            </Button>
          )
        ) : (
          <Link
            to="/login"
            className="text-xs font-medium text-stone-500 no-underline hover:text-orange-600"
          >
            로그인하고 후기 남기기
          </Link>
        )}
      </div>

      {open && (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mb-6 rounded-xl border border-stone-200 bg-stone-50 p-4"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-700">
                모집 만족도
              </span>
              <StarRating value={rating} onChange={setRating} size="md" />
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="review-channel"
                className="text-xs font-semibold text-stone-700"
              >
                서평 채널
              </label>
              <select
                id="review-channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value as ReviewChannel)}
                disabled={submitting}
                className={cn(inputClass, 'w-auto py-1.5')}
              >
                {REVIEW_CHANNEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-1.5">
            <label
              htmlFor="review-content"
              className="text-xs font-semibold text-stone-700"
            >
              참여 후기
            </label>
            <textarea
              id="review-content"
              rows={3}
              placeholder="발표는 제때 났는지, 책은 언제 왔는지, 조건이 공고와 달랐는지 알려주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
              className={cn(inputClass, 'resize-y')}
            />
          </div>

          <div className="mt-3 flex flex-col gap-1.5">
            <label htmlFor="review-url" className="text-xs font-semibold text-stone-700">
              서평 원문 주소
              <span className="ml-1 font-normal text-stone-400">선택</span>
            </label>
            <input
              id="review-url"
              type="url"
              inputMode="url"
              placeholder="https://blog.example.com/my-review"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={submitting}
              className={inputClass}
            />
            <p className="text-xs text-stone-400">
              올린 서평이 있다면 링크를 남겨주세요. 다른 참여자에게 도움이 됩니다.
            </p>
          </div>

          {formError && (
            <p className="mt-3 text-sm font-medium text-red-500">{formError}</p>
          )}

          <div className="mt-4 flex justify-end">
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? '등록 중...' : '후기 남기기'}
            </Button>
          </div>
        </form>
      )}

      {status === 'loading' && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-stone-100 p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-1.5 h-4 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {status === 'error' && (
        <ErrorState
          title="후기를 불러오지 못했습니다."
          description={error?.message}
          onRetry={reload}
        />
      )}

      {status === 'success' && reviews.length === 0 && (
        <EmptyState
          icon={MessageSquareQuote}
          title="아직 참여 후기가 없어요."
          description="이 모집에 참여하셨다면 첫 후기를 남겨주세요."
        />
      )}

      {status === 'success' && reviews.length > 0 && (
        <ul className="flex flex-col gap-3">
          {reviews.map((review) => (
            <ReviewRow key={review.id} review={review} />
          ))}
        </ul>
      )}
    </section>
  )
}

function ReviewRow({ review }: { review: Review }) {
  return (
    <li className="rounded-xl border border-stone-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <StarRating value={review.rating} />
        <span className="text-sm font-semibold text-stone-700">{review.author}</span>
        {/* 후기는 바로 노출되므로 '확인 전'은 알릴 것이 없다.
            관리자가 서평 원문을 확인해 준 건에만 신뢰 표시를 단다. */}
        {review.submissionStatus === 'approved' && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              statusStyles.approved,
            )}
          >
            {REVIEW_SUBMISSION_STATUS_LABELS.approved}
          </span>
        )}
        <span className="ml-auto text-xs text-stone-400">
          {formatRelativeTime(review.createdAt)}
        </span>
      </div>

      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-600">
        {review.content}
      </p>

      {review.rejectReason && (
        <p className="mt-2 text-xs text-red-500">반려 사유: {review.rejectReason}</p>
      )}

      {review.url && (
        <a
          href={review.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-stone-500 no-underline hover:text-orange-600"
        >
          {review.channel ? REVIEW_CHANNEL_LABELS[review.channel] : '원문'}에서 보기
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </li>
  )
}
