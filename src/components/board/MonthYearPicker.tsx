import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useDismissOnOutside } from '@/lib/useDismissOnOutside'

interface MonthYearPickerProps {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}

export default function MonthYearPicker({
  year,
  month,
  onChange,
}: MonthYearPickerProps) {
  const [open, setOpen] = useState(false)
  const [pickerYear, setPickerYear] = useState(year)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismissOnOutside(ref, open, close)

  useEffect(() => {
    if (open) setPickerYear(year)
  }, [open, year])

  const selectMonth = (m: number) => {
    onChange(pickerYear, m)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors"
      >
        <span className="text-xl font-bold text-stone-800">
          {year}.{String(month + 1).padStart(2, '0')}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-stone-500 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-30 w-64 rounded-xl border border-stone-200 bg-white shadow-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setPickerYear((y) => y - 1)}
              className="p-1.5 rounded-md text-stone-500 hover:bg-stone-100"
              aria-label="이전 연도"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-stone-800">
              {pickerYear}년
            </span>
            <button
              type="button"
              onClick={() => setPickerYear((y) => y + 1)}
              className="p-1.5 rounded-md text-stone-500 hover:bg-stone-100"
              aria-label="다음 연도"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {Array.from({ length: 12 }, (_, i) => i).map((m) => {
              const isSelected = pickerYear === year && m === month
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => selectMonth(m)}
                  className={cn(
                    'py-2 text-sm font-medium rounded-lg transition-colors',
                    isSelected
                      ? 'bg-orange-500 text-white'
                      : 'text-stone-600 hover:bg-stone-100',
                  )}
                >
                  {m + 1}월
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
