import HeroBanner from '@/components/home/HeroBanner'
import HowItWorks from '@/components/home/HowItWorks'
import CategorySection from '@/components/home/CategorySection'
import FeaturedSection from '@/components/home/FeaturedSection'
import { useFeaturedRecruitments } from '@/lib/recruitmentsSource'
import { usePageMeta } from '@/lib/useDocumentTitle'

export default function HomePage() {
  usePageMeta({})
  // 마감 임박 순서는 서버가 정렬해 내려준다.
  const { recruitments, status } = useFeaturedRecruitments(8)

  return (
    <>
      <HeroBanner />
      <HowItWorks />
      <CategorySection />
      <FeaturedSection
        title="지금 주목해야 할 모집"
        subtitle="마감이 얼마 남지 않은 도서들을 확인해 보세요."
        recruitments={recruitments}
        loading={status === 'loading'}
      />
    </>
  )
}
