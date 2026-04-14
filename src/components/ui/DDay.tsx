interface DDayProps {
  daysRemaining: number
}

export default function DDay({ daysRemaining }: DDayProps) {
  if (daysRemaining <= 0) {
    return <span className="text-sm font-bold text-stone-400">마감</span>
  }

  return (
    <span className="text-sm font-bold text-orange-500">
      D-{daysRemaining}
    </span>
  )
}
