import { useId, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export default function FormField({
  label,
  error,
  hint,
  className,
  id: idProp,
  ...inputProps
}: FormFieldProps) {
  const reactId = useId()
  const id = idProp ?? reactId
  const describedById = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-semibold text-stone-700">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedById}
        className={cn(
          'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 outline-none transition-all',
          'focus:ring-4',
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-stone-200 focus:border-orange-400 focus:ring-orange-100',
        )}
        {...inputProps}
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-500">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-stone-400">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
