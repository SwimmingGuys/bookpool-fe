import { cn } from '@/lib/cn'

interface SkeletonProps {
  className?: string
}

// 로딩 자리를 채우는 회색 블록. 조회가 끝나기 전 "결과 없음"이 잠깐 보이는 걸 막는다.
export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-md bg-stone-100', className)}
    />
  )
}

// 보드·마이페이지의 공고 카드 자리
export function RecruitmentCardSkeleton() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-4 w-10" />
      </div>
      <Skeleton className="mt-3 h-4 w-4/5" />
      <Skeleton className="mt-2 h-4 w-3/5" />
      <Skeleton className="mt-4 h-3 w-2/5" />
    </div>
  )
}

export function RecruitmentGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <RecruitmentCardSkeleton key={i} />
      ))}
    </div>
  )
}

// 전체 모집 목록의 한 줄 자리. 행 레이아웃과 높이를 맞춰 로딩 후 화면이 튀지 않게 한다.
export function RecruitmentRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:gap-6 sm:p-5">
      <div className="min-w-0 flex-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-4 w-3/5" />
        <Skeleton className="mt-2 h-3 w-2/5" />
        <Skeleton className="mt-3 h-3 w-44" />
      </div>
      <div className="hidden w-28 shrink-0 flex-col gap-1.5 sm:flex">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-3 w-14 shrink-0" />
    </div>
  )
}

export function RecruitmentRowListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <RecruitmentRowSkeleton key={i} />
      ))}
    </div>
  )
}
