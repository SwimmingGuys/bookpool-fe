import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { useAuth } from '@/lib/auth'
import { TODAY_ISO } from '@/lib/date'
import type { Inquiry, InquiryType } from '@/types/inquiry'

const EMPTY: readonly Inquiry[] = []

function isInquiryArray(value: unknown): value is Inquiry[] {
  return Array.isArray(value)
}

function loadInquiries(userId: string | null): Inquiry[] {
  const key = inquiriesKey(userId)
  if (!key || typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return isInquiryArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveInquiries(userId: string | null, value: Inquiry[]) {
  const key = inquiriesKey(userId)
  if (!key || typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota
  }
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `inquiry_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

// ---------- Per-user inquiry store ----------

let inquiriesUserId: string | null = null
let inquiriesCache: Inquiry[] = []
const listeners = new Set<() => void>()

function inquiriesKey(userId: string | null): string | null {
  return userId ? `bookpool:inquiries:${userId}` : null
}

function emit() {
  listeners.forEach((l) => l())
}

function syncUser(userId: string | null) {
  if (userId === inquiriesUserId) return
  inquiriesUserId = userId
  inquiriesCache = loadInquiries(userId)
  emit()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export interface SubmitInquiryPayload {
  type: InquiryType
  title: string
  content: string
}

export function useInquiries() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  useEffect(() => {
    syncUser(userId)
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
    submitInquiry: (payload: SubmitInquiryPayload) => {
      if (!user) return
      const inquiry: Inquiry = {
        id: makeId(),
        type: payload.type,
        title: payload.title.trim(),
        content: payload.content.trim(),
        status: 'pending',
        createdAt: TODAY_ISO,
      }
      inquiriesCache = [inquiry, ...inquiriesCache]
      saveInquiries(inquiriesUserId, inquiriesCache)
      emit()
    },
  }
}
