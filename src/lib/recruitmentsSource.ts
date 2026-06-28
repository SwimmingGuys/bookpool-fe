import { useEffect, useSyncExternalStore } from 'react'
import type { Recruitment } from '@/types/recruitment'
import * as campaignsApi from '@/lib/api/campaigns'

const EMPTY: Recruitment[] = []

let recruitmentsCache: Recruitment[] = []
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

export async function refreshRecruitments(): Promise<void> {
  if (loading) return loading
  loading = campaignsApi
    .listCampaigns({ size: 100 })
    .then((page) => {
      recruitmentsCache = page.content
      loaded = true
      emit()
    })
    .finally(() => {
      loading = null
    })
  return loading
}

export function useAllRecruitments(): Recruitment[] {
  useEffect(() => {
    if (!loaded) void refreshRecruitments()
  }, [])

  return useSyncExternalStore(
    subscribe,
    () => recruitmentsCache,
    () => EMPTY,
  )
}

export async function getRecruitmentByIdAny(id: string): Promise<Recruitment> {
  return campaignsApi.getCampaign(id)
}
