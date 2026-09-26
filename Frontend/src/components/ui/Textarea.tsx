import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cx } from '@/lib/cx'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props },
  ref,
) {
  return <textarea ref={ref} className={cx('textarea', className)} {...props} />
})
