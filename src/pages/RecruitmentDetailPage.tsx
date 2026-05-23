import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, Eye, Star } from 'lucide-react'
import { cn } from '@/lib/cn'
import { getRecruitmentById } from '@/data/mockRecruitments'
import { useFavorites, useReadRecruitments } from '@/lib/recruitmentState'
import Badge from '@/components/ui/Badge'
import DDay from '@/components/ui/DDay'

export default function RecruitmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { markAsRead } = useReadRecruitments()
  const { isFavorite, toggleFavorite } = useFavorites()

  const recruitment = useMemo(
    () => (id ? getRecruitmentById(id) : undefined),
    [id],
  )

  useEffect(() => {
    if (recruitment) markAsRead(recruitment.id)
  }, [recruitment, markAsRead])

  if (!recruitment) {
    return <NotFound />
  }

  const isClosed = recruitment.status === 'closed'
  const fav = isFavorite(recruitment.id)

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      <Link
        to="/board"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        보드로 돌아가기
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge label={recruitment.badgeLabel} />
          {isClosed ? (
            <span className="text-sm font-medium text-stone-400">모집 마감</span>
          ) : (
            <DDay daysRemaining={recruitment.daysRemaining} />
          )}
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-800 leading-tight flex-1 min-w-0">
            {recruitment.title.replace(/\n/g, ' ')}
          </h1>
          <div className="flex items-center gap-3 shrink-0 mt-2">
            <span className="inline-flex items-center gap-1 text-sm text-stone-400">
              <Eye className="w-4 h-4" />
              {recruitment.viewCount.toLocaleString()}
            </span>
            <button
              type="button"
              onClick={() => toggleFavorite(recruitment.id)}
              aria-label={fav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              aria-pressed={fav}
              className={cn(
                'p-2 rounded-lg border transition-colors',
                fav
                  ? 'border-amber-200 bg-amber-50 text-amber-500 hover:bg-amber-100'
                  : 'border-stone-200 text-stone-400 hover:text-stone-700 hover:bg-stone-50',
              )}
            >
              <Star className={cn('w-4 h-4', fav && 'fill-amber-400')} />
            </button>
          </div>
        </div>
        <p className="mt-3 text-sm text-stone-500">
          {recruitment.publisher} · {recruitment.category}
        </p>
      </header>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 mb-6">
        <h2 className="text-base font-semibold text-stone-800 mb-3">도서 소개</h2>
        <p className="text-sm leading-relaxed text-stone-600 whitespace-pre-line">
          {recruitment.description}
        </p>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-base font-semibold text-stone-800 mb-4">일정</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <InfoRow
            icon={<Calendar className="w-4 h-4" />}
            label="신청 기간"
            value={`${recruitment.recruitStartDate} ~ ${recruitment.recruitEndDate}`}
          />
          <InfoRow
            icon={<Clock className="w-4 h-4" />}
            label="발표일"
            value={recruitment.announcementDate}
          />
        </dl>
      </section>
    </div>
  )
}

function InfoRow({
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
      <span className="text-stone-400 mt-0.5">{icon}</span>
      <div>
        <dt className="text-xs font-medium text-stone-500">{label}</dt>
        <dd className="text-sm text-stone-700">{value}</dd>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="px-6 py-20 max-w-2xl mx-auto text-center">
      <h1 className="text-2xl font-bold text-stone-800">존재하지 않는 공고입니다</h1>
      <p className="mt-2 text-sm text-stone-500">
        삭제되었거나 잘못된 링크로 접근했을 수 있어요.
      </p>
      <Link
        to="/board"
        className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
      >
        보드로 돌아가기
      </Link>
    </div>
  )
}
