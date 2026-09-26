import type { ReactNode } from 'react'

export function Tooltip({ content, children }: { content: string; children: ReactNode }) {
  return (
    <span className="tooltip" title={content}>
      {children}
    </span>
  )
}
