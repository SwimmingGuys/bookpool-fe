import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pin } from 'lucide-react'
import { getNoticeById } from '@/data/mockNotices'
import NoticeCategoryBadge from '@/components/notice/NoticeCategoryBadge'

export default function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const notice = id ? getNoticeById(id) : undefined

  if (!notice) {
    return <NotFound />
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link
        to="/notice"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        공지사항 목록
      </Link>

      <header className="pb-5 mb-5 border-b border-stone-200">
        <div className="flex items-center gap-2 mb-3">
          <NoticeCategoryBadge category={notice.category} />
          {notice.isPinned && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500">
              <Pin className="w-3 h-3" />
              중요
            </span>
          )}
          <span className="ml-auto text-xs text-stone-400 tabular-nums">
            {notice.createdAt}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-stone-800 leading-snug">
          {notice.title}
        </h1>
      </header>

      <div className="text-sm leading-relaxed text-stone-600 whitespace-pre-line">
        {notice.content}
      </div>

      <div className="mt-10 pt-5 border-t border-stone-100">
        <Link
          to="/notice"
          className="inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-orange-600"
        >
          <ArrowLeft className="w-4 h-4" />
          목록으로 돌아가기
        </Link>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="px-6 py-20 max-w-2xl mx-auto text-center">
      <h1 className="text-2xl font-bold text-stone-800">존재하지 않는 공지입니다</h1>
      <p className="mt-2 text-sm text-stone-500">
        삭제되었거나 잘못된 링크로 접근했을 수 있어요.
      </p>
      <Link
        to="/notice"
        className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors no-underline"
      >
        공지사항 목록으로
      </Link>
    </div>
  )
}
