export type NoticeCategory =
  | 'update'
  | 'policy'
  | 'maintenance'
  | 'event'
  | 'general'

export const NOTICE_CATEGORY_LABELS: Record<NoticeCategory, string> = {
  update: '업데이트',
  policy: '정책',
  maintenance: '점검',
  event: '이벤트',
  general: '공지',
}

export const NOTICE_CATEGORY_OPTIONS: { value: NoticeCategory; label: string }[] = [
  { value: 'update', label: NOTICE_CATEGORY_LABELS.update },
  { value: 'policy', label: NOTICE_CATEGORY_LABELS.policy },
  { value: 'maintenance', label: NOTICE_CATEGORY_LABELS.maintenance },
  { value: 'event', label: NOTICE_CATEGORY_LABELS.event },
  { value: 'general', label: NOTICE_CATEGORY_LABELS.general },
]

export interface Notice {
  id: string
  title: string
  content: string
  category: NoticeCategory
  author: string
  isPinned: boolean
  createdAt: string
}
