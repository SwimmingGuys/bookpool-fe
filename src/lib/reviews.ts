import { useCallback } from 'react'
import type { Review, ReviewSubmissionInput } from '@/types/review'
import {
  deleteMyReview,
  listMyReviews,
  listReviewsByCampaign,
  submitReview,
  updateMyReview,
} from '@/lib/api/reviews'
import { useAuth } from '@/lib/auth'
import { useAsyncData, type LoadStatus } from '@/lib/useAsyncData'

const EMPTY: Review[] = []

export interface ReviewListResult {
  reviews: Review[]
  status: LoadStatus
  error: Error | null
  reload: () => void
}

// 공고 상세에 노출되는 참여 후기 목록
export function useCampaignReviews(campaignId: string | undefined): ReviewListResult {
  const result = useAsyncData(
    () => (campaignId ? listReviewsByCampaign(campaignId) : Promise.resolve(EMPTY)),
    EMPTY,
    [campaignId],
  )
  return {
    reviews: result.data,
    status: result.status,
    error: result.error,
    reload: result.reload,
  }
}

// 마이페이지의 '내 후기'
export function useMyReviews(): ReviewListResult {
  const { user } = useAuth()
  const userId = user?.id ?? null

  const result = useAsyncData(
    () => (userId ? listMyReviews() : Promise.resolve(EMPTY)),
    EMPTY,
    [userId],
  )

  return {
    reviews: result.data,
    status: result.status,
    error: result.error,
    reload: result.reload,
  }
}

// 제출·수정·삭제 후 목록을 다시 받아오는 액션 묶음
export function useReviewActions(reload: () => void) {
  return {
    submit: useCallback(
      async (input: ReviewSubmissionInput) => {
        const review = await submitReview(input)
        reload()
        return review
      },
      [reload],
    ),
    update: useCallback(
      async (id: string, input: Omit<ReviewSubmissionInput, 'recruitmentId'>) => {
        const review = await updateMyReview(id, input)
        reload()
        return review
      },
      [reload],
    ),
    remove: useCallback(
      async (id: string) => {
        await deleteMyReview(id)
        reload()
      },
      [reload],
    ),
  }
}
