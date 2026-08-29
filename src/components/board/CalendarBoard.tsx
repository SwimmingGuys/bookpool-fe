import { useMemo } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Recruitment } from '@/types/recruitment'
import { DATE_BASIS_OPTIONS, getDateByBasis, type DateBasis } from '@/lib/dateBasis'
import { TODAY_DATE, TODAY_ISO, WEEKDAY_LABELS_KO, toIsoDate } from '@/lib/date'
import MonthYearPicker from './MonthYearPicker'

interface CalendarBoardProps {
  recruitments: Recruitment[]
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
  dateBasis: DateBasis
  onChangeDateBasis: (basis: DateBasis) => void
  // 보고 있는 달. 그 달의 공고만 서버에서 받아오므로 부모가 소유한다.
  year: number
  monthIndex: number
  onChangeMonth: (year: number, monthIndex: number) => void
  loading?: boolean
  toolbar?: React.ReactNode
}

const MAX_PREVIEW = 3

export default function CalendarBoard({
  recruitments,
  selectedDate,
  onSelectDate,
  dateBasis,
  onChangeDateBasis,
  year,
  monthIndex,
  onChangeMonth,
  loading,
  toolbar,
}: CalendarBoardProps) {
  const cursor = useMemo(() => new Date(year, monthIndex, 1), [year, monthIndex])

  const deadlineMap = useMemo(() => {
    const map = new Map<string, Recruitment[]>()
    for (const r of recruitments) {
      const key = getDateByBasis(r, dateBasis)
      const list = map.get(key) ?? []
      list.push(r)
      map.set(key, list)
    }
    return map
  }, [recruitments, dateBasis])

  const monthMatrix = useMemo(() => buildMonthMatrix(cursor), [cursor])

  const shiftMonth = (delta: number) => {
    const next = new Date(year, monthIndex + delta, 1)
    onChangeMonth(next.getFullYear(), next.getMonth())
  }

  const goPrev = () => shiftMonth(-1)
  const goNext = () => shiftMonth(1)
  const goToday = () => onChangeMonth(TODAY_DATE.getFullYear(), TODAY_DATE.getMonth())

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <MonthYearPicker
            year={cursor.getFullYear()}
            month={cursor.getMonth()}
            onChange={onChangeMonth}
          />
          <div className="flex items-center">
            <button
              type="button"
              onClick={goPrev}
              className="rounded-md p-1.5 text-stone-500 transition-colors hover:bg-stone-100"
              aria-label="이전 달"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="rounded-md p-1.5 text-stone-500 transition-colors hover:bg-stone-100"
              aria-label="다음 달"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="ml-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
            >
              오늘
            </button>
            {loading && (
              <Loader2
                aria-label="공고를 불러오는 중"
                className="ml-1 h-4 w-4 animate-spin text-stone-400"
              />
            )}
          </div>
        </div>

        {/* 좁은 화면에서는 짧은 라벨을 쓰고, 그래도 넘치면 가로로 스크롤된다 */}
        <div
          role="tablist"
          aria-label="달력 표시 기준"
          className="inline-flex max-w-full overflow-x-auto scrollbar-none rounded-full bg-stone-100 p-0.5"
        >
          {DATE_BASIS_OPTIONS.map((opt) => {
            const active = dateBasis === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChangeDateBasis(opt.value)}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all',
                  active
                    ? 'bg-white text-stone-800 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700',
                )}
              >
                <span className="sm:hidden">{opt.short}</span>
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {toolbar && (
        <div className="border-b border-stone-100 px-3 py-2.5 sm:px-5">{toolbar}</div>
      )}

      <div className="grid grid-cols-7 border-b border-stone-200">
        {WEEKDAY_LABELS_KO.map((label, i) => (
          <div
            key={label}
            className={cn(
              'py-2.5 text-center text-xs font-bold sm:py-3.5 sm:text-sm',
              i === 0 && 'text-red-500',
              i === 6 && 'text-blue-500',
              i > 0 && i < 6 && 'text-stone-600',
            )}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {monthMatrix.map((cell, idx) => {
          const col = idx % 7
          const isLastCol = col === 6
          const row = Math.floor(idx / 7)
          const isLastRow = row === Math.floor((monthMatrix.length - 1) / 7)

          const borders = cn(
            !isLastCol && 'border-r border-stone-100',
            !isLastRow && 'border-b border-stone-100',
          )

          if (!cell) {
            return (
              <div
                key={`empty-${idx}`}
                className={cn('min-h-[60px] md:min-h-[150px]', borders)}
              />
            )
          }

          const items = deadlineMap.get(cell.iso) ?? []
          const isSelected = selectedDate === cell.iso
          const preview = items.slice(0, MAX_PREVIEW)
          const extra = items.length - preview.length

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => onSelectDate(isSelected ? null : cell.iso)}
              aria-pressed={isSelected}
              className={cn(
                'group flex min-h-[60px] flex-col items-stretch p-1 text-left transition-all md:min-h-[150px] md:p-2',
                borders,
                isSelected
                  ? 'ring-2 ring-inset ring-orange-400'
                  : 'hover:bg-stone-50/60',
              )}
            >
              <div className="flex items-center justify-between gap-0.5 md:mb-1.5">
                <span
                  className={cn(
                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold md:h-8 md:w-8 md:text-sm',
                    cell.isToday && 'bg-orange-500 text-white shadow-sm',
                    !cell.isToday && isSelected && 'text-orange-600',
                    !cell.isToday && !isSelected && col === 0 && 'text-red-500',
                    !cell.isToday && !isSelected && col === 6 && 'text-blue-500',
                    !cell.isToday && !isSelected && col > 0 && col < 6 && 'text-stone-700',
                  )}
                >
                  {cell.day}
                </span>
                {items.length > 0 && (
                  <span
                    className={cn(
                      'text-[11px] font-bold leading-none md:text-xs',
                      isSelected ? 'text-orange-600' : 'text-stone-500',
                    )}
                  >
                    {items.length}
                  </span>
                )}
              </div>

              {/* 좁은 화면에서는 제목 대신 점만 찍고, 목록은 아래에서 본다 */}
              {items.length > 0 && (
                <div className="mt-0.5 flex flex-wrap gap-0.5 md:hidden">
                  {items.slice(0, 3).map((r) => (
                    <span
                      key={r.id}
                      aria-hidden
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        r.badgeLabel === 'Reviewer' ? 'bg-orange-400' : 'bg-stone-400',
                      )}
                    />
                  ))}
                </div>
              )}

              <div className="hidden min-w-0 flex-1 space-y-1 md:block">
                {preview.map((r) => (
                  <div
                    key={r.id}
                    className={cn(
                      'truncate border-l-2 px-2 py-0.5 text-xs font-medium leading-snug',
                      r.badgeLabel === 'Reviewer'
                        ? 'border-orange-400 text-orange-700'
                        : 'border-stone-400 text-stone-700',
                    )}
                    title={r.bookTitle}
                  >
                    {r.bookTitle}
                  </div>
                ))}
                {extra > 0 && (
                  <div className="px-2 text-xs font-semibold text-stone-500">
                    +{extra}개 더보기
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface DayCell {
  day: number
  iso: string
  isToday: boolean
}

function buildMonthMatrix(cursor: Date): (DayCell | null)[] {
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (DayCell | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = toIsoDate(year, month, d)
    cells.push({ day: d, iso, isToday: iso === TODAY_ISO })
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}
