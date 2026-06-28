import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { useAuth } from '@/lib/auth'
import type { Inquiry } from '@/types/inquiry'
import {
  createInquiry,
  listInquiries,
  type SubmitInquiryPayload,
} from '@/lib/api/inquiries'

export type { SubmitInquiryPayload } from '@/lib/api/inquiries'

const EMPTY: readonly Inquiry[] = []

let inquiriesUserId: string | null = null
let inquiriesCache: Inquiry[] = []
let loading: Promise<void> | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

async function refreshInquiries(userId: string | null): Promise<void> {
  if (!userId) {
    inquiriesCache = []
    emit()
    return
  }
  if (loading) return loading
  loading = listInquiries()
    .then((items) => {
      inquiriesCache = items
      emit()
    })
    .finally(() => {
      loading = null
    })
  return loading
}

export function useInquiries() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  useEffect(() => {
    if (userId === inquiriesUserId) return
    inquiriesUserId = userId
    void refreshInquiries(userId)
  }, [userId])

  const list = useSyncExternalStore(
    subscribe,
    () => inquiriesCache,
    () => EMPTY as Inquiry[],
  )

  const inquiries = useMemo(
    () => (user !== null ? list : (EMPTY as Inquiry[])),
    [user, list],
  )

  return {
    inquiries,
    submitInquiry: async (payload: SubmitInquiryPayload) => {
      if (!user) return
      const inquiry = await createInquiry({
        type: payload.type,
        title: payload.title.trim(),
        content: payload.content.trim(),
      })
      inquiriesCache = [inquiry, ...inquiriesCache]
      emit()
    },
  }
}
