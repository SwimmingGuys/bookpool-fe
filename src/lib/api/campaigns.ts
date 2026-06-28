import { apiRequest, type PageResponse } from '@/lib/api/http'
import type {
  Category,
  Recruitment,
  RecruitmentStatus,
  RecruitmentType,
} from '@/types/recruitment'

export interface CampaignSearchParams {
  query?: string
  categories?: readonly string[]
  types?: readonly RecruitmentType[]
  page?: number
  size?: number
}

export interface RecruitmentInput {
  title: string
  bookTitle: string
  publisher: string
  category: Category | string
  badgeLabel: RecruitmentType
  recruitStartDate: string
  recruitEndDate: string
  announcementDate: string
  description: string
  coverImage?: string
}

interface CampaignResponse {
  id: string
  badgeLabel: RecruitmentType
  daysRemaining: number
  title: string
  bookTitle: string
  publisher: string
  category: string
  viewCount: number
  status: RecruitmentStatus
  recruitStartDate: string
  recruitEndDate: string
  announcementDate: string
  coverImage?: string | null
  description?: string | null
}

function toRecruitment(campaign: CampaignResponse): Recruitment {
  return {
    ...campaign,
    coverImage: campaign.coverImage ?? undefined,
    description: campaign.description ?? '',
  }
}

function toCampaignType(type: RecruitmentType): string {
  return type === 'Reviewer' ? 'REVIEWER' : 'BETA_READER'
}

function toCampaignStatus(status: RecruitmentStatus): string {
  return status === 'open' ? 'OPEN' : 'CLOSED'
}

function toDeadlineAt(date: string): string {
  return `${date}T23:59:59`
}

function toCampaignPayload(input: RecruitmentInput, status?: RecruitmentStatus) {
  return {
    title: input.title,
    bookTitle: input.bookTitle,
    publisherName: input.publisher,
    category: input.category,
    type: toCampaignType(input.badgeLabel),
    applyUrl: '#',
    imageUrl: input.coverImage,
    description: input.description,
    recruitStartDate: input.recruitStartDate,
    deadlineAt: toDeadlineAt(input.recruitEndDate),
    announcementDate: input.announcementDate,
    status: status ? toCampaignStatus(status) : undefined,
  }
}

export async function listCampaigns(
  params: CampaignSearchParams = {},
): Promise<PageResponse<Recruitment>> {
  const page = await apiRequest<PageResponse<CampaignResponse>>('/api/campaigns', {
    query: {
      query: params.query,
      categories: params.categories,
      types: params.types?.map(toCampaignType),
      page: params.page ?? 0,
      size: params.size ?? 100,
    },
  })
  return { ...page, content: page.content.map(toRecruitment) }
}

export async function getCampaign(id: string): Promise<Recruitment> {
  return toRecruitment(await apiRequest<CampaignResponse>(`/api/campaigns/${id}`))
}

export async function listPublishers(): Promise<string[]> {
  return apiRequest<string[]>('/api/campaigns/publishers')
}

export async function listAdminCampaigns(): Promise<Recruitment[]> {
  const page = await apiRequest<PageResponse<CampaignResponse>>('/api/admin/campaigns', {
    auth: 'admin',
    query: { page: 0, size: 100 },
  })
  return page.content.map(toRecruitment)
}

export async function createAdminCampaign(
  input: RecruitmentInput,
): Promise<Recruitment> {
  return toRecruitment(
    await apiRequest<CampaignResponse>('/api/admin/campaigns', {
      method: 'POST',
      auth: 'admin',
      body: toCampaignPayload(input),
    }),
  )
}

export async function updateAdminCampaign(
  recruitment: Recruitment,
  input: RecruitmentInput,
): Promise<Recruitment> {
  return toRecruitment(
    await apiRequest<CampaignResponse>(`/api/admin/campaigns/${recruitment.id}`, {
      method: 'PUT',
      auth: 'admin',
      body: toCampaignPayload(input, recruitment.status),
    }),
  )
}

export async function deleteAdminCampaign(id: string): Promise<void> {
  await apiRequest<void>(`/api/admin/campaigns/${id}`, {
    method: 'DELETE',
    auth: 'admin',
  })
}

export async function listBookmarkedCampaignIds(): Promise<string[]> {
  const ids = await apiRequest<number[]>('/api/me/bookmarks/ids', { auth: 'user' })
  return ids.map(String)
}

export async function listBookmarkedCampaigns(): Promise<Recruitment[]> {
  const page = await apiRequest<PageResponse<CampaignResponse>>('/api/me/bookmarks', {
    auth: 'user',
    query: { page: 0, size: 100 },
  })
  return page.content.map(toRecruitment)
}

export async function addBookmark(id: string): Promise<void> {
  await apiRequest<void>('/api/me/bookmarks', {
    method: 'POST',
    auth: 'user',
    body: { campaignId: Number(id) },
  })
}

export async function removeBookmark(id: string): Promise<void> {
  await apiRequest<void>(`/api/me/bookmarks/${id}`, {
    method: 'DELETE',
    auth: 'user',
  })
}

export async function listRecentCampaignIds(): Promise<string[]> {
  const ids = await apiRequest<number[]>('/api/me/recent-views/ids', {
    auth: 'user',
    query: { limit: 50 },
  })
  return ids.map(String)
}

export async function listRecentCampaigns(): Promise<Recruitment[]> {
  const page = await apiRequest<PageResponse<CampaignResponse>>('/api/me/recent-views', {
    auth: 'user',
    query: { page: 0, size: 50 },
  })
  return page.content.map(toRecruitment)
}

export async function markRecentCampaign(id: string): Promise<void> {
  await apiRequest<void>('/api/me/recent-views', {
    method: 'POST',
    auth: 'user',
    body: { campaignId: Number(id) },
  })
}
