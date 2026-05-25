import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-orange-500 text-white hover:bg-orange-600 disabled:bg-orange-300 disabled:text-white',
  secondary:
    'border border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50 disabled:bg-stone-50 disabled:text-stone-400',
  ghost:
    'text-stone-600 hover:text-stone-800 hover:bg-stone-100 disabled:text-stone-300',
  danger:
    'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', fullWidth, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors',
        'disabled:cursor-not-allowed',
        fullWidth && 'w-full',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...rest}
    />
  )
})

export default Button
