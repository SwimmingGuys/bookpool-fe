import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck, Clock, ExternalLink, MessageSquareQuote, Star } from 'lucide-react'
import { cn } from '@/lib/cn'
import { REVIEW_CHANNEL_LABELS } from '@/types/recruitment'
import {
  REVIEW_SUBMISSION_STATUS_LABELS,
  type Review,
  type ReviewSubmissionStatus,
} from '@/types/review'
import { useAuth } from '@/lib/auth'
import {
  listBookmarkedCampaigns,
  listRecentCampaigns,
} from '@/lib/api/campaigns'
import { useRecruitmentsByLoader } from '@/lib/recruitmentsSource'
import { useFavorites } from '@/lib/recruitmentState'
import { useMyReviews } from '@/lib/reviews'
import { useAppliedCampaigns } from '@/lib/applicationState'
import ApplicationList from '@/components/mypage/ApplicationList'
import { formatRelativeTime } from '@/lib/date'
import RecruitmentListRow from '@/components/board/RecruitmentListRow'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import StarRating from '@/components/ui/StarRating'
import { RecruitmentRowListSkeleton } from '@/components/ui/Skeleton'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

const TABS = [
  { value: 'applications', label: '신청한 공고', icon: ClipboardCheck },
  { value: 'recent', label: '최근에 본 공고', icon: Clock },
  { value: 'favorites', label: '즐겨찾기', icon: Star },
  { value: 'reviews', label: '내 후기', icon: MessageSquareQuote },
] as const
type TabValue = (typeof TABS)[number]['value']

const submissionStatusStyles: Record<ReviewSubmissionStatus, string> = {
  submitted: 'bg-stone-100 text-stone-600',
  approved: 'bg-orange-50 text-orange-700',
  rejected: 'bg-red-50 text-red-600',
}

export default function MyRecruitmentsPage() {
  useDocumentTitle('공고 관리')
  const { user } = useAuth()
  const userId = user?.id ?? null

  const { favoritesVersion } = useFavorites()

  // ID만 들고 공고를 찾는 대신 서버 목록 엔드포인트를 그대로 쓴다.
  const recent = useRecruitmentsByLoader(
    () => (userId ? listRecentCampaigns() : Promise.resolve([])),
    [userId],
  )
  // favoritesVersion을 deps에 넣어 별표를 누른 즉시 목록을 다시 받는다.
  // 탭 전환은 리마운트가 아니라서, 이게 없으면 마운트 때 받은 목록이 그대로 남는다.
  const favorites = useRecruitmentsByLoader(
    () => (userId ? listBookmarkedCampaigns() : Promise.resolve([])),
    [userId, favoritesVersion],
  )
  const myReviews = useMyReviews()
  const { appliedIds } = useAppliedCampaigns()

  // 신청 → 발표 → 후기 순서라 신청한 공고를 첫 탭으로 둔다.
  const [activeTab, setActiveTab] = useState<TabValue>('applications')

  const totalCounts: Record<TabValue, number> = {
    applications: appliedIds.length,
    recent: recent.recruitments.length,
    favorites: favorites.recruitments.length,
    reviews: myReviews.reviews.length,
  }

  // 최근 본 공고는 최대 50건, 즐겨찾기도 개인의 유한한 목록이라 검색·정렬·페이징을 두지 않는다.
  // 네 탭 중 두 곳에서만 툴바가 나타났다 사라져 탭을 옮길 때마다 화면 구성이 바뀌던 것이
  // 이 화면이 어수선하던 가장 큰 이유였다.
  const active =
    activeTab === 'recent' ? recent : activeTab === 'favorites' ? favorites : null

  return (
    <div>
      <div
        role="tablist"
        aria-label="공고 관리 탭"
        className="-mx-4 flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-stone-200 px-4 sm:mx-0 sm:px-0"
      >
        {TABS.map(({ value, label, icon: Icon }) => {
          const isActive = activeTab === value
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(value)}
              className={cn(
                'relative flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm font-semibold transition-colors sm:px-4',
                isActive ? 'text-orange-600' : 'text-stone-500 hover:text-stone-800',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              <span
                className={cn(
                  'ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold',
                  isActive
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-stone-100 text-stone-500',
                )}
              >
                {totalCounts[value]}
              </span>
              {isActive && (
                <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-orange-500" />
              )}
            </button>
          )
        })}
      </div>

      {activeTab === 'applications' ? (
        <ApplicationList />
      ) : activeTab === 'reviews' ? (
        <MyReviewsTab
          reviews={myReviews.reviews}
          status={myReviews.status}
          onRetry={myReviews.reload}
        />
      ) : active?.status === 'loading' ? (
        <div className="mt-5">
          <RecruitmentRowListSkeleton count={4} />
        </div>
      ) : (active?.recruitments.length ?? 0) === 0 ? (
        <div className="mt-5">
          <EmptyForTab tab={activeTab} />
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {active?.recruitments.map((r) => (
            <RecruitmentListRow key={r.id} recruitment={r} />
          ))}
        </div>
      )}
    </div>
  )
}

function MyReviewsTab({
  reviews,
  status,
  onRetry,
}: {
  reviews: Review[]
  status: 'loading' | 'success' | 'error'
  onRetry: () => void
}) {
  if (status === 'loading') {
    return (
      <div className="mt-5">
        <RecruitmentRowListSkeleton count={3} />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mt-5">
        <ErrorState title="후기를 불러오지 못했습니다." onRetry={onRetry} />
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="mt-5">
        <EmptyState
          title="아직 남긴 후기가 없어요."
          description={
            <Link
              to="/board"
              className="text-orange-600 no-underline hover:text-orange-700"
            >
              참여한 모집에 후기를 남겨보세요
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <ul className="mt-5 flex flex-col gap-3">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="rounded-xl border border-stone-200 bg-white p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <StarRating value={review.rating} />
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-semibold',
                submissionStatusStyles[review.submissionStatus],
              )}
            >
              {REVIEW_SUBMISSION_STATUS_LABELS[review.submissionStatus]}
            </span>
            <span className="ml-auto text-xs text-stone-400">
              {formatRelativeTime(review.createdAt)}
            </span>
          </div>

          {review.recruitmentTitle && (
            <Link
              to={`/recruitments/${review.recruitmentId}`}
              className="mt-2 block truncate text-sm font-bold text-stone-800 no-underline hover:text-orange-600"
            >
              {review.recruitmentTitle.replace(/\n/g, ' ')}
            </Link>
          )}

          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-stone-600">
            {review.content}
          </p>

          {review.rejectReason && (
            <p className="mt-2 text-xs text-red-500">
              반려 사유: {review.rejectReason}
              <span className="ml-1 text-stone-400">
                — 공고에서는 숨겨집니다. 내용을 고치면 다시 노출돼요.
              </span>
            </p>
          )}

          {review.url && (
            <a
              href={review.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-stone-500 no-underline hover:text-orange-600"
            >
              {review.channel ? REVIEW_CHANNEL_LABELS[review.channel] : '원문'}에서 보기
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </li>
      ))}
    </ul>
  )
}

function EmptyForTab({ tab }: { tab: TabValue }) {
  const title =
    tab === 'recent' ? '아직 본 공고가 없어요.' : '아직 즐겨찾기한 공고가 없어요.'
  return (
    <EmptyState
      title={title}
      description={
        <Link
          to="/board"
          className="text-orange-600 no-underline hover:text-orange-700"
        >
          전체 모집 목록 둘러보기
        </Link>
      }
    />
  )
}
