import HeroBanner from '@/components/home/HeroBanner'
import HowItWorks from '@/components/home/HowItWorks'
import CategorySection from '@/components/home/CategorySection'
import FeaturedSection from '@/components/home/FeaturedSection'
import { mockRecruitments } from '@/data/mockRecruitments'

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <HowItWorks />
      <CategorySection />
      <FeaturedSection
        title="지금 주목해야 할 모집"
        subtitle="마감이 얼마 남지 않은 도서들을 확인해 보세요."
        recruitments={mockRecruitments}
      />
    </>
  )
}
