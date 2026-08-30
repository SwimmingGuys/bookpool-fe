import { apiRequest, ENDPOINTS, type PageResponse } from '@/lib/api/client'
import type { Notice, NoticeCategory } from '@/types/notice'

interface NoticeResponse {
  id: string | number
  title: string
  content: string
  category: string
  author: string
  isPinned?: boolean | null
  pinned?: boolean | null
  createdAt: string
}

function toNotice(response: NoticeResponse): Notice {
  return {
    id: String(response.id),
    title: response.title,
    content: response.content,
    category: response.category.toLowerCase() as NoticeCategory,
    author: response.author,
    isPinned: response.isPinned ?? response.pinned ?? false,
    createdAt: response.createdAt.slice(0, 10),
  }
}

export async function listNotices(
  params: { category?: NoticeCategory; page?: number; size?: number } = {},
): Promise<PageResponse<Notice>> {
  const page = await apiRequest<PageResponse<NoticeResponse>>(ENDPOINTS.notices, {
    auth: false,
    query: {
      category: params.category?.toUpperCase(),
      page: params.page ?? 0,
      size: params.size ?? 100,
    },
  })
  return { ...page, content: page.content.map(toNotice) }
}

export async function getNotice(id: string): Promise<Notice> {
  return toNotice(
    await apiRequest<NoticeResponse>(`${ENDPOINTS.notices}/${id}`, { auth: false }),
  )
}

// ---------- 관리자 ----------

export interface NoticeInput {
  title: string
  content: string
  category: NoticeCategory
  isPinned: boolean
}

function toNoticePayload(input: NoticeInput) {
  return {
    title: input.title,
    content: input.content,
    category: input.category.toUpperCase(),
    isPinned: input.isPinned,
  }
}

export async function listAdminNotices(
  token?: string | null,
): Promise<Notice[]> {
  const page = await apiRequest<PageResponse<NoticeResponse>>(ENDPOINTS.adminNotices, {
    token,
    query: { page: 0, size: 100 },
  })
  return page.content.map(toNotice)
}

export async function createAdminNotice(
  input: NoticeInput,
  token?: string | null,
): Promise<Notice> {
  return toNotice(
    await apiRequest<NoticeResponse>(ENDPOINTS.adminNotices, {
      method: 'POST',
      token,
      body: toNoticePayload(input),
    }),
  )
}

export async function updateAdminNotice(
  id: string,
  input: NoticeInput,
  token?: string | null,
): Promise<Notice> {
  return toNotice(
    await apiRequest<NoticeResponse>(`${ENDPOINTS.adminNotices}/${id}`, {
      method: 'PUT',
      token,
      body: toNoticePayload(input),
    }),
  )
}

export async function deleteAdminNotice(
  id: string,
  token?: string | null,
): Promise<void> {
  await apiRequest<void>(`${ENDPOINTS.adminNotices}/${id}`, {
    method: 'DELETE',
    token,
  })
}
