import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, ExternalLink, Eye, Star } from 'lucide-react'
import { cn } from '@/lib/cn'
import { RECRUITMENT_SOURCE_LABELS } from '@/types/recruitment'
import { useRecruitment } from '@/lib/recruitmentsSource'
import { useFavoriteWithAuth, useReadRecruitments } from '@/lib/recruitmentState'
import { isNotFound } from '@/lib/api/errors'
import { formatFullDate } from '@/lib/date'
import { usePageMeta } from '@/lib/useDocumentTitle'
import Badge from '@/components/ui/Badge'
import DDay from '@/components/ui/DDay'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import ShareButton from '@/components/ui/ShareButton'
import ApplyBar from '@/components/recruitment/ApplyBar'
import RecruitmentConditions from '@/components/recruitment/RecruitmentConditions'
import ReviewSection from '@/components/recruitment/ReviewSection'

export default function RecruitmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { markAsRead } = useReadRecruitments()
  const { isFavorite, toggleFavorite } = useFavoriteWithAuth()
  const { recruitment, status, error, reload } = useRecruitment(id)

  useEffect(() => {
    if (recruitment) markAsRead(recruitment.id)
  }, [recruitment, markAsRead])

  const plainTitle = recruitment?.title.replace(/\n/g, ' ')

  usePageMeta({
    title: plainTitle ?? '공고',
    description: recruitment
      ? `${recruitment.publisher} · ${recruitment.bookTitle} — ${recruitment.description.slice(0, 120)}`
      : undefined,
    image: recruitment?.coverImage,
    type: 'article',
  })

  if (status === 'loading') return <DetailSkeleton />

  // 없는 공고(404)와 조회 실패(네트워크·서버)를 구분해서 보여준다.
  if (status === 'error') {
    return isNotFound(error) ? <NotFound /> : <LoadFailed onRetry={reload} />
  }

  if (!recruitment) return <NotFound />

  const isClosed = recruitment.status === 'closed'
  const fav = isFavorite(recruitment.id)

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        to="/board"
        className="mb-6 inline-flex items-center gap-1 text-sm text-stone-500 no-underline hover:text-stone-700"
      >
        <ArrowLeft className="h-4 w-4" />
        보드로 돌아가기
      </Link>

      <header className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <Badge label={recruitment.badgeLabel} />
          {isClosed ? (
            <span className="text-sm font-medium text-stone-400">모집 마감</span>
          ) : (
            <DDay daysRemaining={recruitment.daysRemaining} />
          )}
        </div>

        <div className="flex items-start justify-between gap-4">
          <h1 className="min-w-0 flex-1 text-2xl font-bold leading-tight text-stone-800">
            {plainTitle}
          </h1>
          <div className="mt-2 flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center gap-1 text-sm text-stone-400">
              <Eye className="h-4 w-4" />
              {recruitment.viewCount.toLocaleString()}
            </span>
            <ShareButton
              title={plainTitle ?? 'BookPool'}
              text={`${recruitment.publisher} · ${recruitment.bookTitle}`}
            />
            <button
              type="button"
              onClick={() => toggleFavorite(recruitment.id)}
              aria-label={fav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              aria-pressed={fav}
              className={cn(
                'rounded-lg border p-2 transition-colors',
                fav
                  ? 'border-amber-200 bg-amber-50 text-amber-500 hover:bg-amber-100'
                  : 'border-stone-200 text-stone-400 hover:bg-stone-50 hover:text-stone-700',
              )}
            >
              <Star className={cn('h-4 w-4', fav && 'fill-amber-400')} />
            </button>
          </div>
        </div>

        <p className="mt-3 text-sm text-stone-500">
          <Link
            to={`/publishers/${encodeURIComponent(recruitment.publisher)}`}
            className="font-medium text-stone-600 no-underline hover:text-orange-600"
          >
            {recruitment.publisher}
          </Link>{' '}
          · {recruitment.category}
        </p>
      </header>

      <ApplyBar recruitment={recruitment} className="mb-6" />

      <section className="mb-6 rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="mb-3 text-base font-semibold text-stone-800">도서 소개</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-stone-600">
          {recruitment.description}
        </p>
      </section>

      <section className="mb-6 rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-stone-800">일정</h2>
        <dl className="grid grid-cols-1 gap-y-3 gap-x-6 text-sm sm:grid-cols-2">
          <InfoRow
            icon={<Calendar className="h-4 w-4" />}
            label="신청 기간"
            value={`${formatFullDate(recruitment.recruitStartDate)} ~ ${formatFullDate(recruitment.recruitEndDate)}`}
          />
          <InfoRow
            icon={<Clock className="h-4 w-4" />}
            label="발표일"
            value={formatFullDate(recruitment.announcementDate)}
          />
        </dl>
      </section>

      <div className="mb-6">
        <RecruitmentConditions recruitment={recruitment} />
      </div>

      <div className="mb-6">
        <ReviewSection recruitmentId={recruitment.id} />
      </div>

      {recruitment.sourceUrl && (
        <p className="text-xs text-stone-400">
          {RECRUITMENT_SOURCE_LABELS[recruitment.source]}에서 수집된 공고입니다.{' '}
          <a
            href={recruitment.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-stone-500 no-underline hover:text-orange-600"
          >
            원문 보기
            <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      )}
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
      <span className="mt-0.5 text-stone-400">{icon}</span>
      <div>
        <dt className="text-xs font-medium text-stone-500">{label}</dt>
        <dd className="text-sm text-stone-700">{value}</dd>
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-6 h-5 w-20 rounded-full" />
      <Skeleton className="mt-3 h-8 w-3/4" />
      <Skeleton className="mt-3 h-4 w-40" />
      <Skeleton className="mt-8 h-24 w-full rounded-2xl" />
      <Skeleton className="mt-6 h-40 w-full rounded-2xl" />
      <Skeleton className="mt-6 h-32 w-full rounded-2xl" />
    </div>
  )
}

function LoadFailed({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <ErrorState
        title="공고를 불러오지 못했습니다."
        description="네트워크 상태를 확인한 뒤 다시 시도해 주세요."
        onRetry={onRetry}
      />
    </div>
  )
}

function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="text-2xl font-bold text-stone-800">존재하지 않는 공고입니다</h1>
      <p className="mt-2 text-sm text-stone-500">
        삭제되었거나 잘못된 링크로 접근했을 수 있어요.
      </p>
      <Link
        to="/board"
        className="mt-6 inline-block rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-orange-600"
      >
        보드로 돌아가기
      </Link>
    </div>
  )
}
