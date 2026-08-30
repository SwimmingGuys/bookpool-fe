import type { Recruitment } from '@/types/recruitment'
import RecruitmentCard from '@/components/ui/RecruitmentCard'
import Section from '@/components/ui/Section'
import StaggerChildren from '@/components/ui/StaggerChildren'
import EmptyState from '@/components/ui/EmptyState'
import { RecruitmentCardSkeleton } from '@/components/ui/Skeleton'

interface FeaturedSectionProps {
  title: string
  subtitle: string
  recruitments: Recruitment[]
  loading?: boolean
}

export default function FeaturedSection({
  title,
  subtitle,
  recruitments,
  loading,
}: FeaturedSectionProps) {
  return (
    <Section
      title={title}
      subtitle={subtitle}
      background="bg-white"
      blobs={[
        { className: '-top-10 -left-10 w-72 h-72 bg-stone-200/15' },
        { className: 'bottom-0 right-0 w-96 h-96 bg-orange-100/10' },
      ]}
    >
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <RecruitmentCardSkeleton key={i} />
          ))}
        </div>
      ) : recruitments.length === 0 ? (
        <EmptyState
          title="진행 중인 모집이 없어요."
          description="새로운 모집이 올라오면 여기에 표시됩니다."
        />
      ) : (
        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recruitments.map((recruitment) => (
            <RecruitmentCard key={recruitment.id} recruitment={recruitment} />
          ))}
        </StaggerChildren>
      )}
    </Section>
  )
}
