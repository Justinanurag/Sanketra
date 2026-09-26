import { forwardRef, type InputHTMLAttributes } from 'react'
import { cx } from '@/lib/cx'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cx('input', className)} {...props} />
})
