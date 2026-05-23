interface DDayProps {
  daysRemaining: number
}

export default function DDay({ daysRemaining }: DDayProps) {
  if (daysRemaining <= 0) {
    return <span className="text-xs font-bold text-stone-400">마감</span>
  }

  const urgent = daysRemaining <= 3

  return (
    <span
      className={
        urgent
          ? 'text-xs font-bold text-red-500'
          : 'text-xs font-bold text-orange-500'
      }
    >
      D-{daysRemaining}
    </span>
  )
}
