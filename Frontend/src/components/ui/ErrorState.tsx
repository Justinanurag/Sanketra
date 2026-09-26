import { Button } from '@/components/ui/Button'

export function ErrorState({
  title = 'This view could not be loaded',
  description = 'The register did not respond. Retry the request. Nothing has been changed.',
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div className="error-state" role="alert">
      <h2>{title}</h2>
      <p>{description}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  )
}
