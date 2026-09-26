import type { ButtonHTMLAttributes } from 'react'
import { cx } from '@/lib/cx'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-solid'
  size?: 'md' | 'sm' | 'icon'
}

export function Button({ variant = 'primary', size = 'md', className, type, ...props }: ButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      className={cx('btn', `btn-${variant}`, size === 'sm' && 'btn-sm', size === 'icon' && 'btn-icon', className)}
      {...props}
    />
  )
}
