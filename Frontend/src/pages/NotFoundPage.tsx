import { Link } from 'react-router'
import { EmptyState } from '@/components/ui/EmptyState'

export function NotFoundPage() {
  return (
    <EmptyState
      title="Page not found"
      description="That address is not part of the safety register."
      action={<Link className="btn btn-secondary" to="/">Back to dashboard</Link>}
    />
  )
}
