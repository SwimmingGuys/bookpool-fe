import type { ReviewChannel } from '@/types/recruitment'

// 관리자가 공고에 노출할지 결정하는 상태
export type ReviewStatus = 'visible' | 'hidden'

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  visible: '노출',
  hidden: '숨김',
}

// 서평 제출 → 관리자 확인까지의 상태
export type ReviewSubmissionStatus = 'submitted' | 'approved' | 'rejected'

export const REVIEW_SUBMISSION_STATUS_LABELS: Record<
  ReviewSubmissionStatus,
  string
> = {
  submitted: '확인 대기',
  approved: '인증 완료',
  rejected: '반려',
}

export interface Review {
  id: string
  recruitmentId: string
  // 공고 정보 (마이페이지 목록에서 함께 내려온다)
  recruitmentTitle?: string
  bookTitle?: string
  author: string
  // 작성자 본인 여부. 내 서평만 수정/삭제할 수 있다.
  isMine?: boolean
  rating: number // 1~5
  content: string
  // 서평을 올린 채널과 원문 링크
  channel?: ReviewChannel
  url?: string
  status: ReviewStatus
  submissionStatus: ReviewSubmissionStatus
  // 반려 사유 (submissionStatus === 'rejected')
  rejectReason?: string
  createdAt: string
}

export interface ReviewSubmissionInput {
  recruitmentId: string
  rating: number
  content: string
  channel: ReviewChannel
  url: string
}
