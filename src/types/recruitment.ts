export type RecruitmentType = 'Reviewer' | 'Beta Reader'

export type RecruitmentStatus = 'open' | 'closed'

export const RECRUITMENT_TYPE_LABELS: Record<RecruitmentType, string> = {
  Reviewer: '서평단',
  'Beta Reader': '베타리더',
}

export const RECRUITMENT_TYPE_OPTIONS: { value: RecruitmentType; label: string }[] = [
  { value: 'Reviewer', label: RECRUITMENT_TYPE_LABELS.Reviewer },
  { value: 'Beta Reader', label: RECRUITMENT_TYPE_LABELS['Beta Reader'] },
]

export const CATEGORIES = [
  'IT/개발',
  '소설',
  '경제',
  '에세이',
  '기획/디자인',
  '자기계발',
  '인문/사회',
  '예술/디자인',
  '학습/교육',
] as const

export type Category = (typeof CATEGORIES)[number]

export interface Recruitment {
  id: string
  badgeLabel: RecruitmentType
  daysRemaining: number
  title: string
  bookTitle: string
  publisher: string
  category: Category | string
  viewCount: number
  status: RecruitmentStatus
  recruitStartDate: string
  recruitEndDate: string
  announcementDate: string
  coverImage?: string
  description: string
}
