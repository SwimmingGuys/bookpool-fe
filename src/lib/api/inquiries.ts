import { apiRequest, type PageResponse } from '@/lib/api/http'
import type { Inquiry, InquiryStatus, InquiryType } from '@/types/inquiry'

export interface SubmitInquiryPayload {
  type: InquiryType
  title: string
  content: string
}

interface InquiryResponse {
  id: string
  type: InquiryType
  title: string
  content: string
  status: InquiryStatus
  createdAt: string
  answer?: string | null
  answeredAt?: string | null
}

function toInquiry(inquiry: InquiryResponse): Inquiry {
  return {
    ...inquiry,
    createdAt: inquiry.createdAt.slice(0, 10),
    answer: inquiry.answer ?? undefined,
    answeredAt: inquiry.answeredAt?.slice(0, 10),
  }
}

export async function listInquiries(): Promise<Inquiry[]> {
  const page = await apiRequest<PageResponse<InquiryResponse>>('/api/inquiries', {
    auth: 'user',
    query: { page: 0, size: 100 },
  })
  return page.content.map(toInquiry)
}

export async function createInquiry(
  payload: SubmitInquiryPayload,
): Promise<Inquiry> {
  return toInquiry(
    await apiRequest<InquiryResponse>('/api/inquiries', {
      method: 'POST',
      auth: 'user',
      body: {
        type: payload.type.toUpperCase(),
        title: payload.title,
        content: payload.content,
      },
    }),
  )
}
