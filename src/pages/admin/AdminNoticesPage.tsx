import { useState } from 'react'
import { Pencil, Pin, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import NoticeCategoryBadge from '@/components/notice/NoticeCategoryBadge'
import {
  createAdminNotice,
  deleteAdminNotice,
  listAdminNotices,
  updateAdminNotice,
  type NoticeInput,
} from '@/lib/api/notices'
import { getAdminToken } from '@/lib/adminAuth'
import { useAsyncData } from '@/lib/useAsyncData'
import { AuthError } from '@/lib/api/errors'
import { showToast } from '@/lib/toast'
import { formatFullDate } from '@/lib/date'
import {
  NOTICE_CATEGORY_OPTIONS,
  type Notice,
  type NoticeCategory,
} from '@/types/notice'
import PageHeader from '@/components/layout/PageHeader'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

const EMPTY: Notice[] = []

const inputClass =
  'w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 outline-none transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-100'

interface Draft extends NoticeInput {
  id: string | null
}

const EMPTY_DRAFT: Draft = {
  id: null,
  title: '',
  content: '',
  category: 'general',
  isPinned: false,
}

/**
 * 공지사항 작성·수정. 사용자 화면에는 공지 목록이 있는데 쓰는 화면이 없었다.
 */
export default function AdminNoticesPage() {
  useDocumentTitle('공지사항 관리')
  const { data, status, error, reload } = useAsyncData(
    () => listAdminNotices(getAdminToken()),
    EMPTY,
    [],
  )

  const [draft, setDraft] = useState<Draft | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft) return
    if (!draft.title.trim() || !draft.content.trim()) {
      showToast('제목과 내용을 입력해주세요.', 'warning')
      return
    }

    const payload: NoticeInput = {
      title: draft.title.trim(),
      content: draft.content.trim(),
      category: draft.category,
      isPinned: draft.isPinned,
    }

    setSubmitting(true)
    try {
      if (draft.id) {
        await updateAdminNotice(draft.id, payload, getAdminToken())
        showToast('공지를 수정했습니다.', 'success')
      } else {
        await createAdminNotice(payload, getAdminToken())
        showToast('공지를 등록했습니다.', 'success')
      }
      setDraft(null)
      reload()
    } catch (err) {
      showToast(
        err instanceof AuthError ? err.message : '공지 저장에 실패했습니다.',
        'error',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (notice: Notice) => {
    if (!window.confirm(`'${notice.title}' 공지를 삭제할까요?`)) return
    try {
      await deleteAdminNotice(notice.id, getAdminToken())
      showToast('공지를 삭제했습니다.', 'success')
      reload()
    } catch (err) {
      showToast(
        err instanceof AuthError ? err.message : '공지 삭제에 실패했습니다.',
        'error',
      )
    }
  }

  return (
    <div>
      <PageHeader
        title="공지사항 관리"
        description={
          status === 'success' ? `등록된 공지 ${data.length}건` : '불러오는 중...'
        }
        actions={
          <Button onClick={() => setDraft({ ...EMPTY_DRAFT })}>
            <Plus className="h-4 w-4" />새 공지 작성
          </Button>
        }
        className="mb-6"
      />

      {draft && (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mb-6 flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="notice-title" className="text-sm font-semibold text-stone-700">
              제목
            </label>
            <input
              id="notice-title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="공지 제목"
              disabled={submitting}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="notice-category"
                className="text-sm font-semibold text-stone-700"
              >
                카테고리
              </label>
              <select
                id="notice-category"
                value={draft.category}
                onChange={(e) =>
                  setDraft({ ...draft, category: e.target.value as NoticeCategory })
                }
                disabled={submitting}
                className={inputClass}
              >
                {NOTICE_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 self-end pb-2.5 text-sm font-medium text-stone-700">
              <input
                type="checkbox"
                checked={draft.isPinned}
                onChange={(e) => setDraft({ ...draft, isPinned: e.target.checked })}
                disabled={submitting}
                className="h-4 w-4 rounded border-stone-300 accent-orange-500"
              />
              목록 상단에 고정
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="notice-content"
              className="text-sm font-semibold text-stone-700"
            >
              내용
            </label>
            <textarea
              id="notice-content"
              rows={8}
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              placeholder="공지 내용을 입력하세요"
              disabled={submitting}
              className={cn(inputClass, 'resize-y')}
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
            <Button
              variant="secondary"
              onClick={() => setDraft(null)}
              disabled={submitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? '저장 중...' : draft.id ? '수정 저장' : '등록'}
            </Button>
          </div>
        </form>
      )}

      {status === 'loading' ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : status === 'error' ? (
        <ErrorState
          title="공지를 불러오지 못했습니다."
          description={error?.message}
          onRetry={reload}
        />
      ) : data.length === 0 ? (
        <EmptyState
          title="등록된 공지가 없습니다."
          description="새 공지를 작성해 보세요."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {data.map((notice) => (
            <li
              key={notice.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-stone-200 bg-white p-4"
            >
              <span className="flex w-4 shrink-0 justify-center">
                {notice.isPinned && <Pin className="h-3.5 w-3.5 text-stone-400" />}
              </span>
              <span className="flex w-20 shrink-0">
                <NoticeCategoryBadge category={notice.category} />
              </span>
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-stone-700">
                {notice.title}
              </p>
              <span className="shrink-0 text-xs text-stone-400">
                {formatFullDate(notice.createdAt)}
              </span>
              <div className="ml-auto flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label="수정"
                  onClick={() =>
                    setDraft({
                      id: notice.id,
                      title: notice.title,
                      content: notice.content,
                      category: notice.category,
                      isPinned: notice.isPinned,
                    })
                  }
                  className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="삭제"
                  onClick={() => handleDelete(notice)}
                  className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
