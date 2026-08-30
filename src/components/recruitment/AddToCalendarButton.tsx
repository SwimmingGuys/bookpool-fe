import { useCallback, useMemo, useRef, useState } from 'react'
import { CalendarPlus, ChevronDown, Download, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Recruitment } from '@/types/recruitment'
import { useDismissOnOutside } from '@/lib/useDismissOnOutside'
import { showToast } from '@/lib/toast'
import { formatMonthDay } from '@/lib/date'
import {
  CALENDAR_EVENT_LABELS,
  downloadRecruitmentIcs,
  toCalendarEvents,
  toGoogleCalendarUrl,
} from '@/lib/calendarExport'

interface AddToCalendarButtonProps {
  recruitment: Recruitment
  className?: string
}

/**
 * 공고의 마감·발표·서평 제출 날짜를 사용자의 캘린더로 옮긴다.
 *
 * .ics 파일은 애플/아웃룩까지 한 번에 덮고, 구글 캘린더는 링크로 바로 열 수 있어
 * 모바일에서 파일을 여는 것보다 편하다. 둘 다 두는 이유다.
 */
export default function AddToCalendarButton({
  recruitment,
  className,
}: AddToCalendarButtonProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismissOnOutside(ref, open, close)

  const events = useMemo(() => toCalendarEvents(recruitment), [recruitment])

  // 날짜가 하나도 없는 공고는 내보낼 게 없다.
  if (events.length === 0) return null

  const handleDownload = () => {
    setOpen(false)
    if (downloadRecruitmentIcs(recruitment)) {
      showToast('캘린더 파일을 내려받았습니다.', 'success')
      return
    }
    showToast('캘린더 파일을 만들지 못했습니다.', 'error')
  }

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50 hover:text-stone-800"
      >
        <CalendarPlus className="h-4 w-4 text-stone-400" />
        내 캘린더에 추가
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1.5 w-64 rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleDownload}
            className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50"
          >
            <Download className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
            <span>
              캘린더 파일(.ics) 내려받기
              <span className="mt-0.5 block font-normal text-stone-400">
                {events.map((e) => CALENDAR_EVENT_LABELS[e.kind]).join(' · ')} —{' '}
                {events.length}개 일정
              </span>
            </span>
          </button>

          <p className="mt-1 border-t border-stone-100 px-2.5 pb-1 pt-2 text-[11px] font-semibold text-stone-400">
            구글 캘린더에 하나씩 추가
          </p>

          {events.map((event) => {
            const href = toGoogleCalendarUrl(recruitment, event.kind)
            if (!href) return null
            return (
              <a
                key={event.kind}
                role="menuitem"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-600 no-underline transition-colors hover:bg-stone-50"
              >
                <span>
                  {CALENDAR_EVENT_LABELS[event.kind]}
                  <span className="ml-1.5 font-normal text-stone-400">
                    {formatMonthDay(event.date)}
                  </span>
                </span>
                <ExternalLink className="h-3 w-3 shrink-0 text-stone-400" />
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
