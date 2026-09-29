import type { ReactNode } from 'react'

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  indicator,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  required?: boolean
  indicator?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className ? `field ${className}` : 'field'}>
      <label className="field-label" htmlFor={htmlFor}>
        {label}
        {required ? <span className="req"> *</span> : null}
        {indicator}
      </label>
      {children}
      {hint ? <p className="field-hint">{hint}</p> : null}
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
