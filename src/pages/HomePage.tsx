import { useMemo } from 'react'
import HeroBanner from '@/components/home/HeroBanner'
import HowItWorks from '@/components/home/HowItWorks'
import CategorySection from '@/components/home/CategorySection'
import FeaturedSection from '@/components/home/FeaturedSection'
import { useAllRecruitments } from '@/lib/recruitmentsSource'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export default function HomePage() {
  useDocumentTitle()
  const allRecruitments = useAllRecruitments()
  const featured = useMemo(
    () =>
      allRecruitments
        .filter((r) => r.status === 'open' && r.daysRemaining >= 0)
        .sort((a, b) => a.daysRemaining - b.daysRemaining)
        .slice(0, 8),
    [allRecruitments],
  )
  return (
    <>
      <HeroBanner />
      <HowItWorks />
      <CategorySection />
      <FeaturedSection
        title="지금 주목해야 할 모집"
        subtitle="마감이 얼마 남지 않은 도서들을 확인해 보세요."
        recruitments={featured}
      />
    </>
  )
}
