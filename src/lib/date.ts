export const WEEKDAY_LABELS_KO = ['일', '월', '화', '수', '목', '금', '토'] as const

export function toIsoDate(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Date를 로컬 기준 YYYY-MM-DD로 만든다.
// toISOString()은 UTC라서 KST 저녁에 하루 밀리므로 쓰지 않는다.
export function toLocalIsoDate(date: Date): string {
  return toIsoDate(date.getFullYear(), date.getMonth(), date.getDate())
}

// 자정 기준 오늘. 화면이 열려 있는 동안 날짜가 넘어가도 D-day가 흔들리지 않도록
// 모듈 로드 시점의 값을 재사용한다(새로고침 시 갱신).
function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export const TODAY_DATE = startOfToday()
export const TODAY_ISO = toLocalIsoDate(TODAY_DATE)

// YYYY-MM-DD 문자열을 로컬 자정 Date로 파싱한다.
// new Date('2026-05-23')은 UTC로 해석되므로 직접 분해한다.
export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

// 오늘부터 해당 날짜까지 남은 일수. 오늘이면 0, 지났으면 음수.
export function daysUntil(iso: string): number {
  if (!iso) return 0
  const diff = parseIsoDate(iso).getTime() - TODAY_DATE.getTime()
  return Math.round(diff / 86_400_000)
}

export function formatMonthDay(iso: string): string {
  return iso.slice(5).replace('-', '.')
}

// 년.월.일 전체 표기 (예: 2026.05.23)
export function formatFullDate(iso: string): string {
  return iso.slice(0, 10).replaceAll('-', '.')
}

const weekdayCache = new Map<string, string>()

export function getWeekdayKo(iso: string): string {
  const cached = weekdayCache.get(iso)
  if (cached !== undefined) return cached
  const label = WEEKDAY_LABELS_KO[parseIsoDate(iso).getDay()]
  weekdayCache.set(iso, label)
  return label
}

// 상대 시간 표기. 알림·서평 목록에서 쓴다.
export function formatRelativeTime(iso: string): string {
  const target = new Date(iso)
  if (Number.isNaN(target.getTime())) return ''
  const diffDays = Math.floor((Date.now() - target.getTime()) / 86_400_000)
  if (diffDays < 0) return formatMonthDay(iso.slice(0, 10))
  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '어제'
  if (diffDays < 7) return `${diffDays}일 전`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`
  return `${Math.floor(diffDays / 30)}달 전`
}
