import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Toaster } from 'sonner'
import { CreateReportModal } from '@/features/reports/CreateReportModal'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useWorkspace } from '@/hooks/useWorkspace'

const STORAGE_KEY = 'sanketra.sidebar'

export function MainLayout() {
  const isMobile = useMediaQuery('(max-width: 960px)')
  const [collapsed, setCollapsed] = useState(() => window.localStorage.getItem(STORAGE_KEY) === 'true')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const { status, reload } = useWorkspace()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  function toggleNavigation() {
    if (isMobile) {
      setMobileOpen((open) => !open)
      return
    }
    setCollapsed((value) => {
      window.localStorage.setItem(STORAGE_KEY, String(!value))
      return !value
    })
  }

  const menuLabel = isMobile
    ? mobileOpen
      ? 'Close navigation'
      : 'Open navigation'
    : collapsed
      ? 'Expand sidebar'
      : 'Collapse sidebar'

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Sidebar collapsed={!isMobile && collapsed} mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />
      {isMobile && mobileOpen ? (
        <button type="button" className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
      ) : null}
      <div className="main-column">
        <Header menuLabel={menuLabel} showMenuIcon={isMobile || collapsed} onToggle={toggleNavigation} />
        <main id="main" className="content">
          {status === 'loading' ? <LoadingState /> : null}
          {status === 'error' ? <ErrorState onRetry={reload} /> : null}
          {status === 'ready' ? (
            <Suspense fallback={<LoadingState label="Loading page" />}>
              <Outlet />
            </Suspense>
          ) : null}
        </main>
      </div>
      <CreateReportModal />
      <Toaster
        theme="light"
        position="bottom-right"
        toastOptions={{ classNames: { toast: 'sanketra-toast' } }}
      />
    </div>
  )
}
