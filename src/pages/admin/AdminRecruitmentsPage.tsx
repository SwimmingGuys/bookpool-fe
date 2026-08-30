import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import SearchInput from '@/components/ui/SearchInput'
import {
  useAdminRecruitments,
  useAdminRecruitmentActions,
} from '@/lib/adminRecruitments'
import {
  categoryLabel,
  PUBLISH_STATUS_LABELS,
  RECRUITMENT_SOURCE_LABELS,
  RECRUITMENT_TYPE_LABELS,
  type PublishStatus,
} from '@/types/recruitment'
import { formatFullDate } from '@/lib/date'
import { showToast } from '@/lib/toast'
import { AuthError } from '@/lib/api/errors'
import PageHeader from '@/components/layout/PageHeader'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

// 검수 큐(draft)와 게시된 공고(published)를 탭으로 나눈다.
// 크롤러가 붙으면 수집 결과가 그대로 '검수 대기'로 들어온다.
const TABS: { value: PublishStatus; label: string }[] = [
  { value: 'published', label: PUBLISH_STATUS_LABELS.published },
  { value: 'draft', label: PUBLISH_STATUS_LABELS.draft },
]

export default function AdminRecruitmentsPage() {
  useDocumentTitle('서평단 관리')
  const navigate = useNavigate()
  const [tab, setTab] = useState<PublishStatus>('published')
  const [query, setQuery] = useState('')

  const { recruitments, status, error, reload } = useAdminRecruitments({
    publishStatus: tab,
    query,
  })
  const { remove, publish } = useAdminRecruitmentActions(reload)

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`'${title}' 모집글을 삭제할까요?`)) return
    try {
      await remove(id)
      showToast('모집글을 삭제했습니다.', 'success')
    } catch (err) {
      showToast(
        err instanceof AuthError ? err.message : '모집글 삭제에 실패했습니다.',
        'error',
      )
    }
  }

  const handlePublish = async (id: string, next: PublishStatus) => {
    try {
      await publish(id, next)
      showToast(
        next === 'published' ? '공고를 게시했습니다.' : '공고를 검수 대기로 되돌렸습니다.',
        'success',
      )
    } catch (err) {
      showToast(
        err instanceof AuthError ? err.message : '상태 변경에 실패했습니다.',
        'error',
      )
    }
  }

  return (
    <div>
      <PageHeader
        title="서평단 관리"
        description={
          status === 'success'
            ? `${PUBLISH_STATUS_LABELS[tab]} ${recruitments.length}건`
            : '불러오는 중...'
        }
        actions={
          <Button onClick={() => navigate('/admin/recruitments/new')}>
            <Plus className="h-4 w-4" />새 서평단 등록
          </Button>
        }
        className="mb-6"
      />

      <div
        role="tablist"
        aria-label="게시 상태"
        className="-mx-4 mb-4 flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-stone-200 px-4 sm:mx-0 sm:px-0"
      >
        {TABS.map((item) => {
          const active = tab === item.value
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.value)}
              className={cn(
                'relative shrink-0 px-4 py-2.5 text-sm font-semibold transition-colors',
                active ? 'text-orange-600' : 'text-stone-500 hover:text-stone-800',
              )}
            >
              {item.label}
              {active && (
                <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-orange-500" />
              )}
            </button>
          )
        })}
      </div>

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="제목, 도서, 출판사 검색"
        className="mb-4 max-w-md"
      />

      {status === 'loading' ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : status === 'error' ? (
        <ErrorState
          title="목록을 불러오지 못했습니다."
          description={error?.message}
          onRetry={reload}
        />
      ) : recruitments.length === 0 ? (
        <EmptyState
          title={
            tab === 'draft'
              ? '검수 대기 중인 공고가 없습니다.'
              : '등록된 모집글이 없습니다.'
          }
          description={
            tab === 'draft'
              ? '수집된 공고가 들어오면 여기에서 검수합니다.'
              : '새 서평단 모집글을 등록해 보세요.'
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {recruitments.map((r) => {
            const plainTitle = r.title.replace(/\n/g, ' ')
            return (
              <li
                key={r.id}
                className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-start sm:gap-4"
              >
                {r.coverImage && (
                  <img
                    src={r.coverImage}
                    alt=""
                    className="h-24 w-16 shrink-0 rounded-md border border-stone-100 object-cover"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600">
                      {RECRUITMENT_TYPE_LABELS[r.badgeLabel]}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-semibold',
                        r.status === 'open'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-stone-100 text-stone-500',
                      )}
                    >
                      {r.status === 'open' ? '모집중' : '마감'}
                    </span>
                    {r.publishStatus === 'draft' && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        {PUBLISH_STATUS_LABELS.draft}
                      </span>
                    )}
                    {r.source !== 'manual' && (
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-500">
                        {RECRUITMENT_SOURCE_LABELS[r.source]}
                      </span>
                    )}
                    {!r.applyUrl && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                        신청 링크 없음
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/admin/recruitments/${r.id}`}
                    className="mt-1.5 block truncate text-sm font-bold text-stone-800 no-underline hover:text-orange-600"
                  >
                    {plainTitle}
                  </Link>
                  <p className="mt-1 truncate text-xs text-stone-500">
                    {r.publisher} · {categoryLabel(r.category)}
                  </p>
                  <p className="mt-1 text-xs text-stone-400">
                    모집 {formatFullDate(r.recruitStartDate)} ~{' '}
                    {formatFullDate(r.recruitEndDate)} · 발표{' '}
                    {formatFullDate(r.announcementDate)}
                  </p>

                  {r.sourceUrl && (
                    <a
                      href={r.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-stone-500 no-underline hover:text-orange-600"
                    >
                      원문 보기
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <div className="flex shrink-0 items-center justify-between gap-2 border-t border-stone-100 pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/admin/recruitments/${r.id}`}
                      aria-label="수정"
                      className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id, plainTitle)}
                      aria-label="삭제"
                      className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      handlePublish(
                        r.id,
                        r.publishStatus === 'draft' ? 'published' : 'draft',
                      )
                    }
                  >
                    {r.publishStatus === 'draft' ? '게시하기' : '검수로 내리기'}
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
