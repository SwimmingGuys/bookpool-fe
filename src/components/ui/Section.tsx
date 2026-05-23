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
    <section className={cn('relative px-6 py-20 md:py-28 overflow-hidden', background)}>
      {blobs.map((blob, i) => (
        <div key={i} className={cn('absolute rounded-full blur-3xl', blob.className)} />
      ))}

      <AnimateIn className="relative text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{title}</h2>
        <p className="mt-3 text-base text-gray-500">{subtitle}</p>
      </AnimateIn>

      <div className="relative">{children}</div>
    </section>
  )
}
