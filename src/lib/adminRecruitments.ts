import { useCallback } from 'react'
import type { PublishStatus, Recruitment, RecruitmentStatus } from '@/types/recruitment'
import {
  createAdminCampaign,
  deleteAdminCampaign,
  getCampaign,
  listAdminCampaigns,
  setCampaignPublishStatus,
  setCampaignStatus,
  updateAdminCampaign,
  type RecruitmentInput,
} from '@/lib/api/campaigns'
import { getAdminToken } from '@/lib/adminAuth'
import { useAsyncData, type LoadStatus } from '@/lib/useAsyncData'

export type { RecruitmentInput } from '@/lib/api/campaigns'

const EMPTY: Recruitment[] = []

export interface AdminRecruitmentListResult {
  recruitments: Recruitment[]
  status: LoadStatus
  error: Error | null
  reload: () => void
}

/**
 * 백오피스 목록. `publishStatus`로 검수 큐(draft)와 게시된 공고(published)를 나눠 본다.
 */
export function useAdminRecruitments(
  params: { publishStatus?: PublishStatus; query?: string } = {},
): AdminRecruitmentListResult {
  const result = useAsyncData(
    () =>
      listAdminCampaigns(
        { publishStatus: params.publishStatus, query: params.query || undefined },
        getAdminToken(),
      ),
    { content: EMPTY, page: 0, size: 100, totalElements: 0, totalPages: 0, hasNext: false },
    [params.publishStatus, params.query],
  )

  return {
    recruitments: result.data.content,
    status: result.status,
    error: result.error,
    reload: result.reload,
  }
}

// 수정 화면에서 쓰는 단건 조회. 목록을 거치지 않고 바로 받아온다.
export function useAdminRecruitment(id: string | undefined): {
  recruitment: Recruitment | null
  status: LoadStatus
  error: Error | null
} {
  const result = useAsyncData<Recruitment | null>(
    () => (id ? getCampaign(id) : Promise.resolve(null)),
    null,
    [id],
  )
  return { recruitment: result.data, status: result.status, error: result.error }
}

export async function createRecruitment(
  input: RecruitmentInput,
): Promise<Recruitment> {
  return createAdminCampaign(input, getAdminToken())
}

export async function updateRecruitment(
  id: string,
  input: RecruitmentInput,
  status?: RecruitmentStatus,
): Promise<Recruitment> {
  return updateAdminCampaign(id, input, status, getAdminToken())
}

export async function deleteRecruitment(id: string): Promise<void> {
  await deleteAdminCampaign(id, getAdminToken())
}

// 검수 큐 → 게시 (또는 반대로 내리기)
export async function publishRecruitment(
  id: string,
  publishStatus: PublishStatus,
): Promise<Recruitment> {
  return setCampaignPublishStatus(id, publishStatus, getAdminToken())
}

// 모집중 ↔ 마감 수동 전환
export async function changeRecruitmentStatus(
  id: string,
  status: RecruitmentStatus,
): Promise<Recruitment> {
  return setCampaignStatus(id, status, getAdminToken())
}

// 목록 화면에서 액션 후 재조회를 걸기 위한 헬퍼
export function useAdminRecruitmentActions(reload: () => void) {
  return {
    remove: useCallback(
      async (id: string) => {
        await deleteRecruitment(id)
        reload()
      },
      [reload],
    ),
    publish: useCallback(
      async (id: string, publishStatus: PublishStatus) => {
        await publishRecruitment(id, publishStatus)
        reload()
      },
      [reload],
    ),
    changeStatus: useCallback(
      async (id: string, status: RecruitmentStatus) => {
        await changeRecruitmentStatus(id, status)
        reload()
      },
      [reload],
    ),
  }
}
