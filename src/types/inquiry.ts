export type InquiryType = 'request' | 'inquiry'

export type InquiryStatus = 'pending' | 'answered'

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  request: '요청',
  inquiry: '문의',
}

export const INQUIRY_TYPE_OPTIONS: { value: InquiryType; label: string }[] = [
  { value: 'inquiry', label: INQUIRY_TYPE_LABELS.inquiry },
  { value: 'request', label: INQUIRY_TYPE_LABELS.request },
]

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  pending: '대기',
  answered: '답변완료',
}

export interface Inquiry {
  id: string
  type: InquiryType
  title: string
  content: string
  status: InquiryStatus
  createdAt: string
  answer?: string
  answeredAt?: string
}
