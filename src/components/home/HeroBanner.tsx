import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function HeroBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <section className="relative overflow-hidden bg-stone-800 px-4 py-14 sm:px-6 sm:py-16 md:py-24">
      <div
        className="relative z-10 mx-auto w-full max-w-7xl transition-all duration-700 ease-out"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(24px)',
        }}
      >
        <h1 className="max-w-3xl text-2xl font-bold leading-tight tracking-tight text-stone-50 sm:text-3xl md:text-5xl">
          깊게 읽고, 진심을 나누는
          <br />
          서평단 플랫폼
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-stone-400 md:text-base">
          흩어진 서평 모집 공고를 한곳에서 확인하고,
          <br />
          책을 사랑하는 사람들과 함께 깊이 있는 리뷰 문화를 만들어갑니다.
        </p>
        <Link
          to="/board"
          className="mt-8 inline-block rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white no-underline transition-all hover:bg-orange-600 active:scale-95"
        >
          모집 공고 둘러보기
        </Link>
      </div>

      <div
        className="absolute -right-20 top-1/2 -translate-y-1/2 w-80 h-80 md:w-[480px] md:h-[480px] rounded-full bg-stone-700/50 transition-all duration-1000 ease-out"
        style={{
          opacity: show ? 1 : 0,
          transform: show
            ? 'translateY(-50%) scale(1)'
            : 'translateY(-50%) scale(0.8)',
        }}
      />
    </section>
  )
}
