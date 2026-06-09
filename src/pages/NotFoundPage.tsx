import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('페이지를 찾을 수 없음')
  return (
    <div className="px-6 py-20 max-w-2xl mx-auto text-center">
      <p className="text-sm font-semibold text-orange-500">404</p>
      <h1 className="mt-2 text-2xl font-bold text-stone-800">
        페이지를 찾을 수 없어요
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        주소가 잘못되었거나 삭제된 페이지일 수 있어요.
      </p>
      <Link
        to="/"
        className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors no-underline"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}
