import { NavLink } from 'react-router'
import { Shield } from 'lucide-react'
import { navigation } from '@/constants/navigation'
import { useWorkspace } from '@/hooks/useWorkspace'
import { cx } from '@/lib/cx'

export function Sidebar({
  collapsed,
  mobileOpen,
  onNavigate,
}: {
  collapsed: boolean
  mobileOpen: boolean
  onNavigate: () => void
}) {
  const { data } = useWorkspace()
  const openReviews =
    data?.reports.filter((report) => report.reviewStatus === 'needs_review' || report.reviewStatus === 'in_review').length ?? 0

  return (
    <aside className={cx('sidebar', collapsed && 'is-collapsed', mobileOpen && 'is-open')} aria-label="Primary">
      <div className="brand">
        <div className="brand-mark" aria-hidden>
          <Shield size={16} />
        </div>
        <div className="brand-copy">
          <strong>Sanketra</strong>
          <span>SIF Intelligence</span>
        </div>
      </div>
      <nav className="nav">
        {navigation.map((section) => (
          <div className="nav-section" key={section.id}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map((item) => {
              const Icon = item.icon
              const badge = item.badge === 'openReviews' ? openReviews : 0
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  data-label={item.label}
                  className={({ isActive }) => cx('nav-link', isActive && 'is-active')}
                  onClick={onNavigate}
                >
                  <Icon size={18} strokeWidth={1.75} aria-hidden />
                  <span className="nav-text">{item.label}</span>
                  {badge > 0 ? <span className="nav-badge">{badge}</span> : null}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>
      <div className="sidebar-status">
        <span className="status-dot" aria-hidden />
        <div className="sidebar-status-copy">
          <strong>Register available</strong>
          <span>Local session</span>
        </div>
      </div>
    </aside>
  )
}
