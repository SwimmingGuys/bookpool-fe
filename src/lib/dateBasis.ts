import type { Recruitment } from '@/types/recruitment'

// 캘린더가 어떤 날짜를 기준으로 공고를 배치할지.
// 신청한 사람에게 가장 중요한 날짜가 발표일이라 축으로 함께 제공한다.
export type DateBasis = 'recruitStart' | 'recruitEnd' | 'announcement'

export const DATE_BASIS_OPTIONS: { value: DateBasis; label: string; short: string }[] = [
  { value: 'recruitStart', label: '모집 시작일', short: '모집 시작' },
  { value: 'recruitEnd', label: '모집 마감일', short: '모집 마감' },
  { value: 'announcement', label: '발표일', short: '발표' },
]

export function getDateByBasis(r: Recruitment, basis: DateBasis): string {
  switch (basis) {
    case 'recruitStart':
      return r.recruitStartDate
    case 'recruitEnd':
      return r.recruitEndDate
    case 'announcement':
      return r.announcementDate
  }
}

export function getDateBasisLabel(basis: DateBasis): string {
  return DATE_BASIS_OPTIONS.find((o) => o.value === basis)?.label ?? ''
}
