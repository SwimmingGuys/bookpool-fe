import type { ReactNode } from 'react'
import { useInView } from '@/lib/useInView'
import { cn } from '@/lib/cn'

interface StaggerChildrenProps {
  children: ReactNode[]
  className?: string
  staggerMs?: number
  baseDelay?: number
}

export default function StaggerChildren({
  children,
  className,
  staggerMs = 80,
  baseDelay = 200,
}: StaggerChildrenProps) {
  const { ref, isInView } = useInView()

  return (
    <div ref={ref} className={cn('relative', className)}>
      {children.map((child, index) => (
        <div
          key={index}
          className="transition-all duration-500 ease-out"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? 'translateY(0)' : 'translateY(24px)',
            transitionDelay: `${index * staggerMs + baseDelay}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
