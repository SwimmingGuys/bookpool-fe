import { useSyncExternalStore } from 'react'
import { createStore } from '@/lib/createStore'
import type {
  Recruitment,
  RecruitmentStatus,
  RecruitmentType,
  Category,
} from '@/types/recruitment'
import { TODAY_DATE } from '@/lib/date'

const EMPTY: Recruitment[] = []

const MS_PER_DAY = 86400000

// 백오피스에서 바로 확인할 수 있도록 샘플 모집글 1건을 시드한다.
// id는 adminReviews.ts의 시드 리뷰(recruitmentId: 'admin_sample_1')와 연결된다.
function buildSeed(): Recruitment[] {
  const recruitEndDate = '2026-05-28'
  return [
    {
      id: 'admin_sample_1',
      badgeLabel: 'Reviewer',
      ...deriveStatus(recruitEndDate),
      title: '모던 리액트 Deep Dive 서평단 모집',
      bookTitle: '모던 리액트 Deep Dive',
      publisher: '위키북스',
      category: 'IT/개발',
      viewCount: 0,
      recruitStartDate: '2026-05-18',
      recruitEndDate,
      announcementDate: '2026-05-30',
      description:
        '리액트의 동작 원리를 깊이 있게 다루는 책입니다. 실무 관점의 솔직한 리뷰를 남겨 주세요.',
    },
  ]
}

function isRecruitmentArray(value: unknown): value is Recruitment[] {
  return Array.isArray(value)
}

const adminRecruitmentsStore = createStore<Recruitment[]>(buildSeed(), {
  storageKey: 'bookpool:admin-recruitments',
  parse: (raw) => {
    try {
      const parsed = JSON.parse(raw)
      return isRecruitmentArray(parsed) ? parsed : buildSeed()
    } catch {
      return buildSeed()
    }
  },
})

// 마감일을 기준으로 남은 일수와 상태를 파생한다. (mockRecruitments.ts와 동일한 계산 방식)
// TODAY_DATE가 고정되어 있으므로 작성 시점에 계산해 저장해도 값이 흔들리지 않는다.
export function deriveStatus(recruitEndDate: string): {
  daysRemaining: number
  status: RecruitmentStatus
} {
  const end = new Date(recruitEndDate).getTime()
  const daysRemaining = Math.round((end - TODAY_DATE.getTime()) / MS_PER_DAY)
  return { daysRemaining, status: daysRemaining < 0 ? 'closed' : 'open' }
}

function generateId(): string {
  const suffix =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`
  return `admin_${suffix}`
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

export function createRecruitment(input: RecruitmentInput): Recruitment {
  const { daysRemaining, status } = deriveStatus(input.recruitEndDate)
  const recruitment: Recruitment = {
    id: generateId(),
    viewCount: 0,
    daysRemaining,
    status,
    ...input,
  }
  adminRecruitmentsStore.set((prev) => [recruitment, ...prev])
  return recruitment
}

export function updateRecruitment(
  id: string,
  patch: RecruitmentInput,
): Recruitment | undefined {
  let updated: Recruitment | undefined
  adminRecruitmentsStore.set((prev) =>
    prev.map((r) => {
      if (r.id !== id) return r
      const { daysRemaining, status } = deriveStatus(patch.recruitEndDate)
      updated = { ...r, ...patch, daysRemaining, status }
      return updated
    }),
  )
  return updated
}

export function deleteRecruitment(id: string): void {
  adminRecruitmentsStore.set((prev) => {
    const next = prev.filter((r) => r.id !== id)
    return next.length === prev.length ? prev : next
  })
}

export function getAdminRecruitmentById(id: string): Recruitment | undefined {
  return adminRecruitmentsStore.get().find((r) => r.id === id)
}

export function getAdminRecruitments(): Recruitment[] {
  return adminRecruitmentsStore.get()
}

export function useAdminRecruitments(): Recruitment[] {
  return useSyncExternalStore(
    adminRecruitmentsStore.subscribe,
    adminRecruitmentsStore.getSnapshot,
    () => EMPTY,
  )
}
