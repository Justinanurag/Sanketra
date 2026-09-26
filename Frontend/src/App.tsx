import { Component, type ReactNode } from 'react'
import { AppRouter } from '@/app/router'
import { ErrorState } from '@/components/ui/ErrorState'

interface BoundaryState {
  failed: boolean
}

class AppErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="content">
          <ErrorState
            title="The application hit an unexpected error"
            description="Reload the page to return to the register."
            onRetry={() => window.location.reload()}
          />
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppRouter />
    </AppErrorBoundary>
  )
}
