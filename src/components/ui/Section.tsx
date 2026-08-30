import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import AnimateIn from './AnimateIn'

interface BlobConfig {
  className: string
}

interface SectionProps {
  title: string
  subtitle: string
  background?: string
  blobs?: BlobConfig[]
  children: ReactNode
}

export default function Section({
  title,
  subtitle,
  background = '',
  blobs = [],
  children,
}: SectionProps) {
  return (
    <section className={cn('relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 md:py-24', background)}>
      {blobs.map((blob, i) => (
        <div key={i} className={cn('absolute rounded-full blur-3xl', blob.className)} />
      ))}

      <AnimateIn className="relative mb-8 text-center sm:mb-12">
        <h2 className="text-2xl font-extrabold text-stone-800 sm:text-3xl md:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-sm text-stone-500 sm:text-base">{subtitle}</p>
      </AnimateIn>

      <div className="relative mx-auto w-full max-w-7xl">{children}</div>
    </section>
  )
}
