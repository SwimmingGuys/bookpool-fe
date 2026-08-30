import { apiRequest, ENDPOINTS, type PageResponse } from '@/lib/api/client'
import { toRecruitment, type CampaignResponse } from '@/lib/api/campaigns'
import type { Application, ApplicationStatus } from '@/types/application'

const STATUS_TO_API: Record<ApplicationStatus, string> = {
  applied: 'APPLIED',
  selected: 'SELECTED',
  notSelected: 'NOT_SELECTED',
}

const STATUS_FROM_API: Record<string, ApplicationStatus> = {
  APPLIED: 'applied',
  SELECTED: 'selected',
  NOT_SELECTED: 'notSelected',
}

interface ApplicationResponse {
  id: string | number
  status: string
  appliedAt: string
  campaign: CampaignResponse
}

function toApplication(response: ApplicationResponse): Application {
  return {
    id: String(response.id),
    status: STATUS_FROM_API[response.status] ?? 'applied',
    appliedAt: response.appliedAt,
    recruitment: toRecruitment(response.campaign),
  }
}

/** 공고 카드·상세에서 '신청함' 표시를 그리기 위한 ID 목록. */
export async function listAppliedCampaignIds(): Promise<string[]> {
  const ids = await apiRequest<(number | string)[]>(`${ENDPOINTS.applications}/ids`)
  return ids.map(String)
}

export async function listApplications(
  status?: ApplicationStatus,
): Promise<Application[]> {
  const page = await apiRequest<PageResponse<ApplicationResponse>>(
    ENDPOINTS.applications,
    {
      query: {
        status: status ? STATUS_TO_API[status] : undefined,
        page: 0,
        size: 100,
      },
    },
  )
  return page.content.map(toApplication)
}

export async function markApplied(campaignId: string): Promise<Application> {
  return toApplication(
    await apiRequest<ApplicationResponse>(ENDPOINTS.applications, {
      method: 'POST',
      body: { campaignId: Number(campaignId) },
    }),
  )
}

/** 발표 결과를 사용자가 직접 표시한다(당첨/미당첨). */
export async function changeApplicationStatus(
  campaignId: string,
  status: ApplicationStatus,
): Promise<Application> {
  return toApplication(
    await apiRequest<ApplicationResponse>(`${ENDPOINTS.applications}/${campaignId}`, {
      method: 'PATCH',
      body: { status: STATUS_TO_API[status] },
    }),
  )
}

export async function cancelApplication(campaignId: string): Promise<void> {
  await apiRequest<void>(`${ENDPOINTS.applications}/${campaignId}`, {
    method: 'DELETE',
  })
}
