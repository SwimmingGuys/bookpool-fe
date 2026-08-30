// Button과 ButtonLink가 같은 모양을 갖도록 스타일을 한 곳에 둔다.
// 예전엔 페이지마다 오렌지 버튼 클래스를 직접 써서 크기·radius가 조금씩 달랐다.
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export const buttonBase =
  'inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors no-underline disabled:cursor-not-allowed'

export const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-orange-500 text-white hover:bg-orange-600 disabled:bg-orange-300 disabled:text-white',
  secondary:
    'border border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50 disabled:bg-stone-50 disabled:text-stone-400',
  ghost:
    'text-stone-600 hover:text-stone-800 hover:bg-stone-100 disabled:text-stone-300',
  danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300',
}

export const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
}
