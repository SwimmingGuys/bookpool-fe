import type { Recruitment } from '@/types/recruitment'
import RecruitmentCard from '@/components/ui/RecruitmentCard'
import Section from '@/components/ui/Section'
import StaggerChildren from '@/components/ui/StaggerChildren'

interface FeaturedSectionProps {
  title: string
  subtitle: string
  recruitments: Recruitment[]
}

export default function FeaturedSection({ title, subtitle, recruitments }: FeaturedSectionProps) {
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
      <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {recruitments.map((recruitment) => (
          <RecruitmentCard key={recruitment.id} recruitment={recruitment} />
        ))}
      </StaggerChildren>
    </Section>
  )
}
