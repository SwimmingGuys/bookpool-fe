import type { ReactNode } from 'react'
import { useInView } from '@/lib/useInView'
import { cn } from '@/lib/cn'

interface AnimateInProps {
  children: ReactNode
  className?: string
  delay?: number
}

export default function AnimateIn({ children, className, delay = 0 }: AnimateInProps) {
  const { ref, isInView } = useInView()

  return (
    <div
      ref={ref}
      className={cn('transition-all duration-700 ease-out', className)}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
