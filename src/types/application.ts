import type { Recruitment } from '@/types/recruitment'

/**
 * 신청 상태.
 *
 * 실제 신청은 출판사 폼 등 외부 페이지에서 일어나 서비스가 결과를 알 수 없다.
 * 사용자가 직접 표시하는 자기 신고 값이다.
 */
export type ApplicationStatus = 'applied' | 'selected' | 'notSelected'

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: '결과 대기',
  selected: '당첨',
  notSelected: '미당첨',
}

export const APPLICATION_STATUS_OPTIONS: {
  value: ApplicationStatus
  label: string
}[] = [
  { value: 'applied', label: APPLICATION_STATUS_LABELS.applied },
  { value: 'selected', label: APPLICATION_STATUS_LABELS.selected },
  { value: 'notSelected', label: APPLICATION_STATUS_LABELS.notSelected },
]

export interface Application {
  id: string
  status: ApplicationStatus
  appliedAt: string
  recruitment: Recruitment
}
