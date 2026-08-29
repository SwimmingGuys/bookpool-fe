import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import RecruitmentForm from '@/components/admin/RecruitmentForm'
import ReviewManager from '@/components/admin/ReviewManager'
import Skeleton from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import {
  createRecruitment,
  updateRecruitment,
  useAdminRecruitment,
  changeRecruitmentStatus,
  type RecruitmentInput,
} from '@/lib/adminRecruitments'
import { showToast } from '@/lib/toast'
import { AuthError } from '@/lib/api/errors'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export default function AdminRecruitmentFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { recruitment, status } = useAdminRecruitment(id)
  const [submitting, setSubmitting] = useState(false)

  useDocumentTitle(isEdit ? '서평단 수정' : '새 서평단 등록')

  const handleSubmit = async (input: RecruitmentInput) => {
    setSubmitting(true)
    try {
      if (isEdit && id) {
        await updateRecruitment(id, input, recruitment?.status)
        showToast('모집글을 수정했습니다.', 'success')
      } else {
        await createRecruitment(input)
        showToast(
          input.publishStatus === 'draft'
            ? '검수 대기로 저장했습니다.'
            : '모집글을 등록했습니다.',
          'success',
        )
      }
      navigate('/admin/recruitments')
    } catch (err) {
      showToast(
        err instanceof AuthError ? err.message : '모집글 저장에 실패했습니다.',
        'error',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!id || !recruitment) return
    const next = recruitment.status === 'open' ? 'closed' : 'open'
    try {
      await changeRecruitmentStatus(id, next)
      showToast(
        next === 'closed' ? '모집을 마감했습니다.' : '모집을 다시 열었습니다.',
        'success',
      )
      navigate('/admin/recruitments')
    } catch (err) {
      showToast(
        err instanceof AuthError ? err.message : '상태 변경에 실패했습니다.',
        'error',
      )
    }
  }

  if (isEdit && status === 'loading') {
    return (
      <div>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-6 h-7 w-32" />
        <Skeleton className="mt-6 h-96 w-full rounded-2xl" />
      </div>
    )
  }

  if (isEdit && !recruitment) {
    return (
      <div className="text-center">
        <h1 className="text-xl font-bold text-stone-800">
          존재하지 않는 모집글입니다.
        </h1>
        <Link
          to="/admin/recruitments"
          className="mt-4 inline-block text-sm font-semibold text-orange-600 no-underline hover:text-orange-700"
        >
          목록으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/admin/recruitments"
        className="mb-6 inline-flex items-center gap-1 text-sm text-stone-500 no-underline hover:text-stone-700"
      >
        <ArrowLeft className="h-4 w-4" />
        서평단 관리로 돌아가기
      </Link>

      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-stone-800">
          {isEdit ? '서평단 수정' : '새 서평단 등록'}
        </h1>
        {isEdit && recruitment && (
          <Button variant="secondary" size="sm" onClick={handleToggleStatus}>
            {recruitment.status === 'open' ? '모집 마감하기' : '모집 다시 열기'}
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <RecruitmentForm
          initial={recruitment ?? undefined}
          submitLabel={isEdit ? '수정 저장' : '등록하고 게시'}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/recruitments')}
        />

        {isEdit && recruitment && <ReviewManager recruitmentId={recruitment.id} />}
      </div>
    </div>
  )
}
