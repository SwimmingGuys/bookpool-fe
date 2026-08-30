import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Code,
  Briefcase,
  Palette,
  Heart,
  Globe,
  BookOpen,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import Section from '@/components/ui/Section'
import StaggerChildren from '@/components/ui/StaggerChildren'
import { listCategoryCounts } from '@/lib/api/campaigns'
import { CATEGORY_LABELS, type Category } from '@/types/recruitment'
import { useAsyncData } from '@/lib/useAsyncData'

// 값은 백엔드 CampaignCategory와 1:1이다. 홈에는 그중 대표 6종만 타일로 보여준다.
const categories: { icon: LucideIcon; value: Category; color: string }[] = [
  { icon: Code, value: 'IT', color: 'from-stone-600 to-stone-700' },
  { icon: BookOpen, value: 'NOVEL', color: 'from-orange-500 to-orange-600' },
  { icon: Briefcase, value: 'ECONOMY', color: 'from-stone-500 to-stone-600' },
  { icon: Heart, value: 'SELF_DEVELOPMENT', color: 'from-stone-600 to-stone-700' },
  { icon: Globe, value: 'HUMANITY', color: 'from-stone-500 to-stone-600' },
  { icon: Palette, value: 'ART_DESIGN', color: 'from-orange-500 to-orange-600' },
]

export default function CategorySection() {
  const [selected, setSelected] = useState<Category | null>(null)
  const navigate = useNavigate()
  // 카테고리별 건수. 실패하면 건수만 감추고 타일 자체는 그대로 동작한다.
  const counts = useAsyncData<Record<string, number>>(
    listCategoryCounts,
    {},
    [],
  )

  // 검색어가 아니라 카테고리 필터로 보드를 연다. 예전엔 라벨을 q에 실어 보내
  // '경제'가 제목에 든 다른 분야 공고까지 딸려왔다.
  const handleClick = (value: Category) => {
    setSelected(selected === value ? null : value)
    navigate(`/board?category=${encodeURIComponent(value)}`)
  }

  return (
    <Section
      title="관심 분야를 탐색해 보세요"
      subtitle="카테고리별로 진행 중인 서평단 모집을 확인할 수 있어요."
      background="bg-stone-50/80"
      blobs={[
        { className: 'top-0 right-0 w-96 h-96 bg-stone-200/15' },
        { className: 'bottom-0 left-0 w-72 h-72 bg-orange-100/10' },
      ]}
    >
      <StaggerChildren
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto"
      >
        {categories.map((cat) => {
          const count = counts.data[cat.value] ?? 0
          const label = CATEGORY_LABELS[cat.value]
          return (
            <button
              key={cat.value}
              type="button"
              aria-pressed={selected === cat.value}
              onClick={() => handleClick(cat.value)}
              className={cn(
                'flex flex-col items-center gap-3 rounded-2xl border p-6 transition-all duration-300 cursor-pointer',
                'hover:-translate-y-1 hover:shadow-lg',
                selected === cat.value
                  ? 'border-orange-400 bg-white shadow-md scale-105'
                  : 'border-stone-200/60 bg-white/80 backdrop-blur-sm',
              )}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-sm transition-transform duration-300',
                  cat.color,
                  selected === cat.value && 'scale-110',
                )}
              >
                <cat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-stone-700">{label}</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {counts.status === 'success' ? `${count}건` : '\u00a0'}
                </p>
              </div>
            </button>
          )
        })}
      </StaggerChildren>
    </Section>
  )
}
