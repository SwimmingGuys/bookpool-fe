import { apiRequest, ENDPOINTS, type PageResponse } from '@/lib/api/client'
import type { Inquiry, InquiryStatus, InquiryType } from '@/types/inquiry'

export interface SubmitInquiryPayload {
  type: InquiryType
  title: string
  content: string
}

interface InquiryResponse {
  id: string | number
  type: string
  title: string
  content: string
  status: string
  createdAt: string
  answer?: string | null
  answeredAt?: string | null
  // 관리자 목록에서만 내려오는 작성자 정보
  authorEmail?: string | null
  authorNickname?: string | null
}

function toInquiry(response: InquiryResponse): Inquiry {
  return {
    id: String(response.id),
    type: response.type.toLowerCase() as InquiryType,
    title: response.title,
    content: response.content,
    status: response.status.toLowerCase() as InquiryStatus,
    createdAt: response.createdAt.slice(0, 10),
    answer: response.answer ?? undefined,
    answeredAt: response.answeredAt?.slice(0, 10),
    authorEmail: response.authorEmail ?? undefined,
    authorNickname: response.authorNickname ?? undefined,
  }
}

export async function listInquiries(): Promise<Inquiry[]> {
  const page = await apiRequest<PageResponse<InquiryResponse>>(ENDPOINTS.inquiries, {
    query: { page: 0, size: 100 },
  })
  return page.content.map(toInquiry)
}

export async function createInquiry(
  payload: SubmitInquiryPayload,
): Promise<Inquiry> {
  return toInquiry(
    await apiRequest<InquiryResponse>(ENDPOINTS.inquiries, {
      method: 'POST',
      body: {
        type: payload.type.toUpperCase(),
        title: payload.title,
        content: payload.content,
      },
    }),
  )
}

// ---------- 관리자 ----------

export async function listAdminInquiries(
  params: { status?: InquiryStatus } = {},
  token?: string | null,
): Promise<Inquiry[]> {
  const page = await apiRequest<PageResponse<InquiryResponse>>(
    ENDPOINTS.adminInquiries,
    {
      token,
      query: {
        status: params.status?.toUpperCase(),
        page: 0,
        size: 100,
      },
    },
  )
  return page.content.map(toInquiry)
}

export async function answerInquiry(
  id: string,
  answer: string,
  token?: string | null,
): Promise<Inquiry> {
  return toInquiry(
    await apiRequest<InquiryResponse>(`${ENDPOINTS.adminInquiries}/${id}/answer`, {
      method: 'POST',
      token,
      body: { answer: answer.trim() },
    }),
  )
}
