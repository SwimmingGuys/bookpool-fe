import type { Recruitment } from '@/types/recruitment'

export type DateBasis = 'recruitStart' | 'recruitEnd'

export const DATE_BASIS_OPTIONS: { value: DateBasis; label: string; short: string }[] = [
  { value: 'recruitStart', label: '모집 시작일', short: '모집 시작' },
  { value: 'recruitEnd', label: '모집 마감일', short: '모집 마감' },
]

export function getDateByBasis(r: Recruitment, basis: DateBasis): string {
  switch (basis) {
    case 'recruitStart':
      return r.recruitStartDate
    case 'recruitEnd':
      return r.recruitEndDate
  }
}

export function getDateBasisLabel(basis: DateBasis): string {
  return DATE_BASIS_OPTIONS.find((o) => o.value === basis)?.label ?? ''
}
