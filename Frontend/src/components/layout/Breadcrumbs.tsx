import { Link, useLocation } from 'react-router'
import { routeLabels } from '@/constants/navigation'
import { useWorkspace } from '@/hooks/useWorkspace'

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const { data } = useWorkspace()
  const parts = pathname.split('/').filter(Boolean)

  if (!parts.length) {
    return (
      <nav className="crumbs" aria-label="Breadcrumb">
        <span className="current">Dashboard</span>
      </nav>
    )
  }

  const crumbs = parts.map((part, index) => {
    const path = `/${parts.slice(0, index + 1).join('/')}`
    const report = data?.reports.find((item) => item.id === part)
    const event = data?.events.find((item) => item.id === part)
    const label = routeLabels[path] ?? report?.id ?? event?.id ?? part
    return { path, label, current: index === parts.length - 1 }
  })

  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <Link to="/">Dashboard</Link>
      {crumbs.map((crumb) => (
        <span key={crumb.path} style={{ display: 'contents' }}>
          <span aria-hidden="true">/</span>
          {crumb.current ? <span className="current">{crumb.label}</span> : <Link to={crumb.path}>{crumb.label}</Link>}
        </span>
      ))}
    </nav>
  )
}
