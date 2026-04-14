import { BookOpen, Mail, Bookmark } from 'lucide-react'
import Section from '@/components/ui/Section'
import StaggerChildren from '@/components/ui/StaggerChildren'

const features = [
  {
    icon: BookOpen,
    title: '도서 공고 탐색',
    description: '인기순, 최신순으로 서평단 모집 공고를 한눈에 확인하세요.',
    gradient: 'from-orange-500 to-orange-600',
    bgCard: 'bg-orange-50/40',
  },
  {
    icon: Mail,
    title: '메일로 소식 받기',
    description: '관심 있는 도서 소식을 이메일로 빠르게 받아보세요.',
    gradient: 'from-stone-500 to-stone-600',
    bgCard: 'bg-stone-50',
  },
  {
    icon: Bookmark,
    title: '즐겨찾기',
    description: '관심 있는 공고를 즐겨찾기하고 마이페이지에서 모아보세요.',
    gradient: 'from-orange-600 to-stone-600',
    bgCard: 'bg-stone-50/80',
  },
]

export default function HowItWorks() {
  return (
    <Section
      title="이런 것들을 할 수 있어요"
      subtitle="BookPool에서 제공하는 핵심 기능을 소개합니다."
      background="bg-white"
      blobs={[
        { className: 'top-10 left-10 w-64 h-64 bg-stone-200/20' },
        { className: 'bottom-10 right-10 w-80 h-80 bg-orange-100/15' },
      ]}
    >
      <StaggerChildren
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        staggerMs={150}
      >
        {features.map((feature) => (
          <div
            key={feature.title}
            className={`group flex flex-col items-center text-center rounded-2xl ${feature.bgCard} p-8 hover:shadow-lg hover:-translate-y-2 transition-all duration-300 border border-stone-100`}
          >
            <div
              className={`mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
            >
              <feature.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">{feature.title}</h3>
            <p className="text-sm text-stone-500 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </StaggerChildren>
    </Section>
  )
}
