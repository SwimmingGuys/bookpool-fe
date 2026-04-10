import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link to="/" className="flex items-baseline gap-2 no-underline">
      <span className="text-xl font-bold text-gray-900 tracking-tight">
        Bookie
      </span>
      <span className="text-[10px] font-medium text-gray-400 tracking-widest uppercase">
        Review Platform
      </span>
    </Link>
  )
}
