import { Link, useNavigate } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import {
  useAdminRecruitments,
  deleteRecruitment,
} from '@/lib/adminRecruitments'
import { RECRUITMENT_TYPE_LABELS } from '@/types/recruitment'
import { formatFullDate } from '@/lib/date'
import { showToast } from '@/lib/toast'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export default function AdminRecruitmentsPage() {
  useDocumentTitle('서평단 관리')
  const recruitments = useAdminRecruitments()
  const navigate = useNavigate()

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`'${title}' 모집글을 삭제할까요?`)) return
    try {
      await deleteRecruitment(id)
      showToast('모집글을 삭제했습니다.', 'success')
    } catch {
      showToast('모집글 삭제에 실패했습니다.', 'error')
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">서평단 관리</h1>
          <p className="mt-1 text-sm text-stone-500">
            등록된 서평단 모집글 {recruitments.length}건
          </p>
        </div>
        <Button onClick={() => navigate('/admin/recruitments/new')}>
          <Plus className="h-4 w-4" />새 서평단 등록
        </Button>
      </div>

      {recruitments.length === 0 ? (
        <EmptyState
          title="등록된 모집글이 없습니다."
          description="새 서평단 모집글을 등록해 보세요."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {recruitments.map((r) => (
            <li
              key={r.id}
              className="flex items-start gap-4 rounded-xl border border-stone-200 bg-white p-4"
            >
              {r.coverImage ? (
                <img
                  src={r.coverImage}
                  alt=""
                  className="h-20 w-15 shrink-0 rounded-md border border-stone-100 object-cover"
                />
              ) : null}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
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
                </div>
                <Link
                  to={`/admin/recruitments/${r.id}`}
                  className="mt-1.5 block truncate text-sm font-bold text-stone-800 no-underline hover:text-orange-600"
                >
                  {r.title.replace(/\n/g, ' ')}
                </Link>
                <p className="mt-1 truncate text-xs text-stone-500">
                  {r.publisher} · {r.category}
                </p>
                <p className="mt-1 text-xs text-stone-400">
                  모집 {formatFullDate(r.recruitStartDate)} ~{' '}
                  {formatFullDate(r.recruitEndDate)} · 발표{' '}
                  {formatFullDate(r.announcementDate)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Link
                  to={`/admin/recruitments/${r.id}`}
                  aria-label="수정"
                  className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(r.id, r.title.replace(/\n/g, ' '))}
                  aria-label="삭제"
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
