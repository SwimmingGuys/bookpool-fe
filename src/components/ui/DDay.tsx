interface DDayProps {
  daysRemaining: number
}

export default function DDay({ daysRemaining }: DDayProps) {
  if (daysRemaining <= 0) {
    return <span className="text-sm font-bold text-gray-400">마감</span>
  }

  return (
    <span className="text-sm font-bold text-orange-500">
      D-{daysRemaining}
    </span>
  )
}
