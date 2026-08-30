import type { ReviewChannel } from '@/types/recruitment'

// 관리자가 공고에 노출할지 결정하는 상태
export type ReviewStatus = 'visible' | 'hidden'

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  visible: '노출',
  hidden: '숨김',
}

/**
 * 서평 원문 링크의 확인 상태.
 *
 * 예전에는 이 값이 공개 여부를 결정했다(APPROVED만 노출). 지금은 후기가 바로 노출되고,
 * 이 값은 관리자가 원문 링크를 열어 확인해 줬는지만 나타낸다. 노출 여부는 ReviewStatus가 쥔다.
 */
export type ReviewSubmissionStatus = 'submitted' | 'approved' | 'rejected'

export const REVIEW_SUBMISSION_STATUS_LABELS: Record<
  ReviewSubmissionStatus,
  string
> = {
  submitted: '확인 전',
  approved: '서평 확인됨',
  rejected: '반려됨',
}

export interface Review {
  id: string
  recruitmentId: string
  // 공고 정보 (마이페이지 목록에서 함께 내려온다)
  recruitmentTitle?: string
  bookTitle?: string
  author: string
  // 작성자 본인 여부. 내 후기만 수정/삭제할 수 있다.
  isMine?: boolean
  rating: number // 1~5
  content: string
  // 외부에 올린 서평의 채널과 원문 링크 (선택)
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
  // 책이 아니라 모집 진행에 대한 만족도
  rating: number
  content: string
  // 외부에 올린 서평 링크. 남기고 싶은 사람만 적는다.
  channel?: ReviewChannel
  url?: string
}
