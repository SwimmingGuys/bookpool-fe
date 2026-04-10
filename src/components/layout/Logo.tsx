import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link to="/" className="flex items-baseline gap-2 no-underline">
      <span className="text-xl font-bold text-amber-900 tracking-tight">
        Bookie
      </span>
      <span className="text-[10px] font-medium text-amber-600/60 tracking-widest uppercase">
        Review Platform
      </span>
    </Link>
  )
}
