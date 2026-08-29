import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/cn'
import {
  buttonBase,
  buttonSizes,
  buttonVariants,
  type ButtonSize,
  type ButtonVariant,
} from './buttonStyles'

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

// 버튼처럼 보이는 링크. 빈 상태·404 화면의 "돌아가기" 같은 이동 동작에 쓴다.
export default function ButtonLink({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        buttonBase,
        fullWidth && 'w-full',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...rest}
    />
  )
}
