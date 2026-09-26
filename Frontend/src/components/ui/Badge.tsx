import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

export type BadgeTone = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'neutral'

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={cx('badge', `badge-${tone}`)}>{children}</span>
}
