import { useState, useEffect } from 'react'

export default function HeroBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <section className="relative overflow-hidden bg-amber-50 px-6 py-16 md:py-24">
      <div
        className="relative z-10 max-w-3xl transition-all duration-700 ease-out"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(24px)',
        }}
      >
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
          깊게 읽고, 진심을 나누는
          <br />
          서평단 플랫폼
        </h1>
        <p className="mt-4 text-sm md:text-base text-gray-500 leading-relaxed">
          흩어진 서평 모집 공고를 한곳에서 확인하고,
          <br />
          책을 사랑하는 사람들과 함께 깊이 있는 리뷰 문화를 만들어갑니다.
        </p>
        <button className="mt-8 px-6 py-3 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 active:scale-95 transition-all">
          모집 공고 둘러보기
        </button>
      </div>

      <div
        className="absolute -right-20 top-1/2 -translate-y-1/2 w-80 h-80 md:w-[480px] md:h-[480px] rounded-full bg-amber-100/60 transition-all duration-1000 ease-out"
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
