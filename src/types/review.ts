export type ReviewStatus = 'visible' | 'hidden'

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  visible: '노출',
  hidden: '숨김',
}

export interface Review {
  id: string
  recruitmentId: string
  author: string
  rating: number // 1~5
  content: string
  status: ReviewStatus
  createdAt: string
}
