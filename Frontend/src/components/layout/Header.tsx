import { useMemo, useState } from 'react'
import { Bell, ChevronDown, Menu, PanelLeft, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { currentUser } from '@/constants/session'
import { useWorkspace } from '@/hooks/useWorkspace'
import { formatDateTime } from '@/lib/format'

export function Header({
  menuLabel,
  showMenuIcon,
  onToggle,
}: {
  menuLabel: string
  showMenuIcon: boolean
  onToggle: () => void
}) {
  const navigate = useNavigate()
  const { data, markNotificationsRead } = useWorkspace()
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const unread = data?.notifications.some((item) => item.unread) ?? false

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (term.length < 2 || !data) return []
    return data.reports
      .filter((report) => `${report.id} ${report.title} ${report.hazardName} ${report.location}`.toLowerCase().includes(term))
      .slice(0, 6)
  }, [query, data])

  return (
    <header className="topbar">
      <button
        type="button"
        className="icon-button"
        onClick={onToggle}
        aria-label={menuLabel}
      >
        {showMenuIcon ? <Menu size={18} /> : <PanelLeft size={18} />}
      </button>
      <Breadcrumbs />
      <div className="topbar-spacer" />
      <div className="top-search search-field" style={{ width: 240 }}>
        <Search size={15} aria-hidden />
        <input
          className="input"
          value={query}
          placeholder="Search reports"
          aria-label="Search reports"
          onChange={(event) => {
            setQuery(event.target.value)
            setSearchOpen(true)
          }}
          onFocus={() => setSearchOpen(true)}
          onBlur={() => window.setTimeout(() => setSearchOpen(false), 150)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && results[0]) navigate(`/reports/${results[0].id}`)
            if (event.key === 'Escape') setSearchOpen(false)
          }}
        />
        {searchOpen && query.trim().length >= 2 ? (
          <div className="dropdown-menu" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0 }}>
            {results.length ? (
              results.map((report) => (
                <Link key={report.id} className="menu-link" to={`/reports/${report.id}`}>
                  <span className="mono">{report.id}</span>
                  <span className="menu-meta">{report.title}</span>
                </Link>
              ))
            ) : (
              <div className="dropdown-item">No matching reports</div>
            )}
          </div>
        ) : null}
      </div>
      <Dropdown
        trigger={({ toggle, open }) => (
          <button
            type="button"
            className="icon-button notice-button"
            aria-label="Notifications"
            aria-expanded={open}
            onClick={() => {
              toggle()
              markNotificationsRead()
            }}
          >
            <Bell size={18} />
            {unread ? <i /> : null}
          </button>
        )}
      >
        {(data?.notifications ?? []).length ? (
          data?.notifications.map((item) => (
            <Link key={item.id} className="menu-link" to={item.href} onClick={markNotificationsRead}>
              {item.title}
              <span className="menu-meta">
                {item.body} · {formatDateTime(item.createdAt)}
              </span>
            </Link>
          ))
        ) : (
          <div className="dropdown-item">No notifications</div>
        )}
      </Dropdown>
      <Dropdown
        trigger={({ toggle, open }) => (
          <button type="button" className="profile-button" aria-expanded={open} aria-label="Account menu" onClick={toggle}>
            <span className="avatar">{currentUser.initials}</span>
            <span className="profile-copy">
              <strong>{currentUser.name}</strong>
              <span>{currentUser.role}</span>
            </span>
            <ChevronDown size={14} />
          </button>
        )}
      >
        <div className="dropdown-item">
          {currentUser.name}
          <span className="menu-meta">{currentUser.role}</span>
        </div>
        <DropdownItem
          onSelect={() => toast.message('This session stays on this device. Sign-in is not connected.')}
        >
          Sign out
        </DropdownItem>
      </Dropdown>
    </header>
  )
}
