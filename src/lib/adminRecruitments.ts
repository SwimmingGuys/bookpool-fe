import { useEffect, useSyncExternalStore } from 'react'
import type { Recruitment } from '@/types/recruitment'
import {
  createAdminCampaign,
  deleteAdminCampaign,
  listAdminCampaigns,
  updateAdminCampaign,
  type RecruitmentInput,
} from '@/lib/api/campaigns'
import { refreshRecruitments } from '@/lib/recruitmentsSource'

export type { RecruitmentInput } from '@/lib/api/campaigns'

const EMPTY: Recruitment[] = []

let adminRecruitmentsCache: Recruitment[] = []
let loaded = false
let loading: Promise<void> | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export async function refreshAdminRecruitments(): Promise<void> {
  if (loading) return loading
  loading = listAdminCampaigns()
    .then((items) => {
      adminRecruitmentsCache = items
      loaded = true
      emit()
    })
    .finally(() => {
      loading = null
    })
  return loading
}

export async function createRecruitment(
  input: RecruitmentInput,
): Promise<Recruitment> {
  const created = await createAdminCampaign(input)
  adminRecruitmentsCache = [created, ...adminRecruitmentsCache]
  emit()
  void refreshRecruitments()
  return created
}

export async function updateRecruitment(
  id: string,
  input: RecruitmentInput,
): Promise<Recruitment | undefined> {
  const current = adminRecruitmentsCache.find((item) => item.id === id)
  if (!current) return undefined
  const updated = await updateAdminCampaign(current, input)
  adminRecruitmentsCache = adminRecruitmentsCache.map((item) =>
    item.id === id ? updated : item,
  )
  emit()
  void refreshRecruitments()
  return updated
}

export async function deleteRecruitment(id: string): Promise<void> {
  await deleteAdminCampaign(id)
  adminRecruitmentsCache = adminRecruitmentsCache.filter((item) => item.id !== id)
  emit()
  void refreshRecruitments()
}

export function getAdminRecruitmentById(id: string): Recruitment | undefined {
  return adminRecruitmentsCache.find((item) => item.id === id)
}

export function getAdminRecruitments(): Recruitment[] {
  return adminRecruitmentsCache
}

export function useAdminRecruitments(): Recruitment[] {
  useEffect(() => {
    if (!loaded) void refreshAdminRecruitments()
  }, [])

  return useSyncExternalStore(
    subscribe,
    () => adminRecruitmentsCache,
    () => EMPTY,
  )
}
