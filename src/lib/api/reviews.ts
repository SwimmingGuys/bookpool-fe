import { apiRequest, ENDPOINTS, type PageResponse } from '@/lib/api/client'
import type { ReviewChannel } from '@/types/recruitment'
import type {
  Review,
  ReviewStatus,
  ReviewSubmissionInput,
  ReviewSubmissionStatus,
} from '@/types/review'

const CHANNEL_FROM_API: Record<string, ReviewChannel> = {
  BLOG: 'blog',
  INSTAGRAM: 'instagram',
  YES24: 'yes24',
  ALADIN: 'aladin',
  KYOBO: 'kyobo',
  BRUNCH: 'brunch',
  THREADS: 'threads',
  ETC: 'etc',
}

interface ReviewResponse {
  id: string | number
  campaignId: string | number
  campaignTitle?: string | null
  bookTitle?: string | null
  author?: string | null
  authorNickname?: string | null
  mine?: boolean | null
  isMine?: boolean | null
  rating: number
  content: string
  channel?: string | null
  url?: string | null
  status?: string | null
  submissionStatus?: string | null
  rejectReason?: string | null
  createdAt: string
}

function toReview(response: ReviewResponse): Review {
  return {
    id: String(response.id),
    recruitmentId: String(response.campaignId),
    recruitmentTitle: response.campaignTitle ?? undefined,
    bookTitle: response.bookTitle ?? undefined,
    author: response.author ?? response.authorNickname ?? '',
    isMine: response.isMine ?? response.mine ?? undefined,
    rating: response.rating,
    content: response.content,
    channel: response.channel ? CHANNEL_FROM_API[response.channel] : undefined,
    url: response.url ?? undefined,
    status: (response.status?.toLowerCase() as ReviewStatus | undefined) ?? 'visible',
    submissionStatus:
      (response.submissionStatus?.toLowerCase() as ReviewSubmissionStatus | undefined) ??
      'approved',
    rejectReason: response.rejectReason ?? undefined,
    createdAt: response.createdAt,
  }
}

// ---------- 공개 ----------

// 공고 상세에 노출되는 참여 후기 목록 (visible + approved만 내려온다)
export async function listReviewsByCampaign(campaignId: string): Promise<Review[]> {
  const page = await apiRequest<PageResponse<ReviewResponse>>(ENDPOINTS.reviews, {
    auth: false,
    query: { campaignId, page: 0, size: 50 },
  })
  return page.content.map(toReview)
}

// ---------- 사용자 (참여 후기 등록) ----------

export async function submitReview(input: ReviewSubmissionInput): Promise<Review> {
  return toReview(
    await apiRequest<ReviewResponse>(ENDPOINTS.reviews, {
      method: 'POST',
      body: {
        campaignId: Number(input.recruitmentId),
        rating: input.rating,
        content: input.content.trim(),
        ...toLinkPayload(input),
      },
    }),
  )
}

// 서평 링크는 선택이라 비어 있으면 필드를 보내지 않는다.
function toLinkPayload(input: Pick<ReviewSubmissionInput, 'channel' | 'url'>) {
  const url = input.url?.trim()
  if (!url) return { channel: null, url: null }
  return { channel: input.channel?.toUpperCase() ?? null, url }
}

export async function updateMyReview(
  id: string,
  input: Omit<ReviewSubmissionInput, 'recruitmentId'>,
): Promise<Review> {
  return toReview(
    await apiRequest<ReviewResponse>(`${ENDPOINTS.reviews}/${id}`, {
      method: 'PUT',
      body: {
        rating: input.rating,
        content: input.content.trim(),
        ...toLinkPayload(input),
      },
    }),
  )
}

export async function deleteMyReview(id: string): Promise<void> {
  await apiRequest<void>(`${ENDPOINTS.reviews}/${id}`, { method: 'DELETE' })
}

// 내가 남긴 후기 목록 (마이페이지)
export async function listMyReviews(): Promise<Review[]> {
  const page = await apiRequest<PageResponse<ReviewResponse>>(
    `${ENDPOINTS.reviews}/me`,
    { query: { page: 0, size: 100 } },
  )
  return page.content.map(toReview)
}

// ---------- 관리자 ----------

export async function listAdminReviews(
  params: { campaignId?: string; submissionStatus?: ReviewSubmissionStatus } = {},
  token?: string | null,
): Promise<Review[]> {
  const page = await apiRequest<PageResponse<ReviewResponse>>(ENDPOINTS.adminReviews, {
    token,
    query: {
      campaignId: params.campaignId,
      submissionStatus: params.submissionStatus?.toUpperCase(),
      page: 0,
      size: 100,
    },
  })
  return page.content.map(toReview)
}

// 서평 인증 승인/반려
export async function reviewSubmissionDecision(
  id: string,
  decision: Extract<ReviewSubmissionStatus, 'approved' | 'rejected'>,
  rejectReason?: string,
  token?: string | null,
): Promise<Review> {
  return toReview(
    await apiRequest<ReviewResponse>(`${ENDPOINTS.adminReviews}/${id}/decision`, {
      method: 'POST',
      token,
      body: {
        submissionStatus: decision.toUpperCase(),
        rejectReason: rejectReason?.trim() || null,
      },
    }),
  )
}

// 공고 상세 노출 여부 토글
export async function setReviewStatus(
  id: string,
  status: ReviewStatus,
  token?: string | null,
): Promise<Review> {
  return toReview(
    await apiRequest<ReviewResponse>(`${ENDPOINTS.adminReviews}/${id}/status`, {
      method: 'PATCH',
      token,
      body: { status: status.toUpperCase() },
    }),
  )
}

export async function deleteAdminReview(
  id: string,
  token?: string | null,
): Promise<void> {
  await apiRequest<void>(`${ENDPOINTS.adminReviews}/${id}`, {
    method: 'DELETE',
    token,
  })
}
