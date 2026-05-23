import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Recruitment } from '@/types/recruitment'
import {
  DATE_BASIS_OPTIONS,
  getDateByBasis,
  type DateBasis,
} from '@/lib/dateBasis'
import MonthYearPicker from './MonthYearPicker'

interface CalendarBoardProps {
  recruitments: Recruitment[]
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
  dateBasis: DateBasis
  onChangeDateBasis: (basis: DateBasis) => void
  toolbar?: React.ReactNode
}

const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const TODAY_ISO = '2026-05-23'
const MAX_PREVIEW = 3

export default function CalendarBoard({
  recruitments,
  selectedDate,
  onSelectDate,
  dateBasis,
  onChangeDateBasis,
  toolbar,
}: CalendarBoardProps) {
  const [cursor, setCursor] = useState(() => {
    const today = new Date(TODAY_ISO)
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

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

  const goPrev = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
  const goNext = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
  const goToday = () => {
    const today = new Date(TODAY_ISO)
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <MonthYearPicker
            year={cursor.getFullYear()}
            month={cursor.getMonth()}
            onChange={(y, m) => setCursor(new Date(y, m, 1))}
          />
          <div className="flex items-center">
            <button
              type="button"
              onClick={goPrev}
              className="p-1.5 rounded-md text-stone-500 hover:bg-stone-100"
              aria-label="이전 달"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="p-1.5 rounded-md text-stone-500 hover:bg-stone-100"
              aria-label="다음 달"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="ml-1 px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
            >
              오늘
            </button>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="달력 표시 기준"
          className="inline-flex rounded-full bg-stone-100 p-0.5"
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
                  'px-3 py-1 text-xs font-medium rounded-full transition-all',
                  active
                    ? 'bg-white text-stone-800 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700',
                )}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {toolbar && (
        <div className="px-5 py-2.5 border-b border-stone-100">
          {toolbar}
        </div>
      )}

      <div className="grid grid-cols-7 border-b border-stone-200">
        {WEEK_LABELS.map((label, i) => (
          <div
            key={label}
            className={cn(
              'text-center text-sm font-bold py-3.5',
              i === 0 && 'text-red-500',
              i === 6 && 'text-blue-500',
              i > 0 && i < 6 && 'text-stone-600',
            )}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-[repeat(6,minmax(0,1fr))]">
        {monthMatrix.map((cell, idx) => {
          const col = idx % 7
          const isLastCol = col === 6
          const row = Math.floor(idx / 7)
          const isLastRow = row === Math.floor((monthMatrix.length - 1) / 7)

          if (!cell) {
            return (
              <div
                key={`empty-${idx}`}
                className={cn(
                  'min-h-[150px]',
                  !isLastCol && 'border-r border-stone-100',
                  !isLastRow && 'border-b border-stone-100',
                )}
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
              className={cn(
                'group min-h-[150px] flex flex-col items-stretch p-2 text-left transition-all',
                !isLastCol && 'border-r border-stone-100',
                !isLastRow && 'border-b border-stone-100',
                isSelected
                  ? 'ring-2 ring-orange-400 ring-inset'
                  : 'hover:bg-stone-50/60',
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={cn(
                    'inline-flex items-center justify-center text-sm font-bold rounded-full w-8 h-8',
                    cell.isToday && 'bg-orange-500 text-white shadow-sm',
                    !cell.isToday && isSelected && 'text-orange-600',
                    !cell.isToday && !isSelected && col === 0 && 'text-red-500',
                    !cell.isToday && !isSelected && col === 6 && 'text-blue-500',
                    !cell.isToday &&
                      !isSelected &&
                      col > 0 &&
                      col < 6 &&
                      'text-stone-700',
                  )}
                >
                  {cell.day}
                </span>
                {items.length > 0 && (
                  <span
                    className={cn(
                      'text-xs font-bold leading-none',
                      isSelected ? 'text-orange-600' : 'text-stone-500',
                    )}
                  >
                    {items.length}
                  </span>
                )}
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                {preview.map((r) => (
                  <div
                    key={r.id}
                    className={cn(
                      'truncate text-[13px] font-medium leading-snug px-2 py-0.5 border-l-2',
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
                  <div className="text-xs text-stone-500 font-semibold px-2">
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
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, iso, isToday: iso === TODAY_ISO })
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}
