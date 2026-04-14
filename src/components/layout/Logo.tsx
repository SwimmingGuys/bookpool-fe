import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link to="/" className="flex items-baseline gap-2 no-underline">
      <span className="text-xl font-bold text-stone-800 tracking-tight">
        BookPool
      </span>
      <span className="text-[10px] font-medium text-stone-400 tracking-widest uppercase">
        Review Platform
      </span>
    </Link>
  )
}
