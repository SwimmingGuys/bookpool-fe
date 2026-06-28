import { useMemo } from 'react'
import { useSyncExternalStore } from 'react'
import { createStore } from '@/lib/createStore'
import type { Review, ReviewStatus } from '@/types/review'

const EMPTY: Review[] = []

const SEED_REVIEWS: Review[] = [
  {
    id: 'review_seed_1',
    recruitmentId: 'admin_sample_1',
    author: '북러버',
    rating: 5,
    content: '실무에 바로 적용할 수 있는 내용이 많아 만족스러웠습니다.',
    status: 'visible',
    createdAt: '2026-05-20T09:00:00.000Z',
  },
  {
    id: 'review_seed_2',
    recruitmentId: 'admin_sample_1',
    author: '독서가J',
    rating: 4,
    content: '구성이 깔끔하고 예제가 친절했어요. 입문자에게 추천합니다.',
    status: 'visible',
    createdAt: '2026-05-21T11:30:00.000Z',
  },
]

function isReviewArray(value: unknown): value is Review[] {
  return Array.isArray(value)
}

const adminReviewsStore = createStore<Review[]>(SEED_REVIEWS, {
  storageKey: 'bookpool:admin-reviews',
  parse: (raw) => {
    try {
      const parsed = JSON.parse(raw)
      return isReviewArray(parsed) ? parsed : SEED_REVIEWS
    } catch {
      return SEED_REVIEWS
    }
  },
})

function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? `review_${crypto.randomUUID()}`
    : `review_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export interface ReviewInput {
  recruitmentId: string
  author: string
  rating: number
  content: string
  status?: ReviewStatus
}

export function createReview(input: ReviewInput): Review {
  const review: Review = {
    id: generateId(),
    recruitmentId: input.recruitmentId,
    author: input.author.trim(),
    rating: input.rating,
    content: input.content.trim(),
    status: input.status ?? 'visible',
    createdAt: new Date().toISOString(),
  }
  adminReviewsStore.set((prev) => [review, ...prev])
  return review
}

export interface ReviewPatch {
  author: string
  rating: number
  content: string
  status: ReviewStatus
}

export function updateReview(id: string, patch: ReviewPatch): void {
  adminReviewsStore.set((prev) =>
    prev.map((r) =>
      r.id === id
        ? {
            ...r,
            author: patch.author.trim(),
            rating: patch.rating,
            content: patch.content.trim(),
            status: patch.status,
          }
        : r,
    ),
  )
}

export function deleteReview(id: string): void {
  adminReviewsStore.set((prev) => {
    const next = prev.filter((r) => r.id !== id)
    return next.length === prev.length ? prev : next
  })
}

export function toggleReviewStatus(id: string): void {
  adminReviewsStore.set((prev) =>
    prev.map((r) =>
      r.id === id
        ? { ...r, status: r.status === 'visible' ? 'hidden' : 'visible' }
        : r,
    ),
  )
}

export function useReviewsByRecruitment(recruitmentId: string): Review[] {
  const all = useSyncExternalStore(
    adminReviewsStore.subscribe,
    adminReviewsStore.getSnapshot,
    () => EMPTY,
  )
  return useMemo(
    () => all.filter((r) => r.recruitmentId === recruitmentId),
    [all, recruitmentId],
  )
}
