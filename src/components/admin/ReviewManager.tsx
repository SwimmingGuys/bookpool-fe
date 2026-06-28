import { useState } from 'react'
import { Eye, EyeOff, Pencil, Star, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import Button from '@/components/ui/Button'
import { showToast } from '@/lib/toast'
import {
  useReviewsByRecruitment,
  createReview,
  updateReview,
  deleteReview,
  toggleReviewStatus,
} from '@/lib/adminReviews'
import type { Review } from '@/types/review'

const inputClass =
  'w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 outline-none transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-100'

const RATINGS = [5, 4, 3, 2, 1]

interface ReviewManagerProps {
  recruitmentId: string
}

interface ReviewDraft {
  author: string
  rating: number
  content: string
}

const EMPTY_DRAFT: ReviewDraft = { author: '', rating: 5, content: '' }

export default function ReviewManager({ recruitmentId }: ReviewManagerProps) {
  const reviews = useReviewsByRecruitment(recruitmentId)
  const [draft, setDraft] = useState<ReviewDraft>(EMPTY_DRAFT)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<ReviewDraft>(EMPTY_DRAFT)

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.author.trim() || !draft.content.trim()) {
      showToast('작성자와 내용을 입력해주세요.', 'warning')
      return
    }
    createReview({ recruitmentId, ...draft })
    setDraft(EMPTY_DRAFT)
    showToast('리뷰를 추가했습니다.', 'success')
  }

  const startEdit = (review: Review) => {
    setEditingId(review.id)
    setEditDraft({
      author: review.author,
      rating: review.rating,
      content: review.content,
    })
  }

  const handleSaveEdit = (id: string, status: Review['status']) => {
    if (!editDraft.author.trim() || !editDraft.content.trim()) {
      showToast('작성자와 내용을 입력해주세요.', 'warning')
      return
    }
    updateReview(id, { ...editDraft, status })
    setEditingId(null)
    showToast('리뷰를 수정했습니다.', 'success')
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('이 리뷰를 삭제할까요?')) return
    deleteReview(id)
    showToast('리뷰를 삭제했습니다.', 'success')
  }

  return (
    <section className="mt-10 border-t border-stone-200 pt-8">
      <h2 className="text-lg font-bold text-stone-800">리뷰 관리</h2>
      <p className="mt-1 text-sm text-stone-500">
        이 모집글에 등록된 리뷰 {reviews.length}건
      </p>

      <form
        onSubmit={handleAdd}
        className="mt-4 flex flex-col gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            placeholder="작성자"
            value={draft.author}
            onChange={(e) => setDraft((p) => ({ ...p, author: e.target.value }))}
            className={cn(inputClass, 'sm:w-40')}
          />
          <select
            value={draft.rating}
            onChange={(e) =>
              setDraft((p) => ({ ...p, rating: Number(e.target.value) }))
            }
            className={cn(inputClass, 'sm:w-32')}
          >
            {RATINGS.map((n) => (
              <option key={n} value={n}>
                별점 {n}점
              </option>
            ))}
          </select>
        </div>
        <textarea
          rows={2}
          placeholder="리뷰 내용"
          value={draft.content}
          onChange={(e) => setDraft((p) => ({ ...p, content: e.target.value }))}
          className={cn(inputClass, 'resize-y')}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm">
            리뷰 추가
          </Button>
        </div>
      </form>

      <ul className="mt-4 flex flex-col gap-3">
        {reviews.map((review) => {
          const isEditing = editingId === review.id
          return (
            <li
              key={review.id}
              className="rounded-xl border border-stone-200 bg-white p-4"
            >
              {isEditing ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      value={editDraft.author}
                      onChange={(e) =>
                        setEditDraft((p) => ({ ...p, author: e.target.value }))
                      }
                      className={cn(inputClass, 'sm:w-40')}
                    />
                    <select
                      value={editDraft.rating}
                      onChange={(e) =>
                        setEditDraft((p) => ({
                          ...p,
                          rating: Number(e.target.value),
                        }))
                      }
                      className={cn(inputClass, 'sm:w-32')}
                    >
                      {RATINGS.map((n) => (
                        <option key={n} value={n}>
                          별점 {n}점
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    rows={2}
                    value={editDraft.content}
                    onChange={(e) =>
                      setEditDraft((p) => ({ ...p, content: e.target.value }))
                    }
                    className={cn(inputClass, 'resize-y')}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      취소
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleSaveEdit(review.id, review.status)}
                    >
                      저장
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-stone-800">
                        {review.author}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        {review.rating}
                      </span>
                      {review.status === 'hidden' && (
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500">
                          숨김
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-sm text-stone-600">
                      {review.content}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleReviewStatus(review.id)}
                      aria-label={review.status === 'visible' ? '숨기기' : '노출하기'}
                      className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                    >
                      {review.status === 'visible' ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(review)}
                      aria-label="수정"
                      className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(review.id)}
                      aria-label="삭제"
                      className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
