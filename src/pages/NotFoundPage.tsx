import ButtonLink from '@/components/ui/ButtonLink'
import PageContainer from '@/components/layout/PageContainer'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('페이지를 찾을 수 없음')
  return (
    <PageContainer width="narrow" className="py-16 text-center sm:py-24">
      <p className="text-sm font-semibold text-orange-500">404</p>
      <h1 className="mt-2 text-xl font-bold text-stone-800 sm:text-2xl">
        페이지를 찾을 수 없어요
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        주소가 잘못되었거나 삭제된 페이지일 수 있어요.
      </p>
      <ButtonLink to="/" size="lg" className="mt-6">
        홈으로 돌아가기
      </ButtonLink>
    </PageContainer>
  )
}
