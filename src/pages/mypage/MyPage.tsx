import { Outlet } from 'react-router-dom'

export default function MyPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Outlet />
    </div>
  )
}
