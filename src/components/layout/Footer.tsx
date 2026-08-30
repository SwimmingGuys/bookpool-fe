import { Link } from 'react-router-dom'

// 공지사항·문의는 서비스를 쓰는 흐름이 아니라 도움말에 가깝다.
// 헤더의 '보드' 옆이 아니라 여기에 둔다.
const SUPPORT_LINKS = [
  { to: '/notice', label: '공지사항' },
  { to: '/support', label: '문의 / 요청' },
]

const BROWSE_LINKS = [
  { to: '/', label: '홈' },
  { to: '/calendar', label: '모집 달력' },
  { to: '/board', label: '전체 모집 목록' },
]

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <span className="text-lg font-extrabold tracking-tight text-orange-500">
              bookpool
            </span>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              흩어진 서평단·베타리더 모집 공고를 한곳에서 확인하세요.
            </p>
          </div>

          <nav className="flex gap-12 sm:gap-16">
            <FooterColumn title="둘러보기" links={BROWSE_LINKS} />
            <FooterColumn title="고객지원" links={SUPPORT_LINKS} />
          </nav>
        </div>

        <p className="mt-10 border-t border-stone-100 pt-6 text-xs text-stone-400">
          © {new Date().getFullYear()} BookPool
        </p>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { to: string; label: string }[]
}) {
  return (
    <div>
      <p className="text-xs font-bold text-stone-700">{title}</p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {links.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              className="text-sm text-stone-500 no-underline transition-colors hover:text-orange-600"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
