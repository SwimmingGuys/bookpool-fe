import { useMemo } from 'react'
import type { Recruitment } from '@/types/recruitment'
import { mockRecruitments, getRecruitmentById } from '@/data/mockRecruitments'
import {
  useAdminRecruitments,
  getAdminRecruitmentById,
} from '@/lib/adminRecruitments'

// 관리자가 작성한 모집글(별도 스토어)과 deterministic mock을 합쳐
// 공개 화면(보드/홈/상세)에 노출한다. 관리자 글을 앞쪽에 둔다.
export function useAllRecruitments(): Recruitment[] {
  const adminRecruitments = useAdminRecruitments()
  return useMemo(
    () => [...adminRecruitments, ...mockRecruitments],
    [adminRecruitments],
  )
}

export function getRecruitmentByIdAny(id: string): Recruitment | undefined {
  return getAdminRecruitmentById(id) ?? getRecruitmentById(id)
}
