export const WEEKDAY_LABELS_KO = ['일', '월', '화', '수', '목', '금', '토'] as const

// Demo "today" — used by mock data and calendar so the UI stays deterministic
export const TODAY_ISO = '2026-05-23'
export const TODAY_DATE = new Date(TODAY_ISO)

export function formatMonthDay(iso: string): string {
  return iso.slice(5).replace('-', '.')
}

const weekdayCache = new Map<string, string>()

export function getWeekdayKo(iso: string): string {
  const cached = weekdayCache.get(iso)
  if (cached !== undefined) return cached
  const label = WEEKDAY_LABELS_KO[new Date(iso).getDay()]
  weekdayCache.set(iso, label)
  return label
}

export function toIsoDate(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
