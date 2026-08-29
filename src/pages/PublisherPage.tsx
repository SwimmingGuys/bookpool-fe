import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Building2 } from 'lucide-react'
import { useRecruitmentList, type RecruitmentQuery } from '@/lib/recruitmentsSource'
import type { SortKey } from '@/lib/recruitmentFilter'
import RecruitmentListCard from '@/components/board/RecruitmentListCard'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Button from '@/components/ui/Button'
import { RecruitmentGridSkeleton } from '@/components/ui/Skeleton'
import SortDropdown from '@/components/board/SortDropdown'
import { usePageMeta } from '@/lib/useDocumentTitle'

/**
 * 출판사별 모집 모아보기. 출판사는 이미 필터·알림 구독의 축인데
 * "이 출판사의 다른 모집"으로 이어지는 화면이 없었다.
 */
export default function PublisherPage() {
  const { name } = useParams<{ name: string }>()
  const publisher = name ? decodeURIComponent(name) : ''
  const [sort, setSort] = useState<SortKey>('deadline')

  usePageMeta({
    title: publisher || '출판사',
    description: `${publisher}의 서평단·베타리더 모집 공고를 모아 봅니다.`,
  })

  const query: RecruitmentQuery = useMemo(
    () => ({ query: '', categories: [], types: [], publisher, sort }),
    [publisher, sort],
  )

  const list = useRecruitmentList(query)

  const openCount = useMemo(
    () => list.recruitments.filter((r) => r.status === 'open').length,
    [list.recruitments],
  )

  if (!publisher) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-stone-800">
          출판사를 찾을 수 없습니다
        </h1>
        <Link
          to="/board"
          className="mt-6 inline-block rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-orange-600"
        >
          보드로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Link
        to="/board"
        className="mb-6 inline-flex items-center gap-1 text-sm text-stone-500 no-underline hover:text-stone-700"
      >
        <ArrowLeft className="h-4 w-4" />
        보드로 돌아가기
      </Link>

      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400">
            <Building2 className="h-3.5 w-3.5" />
            출판사
          </span>
          <h1 className="mt-1.5 text-2xl font-bold text-stone-800">{publisher}</h1>
          {list.status === 'success' && (
            <p className="mt-2 text-sm text-stone-500">
              전체 {list.total}건
              {openCount > 0 && (
                <>
                  {' · '}
                  <span className="font-semibold text-orange-600">
                    모집중 {openCount}건
                  </span>
                </>
              )}
            </p>
          )}
        </div>

        <SortDropdown value={sort} onChange={setSort} />
      </header>

      {list.status === 'loading' ? (
        <RecruitmentGridSkeleton />
      ) : list.status === 'error' ? (
        <ErrorState
          title="공고를 불러오지 못했습니다."
          description={list.error?.message}
          onRetry={list.reload}
        />
      ) : list.recruitments.length === 0 ? (
        <EmptyState
          title={`${publisher}의 모집 공고가 없습니다.`}
          description="다른 출판사의 공고를 둘러보세요."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.recruitments.map((r) => (
              <RecruitmentListCard key={r.id} recruitment={r} />
            ))}
          </div>

          {list.hasNext && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="secondary"
                onClick={list.loadMore}
                disabled={list.isLoadingMore}
              >
                {list.isLoadingMore
                  ? '불러오는 중...'
                  : `공고 더 보기 (${list.recruitments.length}/${list.total})`}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
