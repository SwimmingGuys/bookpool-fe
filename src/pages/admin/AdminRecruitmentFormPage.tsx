import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import RecruitmentForm from '@/components/admin/RecruitmentForm'
import ReviewManager from '@/components/admin/ReviewManager'
import {
  useAdminRecruitments,
  createRecruitment,
  updateRecruitment,
  type RecruitmentInput,
} from '@/lib/adminRecruitments'
import { showToast } from '@/lib/toast'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export default function AdminRecruitmentFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const recruitments = useAdminRecruitments()
  const [submitting, setSubmitting] = useState(false)

  const recruitment = useMemo(
    () => (id ? recruitments.find((r) => r.id === id) : undefined),
    [recruitments, id],
  )

  useDocumentTitle(isEdit ? '서평단 수정' : '새 서평단 등록')

  const handleSubmit = async (input: RecruitmentInput) => {
    setSubmitting(true)
    try {
      if (isEdit && id) {
        await updateRecruitment(id, input)
        showToast('모집글을 수정했습니다.', 'success')
      } else {
        await createRecruitment(input)
        showToast('모집글을 등록했습니다.', 'success')
      }
      navigate('/admin/recruitments')
    } catch {
      showToast('모집글 저장에 실패했습니다.', 'error')
    } finally {
      setSubmitting(false)
    }
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

      <h1 className="mb-6 text-xl font-bold text-stone-800">
        {isEdit ? '서평단 수정' : '새 서평단 등록'}
      </h1>

      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <RecruitmentForm
          initial={recruitment}
          submitLabel={isEdit ? '수정 저장' : '등록'}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/recruitments')}
        />

        {isEdit && recruitment && <ReviewManager recruitmentId={recruitment.id} />}
      </div>
    </div>
  )
}
