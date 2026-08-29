import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Pin } from 'lucide-react'
import { getNotice } from '@/lib/api/notices'
import type { Notice } from '@/types/notice'
import { formatFullDate } from '@/lib/date'
import NoticeCategoryBadge from '@/components/notice/NoticeCategoryBadge'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import ButtonLink from '@/components/ui/ButtonLink'
import PageContainer from '@/components/layout/PageContainer'
import PageHeader from '@/components/layout/PageHeader'
import { useNoticeReadState } from '@/lib/noticeReadState'
import { useAsyncData } from '@/lib/useAsyncData'
import { isNotFound } from '@/lib/api/errors'
import { usePageMeta } from '@/lib/useDocumentTitle'

export default function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { markAsRead } = useNoticeReadState()

  const { data: notice, status, error, reload } = useAsyncData<Notice | null>(
    () => (id ? getNotice(id) : Promise.resolve(null)),
    null,
    [id],
  )

  usePageMeta({
    title: notice ? notice.title : '공지사항',
    description: notice?.content.slice(0, 120),
    type: 'article',
  })

  // 로그인 상태에서 공지를 열면 읽음으로 표시한다.
  useEffect(() => {
    if (notice) markAsRead(notice.id)
  }, [notice, markAsRead])

  if (status === 'loading') return <DetailSkeleton />

  if (status === 'error') {
    return isNotFound(error) ? (
      <NotFound />
    ) : (
      <PageContainer width="narrow" className="py-16 sm:py-20">
        <ErrorState title="공지를 불러오지 못했습니다." onRetry={reload} />
      </PageContainer>
    )
  }

  if (!notice) return <NotFound />

  return (
    <PageContainer width="narrow">
      <PageHeader
        backTo="/notice"
        backLabel="공지사항 목록"
        title={notice.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <NoticeCategoryBadge category={notice.category} />
            {notice.isPinned && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500">
                <Pin className="h-3 w-3" />
                중요
              </span>
            )}
            <span className="text-xs text-stone-400">
              {formatFullDate(notice.createdAt)}
            </span>
          </span>
        }
      />

      <div className="whitespace-pre-line border-t border-stone-200 pt-6 text-sm leading-relaxed text-stone-600">
        {notice.content}
      </div>

      <div className="mt-10 border-t border-stone-100 pt-5">
        <ButtonLink to="/notice" variant="secondary" size="sm">
          목록으로 돌아가기
        </ButtonLink>
      </div>
    </PageContainer>
  )
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-6 h-5 w-20 rounded-full" />
      <Skeleton className="mt-3 h-8 w-3/4" />
      <Skeleton className="mt-8 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
    </div>
  )
}

function NotFound() {
  return (
    <PageContainer width="narrow" className="py-16 text-center sm:py-24">
      <h1 className="text-xl font-bold text-stone-800 sm:text-2xl">
        존재하지 않는 공지입니다
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        삭제되었거나 잘못된 링크로 접근했을 수 있어요.
      </p>
      <ButtonLink to="/notice" size="lg" className="mt-6">
        공지사항 목록으로
      </ButtonLink>
    </PageContainer>
  )
}
