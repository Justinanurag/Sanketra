import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

export function Callout({
  tone = 'neutral',
  title,
  children,
}: {
  tone?: 'neutral' | 'warning' | 'critical' | 'info'
  title: string
  children: ReactNode
}) {
  return (
    <div className={cx('callout', tone !== 'neutral' && `callout-${tone}`)}>
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  )
}
