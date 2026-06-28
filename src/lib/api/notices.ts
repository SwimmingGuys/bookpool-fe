import { apiRequest, type PageResponse } from '@/lib/api/http'
import type { Notice, NoticeCategory } from '@/types/notice'

interface NoticeResponse {
  id: string
  title: string
  content: string
  category: NoticeCategory
  author: string
  isPinned: boolean
  createdAt: string
}

function toNotice(notice: NoticeResponse): Notice {
  return {
    ...notice,
    createdAt: notice.createdAt.slice(0, 10),
  }
}

export async function listNotices(params: {
  category?: NoticeCategory
  page?: number
  size?: number
} = {}): Promise<PageResponse<Notice>> {
  const page = await apiRequest<PageResponse<NoticeResponse>>('/api/notices', {
    query: {
      category: params.category,
      page: params.page ?? 0,
      size: params.size ?? 100,
    },
  })
  return { ...page, content: page.content.map(toNotice) }
}

export async function getNotice(id: string): Promise<Notice> {
  return toNotice(await apiRequest<NoticeResponse>(`/api/notices/${id}`))
}
