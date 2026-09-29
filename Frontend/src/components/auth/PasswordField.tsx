import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { passwordStrength } from '@/lib/authValidation'

export function PasswordField({
  id,
  label,
  value,
  error,
  autoComplete,
  showStrength,
  onChange,
  onBlur,
}: {
  id: string
  label: string
  value: string
  error?: string
  autoComplete: string
  showStrength?: boolean
  onChange: (value: string) => void
  onBlur: () => void
}) {
  const [visible, setVisible] = useState(false)
  const strength = passwordStrength(value)

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
        <span className="req"> *</span>
      </label>
      <div className="password-field">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {showStrength && value ? (
        <div className="strength" aria-live="polite">
          <span className={`strength-bar strength-${strength.score}`} />
          <span>{strength.label}</span>
        </div>
      ) : null}
      {error ? (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
