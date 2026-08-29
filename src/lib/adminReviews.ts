import type { Review, ReviewStatus, ReviewSubmissionStatus } from '@/types/review'
import {
  deleteAdminReview,
  listAdminReviews,
  reviewSubmissionDecision,
  setReviewStatus,
} from '@/lib/api/reviews'
import { getAdminToken } from '@/lib/adminAuth'
import { useAsyncData, type LoadStatus } from '@/lib/useAsyncData'

const EMPTY: Review[] = []

export interface AdminReviewListResult {
  reviews: Review[]
  status: LoadStatus
  error: Error | null
  reload: () => void
}

/**
 * 백오피스 서평 목록. 이전에는 localStorage에만 쌓여 사용자 화면에 전혀 노출되지
 * 않았는데, 서평 제출 API가 생기면서 서버 데이터를 그대로 읽는다.
 */
export function useAdminReviews(
  params: { campaignId?: string; submissionStatus?: ReviewSubmissionStatus } = {},
): AdminReviewListResult {
  const result = useAsyncData(
    () =>
      listAdminReviews(
        {
          campaignId: params.campaignId,
          submissionStatus: params.submissionStatus,
        },
        getAdminToken(),
      ),
    EMPTY,
    [params.campaignId, params.submissionStatus],
  )

  return {
    reviews: result.data,
    status: result.status,
    error: result.error,
    reload: result.reload,
  }
}

export async function approveReview(id: string): Promise<Review> {
  return reviewSubmissionDecision(id, 'approved', undefined, getAdminToken())
}

export async function rejectReview(id: string, reason: string): Promise<Review> {
  return reviewSubmissionDecision(id, 'rejected', reason, getAdminToken())
}

export async function toggleReviewStatus(
  id: string,
  current: ReviewStatus,
): Promise<Review> {
  const next: ReviewStatus = current === 'visible' ? 'hidden' : 'visible'
  return setReviewStatus(id, next, getAdminToken())
}

export async function removeReview(id: string): Promise<void> {
  await deleteAdminReview(id, getAdminToken())
}
