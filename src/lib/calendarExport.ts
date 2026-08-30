import type { Recruitment } from '@/types/recruitment'
import { formatFullDate, parseIsoDate } from '@/lib/date'
import { RECRUITMENT_TYPE_LABELS } from '@/types/recruitment'

/**
 * 공고의 날짜를 사용자의 캘린더 앱(구글·애플·아웃룩)으로 내보낸다.
 *
 * 서평단은 마감·발표·서평 제출 중 하나만 놓쳐도 참여가 끝나는데, 지금은 그 날짜가
 * 서비스 안에만 있다. .ics는 백엔드 없이 프론트만으로 그 날짜를 사용자 캘린더에
 * 옮겨 놓을 수 있는 유일한 경로다.
 *
 * RFC 5545 기준: CRLF 줄바꿈, 75옥텟 폴딩, TEXT 값 이스케이프, 종일 일정의
 * DTEND는 배타적(다음 날)이다.
 */

const CRLF = '\r\n'
const PRODID = '-//BookPool//Recruitment Calendar//KO'
// UID의 도메인 파트. 캘린더 앱은 UID가 같으면 같은 일정으로 보고 갱신한다.
const UID_DOMAIN = 'bookpool.co.kr'

export type CalendarEventKind = 'recruitEnd' | 'announcement' | 'reviewDue'

const EVENT_LABELS: Record<CalendarEventKind, string> = {
  recruitEnd: '신청 마감',
  announcement: '발표',
  reviewDue: '서평 제출 마감',
}

interface CalendarEvent {
  kind: CalendarEventKind
  date: string
  summary: string
  description: string
  url?: string
}

// TEXT 값 이스케이프. 콜론은 이스케이프 대상이 아니다.
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length
}

// 75옥텟을 넘는 줄은 CRLF + 공백 한 칸으로 접는다.
// 한글은 문자당 3바이트라 문자 수가 아니라 바이트로 세야 한다.
function foldLine(line: string): string {
  if (byteLength(line) <= 75) return line

  const chunks: string[] = []
  let current = ''
  let currentBytes = 0
  // 첫 줄은 75옥텟, 이어지는 줄은 앞의 공백 한 칸을 포함해 75옥텟.
  let limit = 75

  for (const char of line) {
    const size = byteLength(char)
    if (currentBytes + size > limit) {
      chunks.push(current)
      current = ''
      currentBytes = 0
      limit = 74
    }
    current += char
    currentBytes += size
  }
  if (current) chunks.push(current)

  return chunks.join(`${CRLF} `)
}

function toIcsDate(iso: string): string {
  return iso.slice(0, 10).replaceAll('-', '')
}

// 종일 일정의 DTEND는 배타적이라 하루를 더한다.
function nextDay(iso: string): string {
  const date = parseIsoDate(iso)
  date.setDate(date.getDate() + 1)
  return toIcsDate(
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`,
  )
}

function toIcsTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  )
}

function detailUrl(id: string): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/recruitments/${id}`
}

/** 공고에서 실제로 날짜가 있는 일정만 추린다. */
export function toCalendarEvents(recruitment: Recruitment): CalendarEvent[] {
  const typeLabel = RECRUITMENT_TYPE_LABELS[recruitment.badgeLabel]
  const book = recruitment.bookTitle || recruitment.title.replace(/\n/g, ' ')
  const url = detailUrl(recruitment.id)

  const candidates: { kind: CalendarEventKind; date?: string }[] = [
    { kind: 'recruitEnd', date: recruitment.recruitEndDate },
    { kind: 'announcement', date: recruitment.announcementDate },
    { kind: 'reviewDue', date: recruitment.reviewDueDate },
  ]

  return candidates
    .filter((c): c is { kind: CalendarEventKind; date: string } => Boolean(c.date))
    .map(({ kind, date }) => ({
      kind,
      date,
      summary: `[${typeLabel}] ${book} — ${EVENT_LABELS[kind]}`,
      description: [
        `${recruitment.publisher} · ${typeLabel} 모집`,
        `신청 기간 ${formatFullDate(recruitment.recruitStartDate)} ~ ${formatFullDate(recruitment.recruitEndDate)}`,
        recruitment.applyUrl ? `신청: ${recruitment.applyUrl}` : '',
        url ? `공고: ${url}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      url: url || undefined,
    }))
}

function buildEvent(
  recruitment: Recruitment,
  event: CalendarEvent,
  stamp: string,
): string[] {
  const lines = [
    'BEGIN:VEVENT',
    `UID:bookpool-${recruitment.id}-${event.kind}@${UID_DOMAIN}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${toIcsDate(event.date)}`,
    `DTEND;VALUE=DATE:${nextDay(event.date)}`,
    `SUMMARY:${escapeText(event.summary)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
  ]
  if (event.url) lines.push(`URL:${escapeText(event.url)}`)
  lines.push(
    'TRANSP:TRANSPARENT',
    // 하루 전 알림. 마감·발표를 놓치는 게 이 서비스에서 가장 아픈 실패라 기본으로 넣는다.
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(event.summary)}`,
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
  )
  return lines
}

/** 공고 하나의 일정을 .ics 문자열로 만든다. 날짜가 하나도 없으면 빈 문자열. */
export function buildRecruitmentIcs(recruitment: Recruitment): string {
  const events = toCalendarEvents(recruitment)
  if (events.length === 0) return ''

  const stamp = toIcsTimestamp(new Date())
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${PRODID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events.flatMap((event) => buildEvent(recruitment, event, stamp)),
    'END:VCALENDAR',
  ]

  return `${lines.map(foldLine).join(CRLF)}${CRLF}`
}

// 파일명에 쓸 수 없는 문자를 걷어낸다.
function toFileName(recruitment: Recruitment): string {
  const base = (recruitment.bookTitle || recruitment.title)
    .replace(/\n/g, ' ')
    .replace(/[\\/:*?"<>|]/g, '')
    .trim()
    .slice(0, 40)
  return `${base || 'bookpool'}-일정.ics`
}

/** .ics를 파일로 내려받는다. 성공 여부를 돌려줘 호출부가 토스트를 띄운다. */
export function downloadRecruitmentIcs(recruitment: Recruitment): boolean {
  const ics = buildRecruitmentIcs(recruitment)
  if (!ics) return false

  try {
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = toFileName(recruitment)
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    // 클릭 직후 해제하면 일부 브라우저에서 다운로드가 취소된다.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    return true
  } catch {
    return false
  }
}

/** 구글 캘린더 웹에 일정 하나를 바로 추가하는 링크. 모바일에서 .ics보다 편하다. */
export function toGoogleCalendarUrl(
  recruitment: Recruitment,
  kind: CalendarEventKind,
): string | null {
  const event = toCalendarEvents(recruitment).find((e) => e.kind === kind)
  if (!event) return null

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.summary,
    dates: `${toIcsDate(event.date)}/${nextDay(event.date)}`,
    details: event.description,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export { EVENT_LABELS as CALENDAR_EVENT_LABELS }
