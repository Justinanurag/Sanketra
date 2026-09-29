import type { ReactNode } from 'react'
import { Link } from 'react-router'

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <main className="auth-shell">
      <div className="auth-card">
        <p className="auth-brand">Sanketra</p>
        <h1>{title}</h1>
        <p className="auth-lead">{description}</p>
        {children}
        <p className="auth-footer">{footer}</p>
      </div>
    </main>
  )
}

export function AuthLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="auth-link" to={to}>
      {children}
    </Link>
  )
}
