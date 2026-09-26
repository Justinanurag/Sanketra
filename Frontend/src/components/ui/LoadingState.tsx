export function LoadingState({ label = 'Loading the register' }: { label?: string }) {
  return (
    <div className="loading-block" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {Array.from({ length: 6 }, (_, index) => (
        <div className="skeleton-row" key={index}>
          <div className="skeleton" style={{ width: index % 2 ? '72%' : '46%', height: index === 0 ? 22 : 14 }} />
        </div>
      ))}
    </div>
  )
}
