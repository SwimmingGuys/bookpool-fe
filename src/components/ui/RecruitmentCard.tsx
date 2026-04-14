import { Eye } from 'lucide-react'
import type { Recruitment } from '@/types/recruitment'
import Badge from './Badge'
import DDay from './DDay'

interface RecruitmentCardProps {
  recruitment: Recruitment
}

export default function RecruitmentCard({ recruitment }: RecruitmentCardProps) {
  const { badgeLabel, daysRemaining, title, publisher, category, viewCount } = recruitment

  return (
    <div className="group flex flex-col rounded-xl bg-white p-5 shadow-sm border border-stone-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
      <div className="flex items-center justify-between mb-4">
        <Badge label={badgeLabel} />
        <DDay daysRemaining={daysRemaining} />
      </div>

      <h3 className="text-base font-bold text-stone-800 leading-snug mb-3 whitespace-pre-line group-hover:text-orange-600 transition-colors duration-300 line-clamp-2 min-h-[2.75rem]">
        {title}
      </h3>

      <p className="text-sm text-stone-500 mb-2">
        {publisher} · {category}
      </p>

      <div className="mt-auto flex items-center gap-1 text-sm text-stone-400">
        <Eye className="w-3.5 h-3.5" />
        <span>{viewCount.toLocaleString()}</span>
      </div>
    </div>
  )
}
