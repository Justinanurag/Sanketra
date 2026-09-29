import { Navigate, Outlet, useLocation } from 'react-router'
import { LoadingState } from '@/components/ui/LoadingState'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()
  if (status === 'loading') {
    return (
      <div className="auth-shell">
        <LoadingState label="Checking session" />
      </div>
    )
  }
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

export function GuestRoute() {
  const { status } = useAuth()
  if (status === 'loading') {
    return (
      <div className="auth-shell">
        <LoadingState label="Checking session" />
      </div>
    )
  }
  if (status === 'authenticated') return <Navigate to="/" replace />
  return <Outlet />
}
