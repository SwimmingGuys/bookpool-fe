import { BookOpen, CalendarClock, Users } from 'lucide-react'
import {
  BOOK_FORMAT_LABELS,
  REVIEW_CHANNEL_LABELS,
  type Recruitment,
} from '@/types/recruitment'
import { formatFullDate } from '@/lib/date'

interface RecruitmentConditionsProps {
  recruitment: Recruitment
}

/**
 * 모집 인원·제공 형태·서평 의무사항. 신청 여부를 결정하는 정보라 일정과 분리해 보여준다.
 * 특히 서평 의무사항(채널·기한)은 미기재 시 분쟁이 잦은 항목이다.
 */
export default function RecruitmentConditions({
  recruitment,
}: RecruitmentConditionsProps) {
  const { capacity, bookFormat, reviewChannels, reviewDueDate, requirements } =
    recruitment

  const hasChannels = Boolean(reviewChannels && reviewChannels.length > 0)
  const hasAny =
    capacity !== undefined ||
    bookFormat !== undefined ||
    hasChannels ||
    Boolean(reviewDueDate) ||
    Boolean(requirements)

  if (!hasAny) return null

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-stone-800">모집 조건</h2>

      <dl className="grid grid-cols-1 gap-y-3 gap-x-6 text-sm sm:grid-cols-2">
        {capacity !== undefined && (
          <Row
            icon={<Users className="h-4 w-4" />}
            label="모집 인원"
            value={`${capacity.toLocaleString()}명`}
          />
        )}
        {bookFormat && (
          <Row
            icon={<BookOpen className="h-4 w-4" />}
            label="제공 도서"
            value={BOOK_FORMAT_LABELS[bookFormat]}
          />
        )}
        {reviewDueDate && (
          <Row
            icon={<CalendarClock className="h-4 w-4" />}
            label="서평 제출 기한"
            value={formatFullDate(reviewDueDate)}
          />
        )}
      </dl>

      {hasChannels && (
        <div className="mt-5 border-t border-stone-100 pt-4">
          <p className="text-xs font-medium text-stone-500">서평 등록 채널</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {reviewChannels?.map((channel) => (
              <li
                key={channel}
                className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600"
              >
                {REVIEW_CHANNEL_LABELS[channel]}
              </li>
            ))}
          </ul>
        </div>
      )}

      {requirements && (
        <div className="mt-5 border-t border-stone-100 pt-4">
          <p className="text-xs font-medium text-stone-500">신청 자격</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-600">
            {requirements}
          </p>
        </div>
      )}
    </section>
  )
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-stone-400">{icon}</span>
      <div>
        <dt className="text-xs font-medium text-stone-500">{label}</dt>
        <dd className="text-sm text-stone-700">{value}</dd>
      </div>
    </div>
  )
}
