import { useState } from 'react'
import { Code, Briefcase, Palette, Heart, Globe, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/cn'
import Section from '@/components/ui/Section'
import StaggerChildren from '@/components/ui/StaggerChildren'

const categories = [
  { icon: Code, label: 'IT/개발', count: 24, color: 'from-sky-400 to-blue-500' },
  { icon: Briefcase, label: '경영/경제', count: 18, color: 'from-emerald-400 to-green-500' },
  { icon: Palette, label: '예술/디자인', count: 12, color: 'from-pink-400 to-rose-500' },
  { icon: Heart, label: '자기계발', count: 31, color: 'from-orange-400 to-amber-500' },
  { icon: Globe, label: '인문/사회', count: 15, color: 'from-violet-400 to-purple-500' },
  { icon: GraduationCap, label: '학습/교육', count: 9, color: 'from-teal-400 to-cyan-500' },
]

export default function CategorySection() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <Section
      title="관심 분야를 탐색해 보세요"
      subtitle="카테고리별로 진행 중인 서평단 모집을 확인할 수 있어요."
      background="bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100"
      blobs={[
        { className: 'top-0 right-0 w-96 h-96 bg-violet-100/20' },
        { className: 'bottom-0 left-0 w-72 h-72 bg-sky-100/20' },
      ]}
    >
      <StaggerChildren
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto"
      >
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setSelected(selected === cat.label ? null : cat.label)}
            className={cn(
              'flex flex-col items-center gap-3 rounded-2xl border p-6 transition-all duration-300 cursor-pointer',
              'hover:-translate-y-1 hover:shadow-lg',
              selected === cat.label
                ? 'border-orange-400 bg-white shadow-md scale-105'
                : 'border-gray-200/60 bg-white/80 backdrop-blur-sm',
            )}
          >
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-sm transition-transform duration-300',
                cat.color,
                selected === cat.label && 'scale-110',
              )}
            >
              <cat.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-800">{cat.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{cat.count}건 모집중</p>
            </div>
          </button>
        ))}
      </StaggerChildren>
    </Section>
  )
}
