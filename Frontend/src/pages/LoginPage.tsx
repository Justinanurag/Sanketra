import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { PasswordField } from '@/components/auth/PasswordField'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema, type LoginValues } from '@/lib/authValidation'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [saving, setSaving] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '', remember: false },
  })

  async function onSubmit(values: LoginValues) {
    setSaving(true)
    try {
      await login(values)
      toast.success('Signed in')
      const from = (location.state as { from?: string } | null)?.from
      navigate(from && from.startsWith('/') ? from : '/', { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid email/phone number or password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      description="Use the email or phone number on your account."
      footer={
        <>
          Don&apos;t have an account? <Link to="/signup">Create one.</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Email or phone number" htmlFor="identifier" required error={errors.identifier?.message}>
          <Input id="identifier" autoComplete="username" aria-invalid={Boolean(errors.identifier)} {...register('identifier')} />
        </Field>
        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          value={watch('password')}
          error={errors.password?.message}
          onChange={(value) => setValue('password', value, { shouldValidate: true, shouldDirty: true })}
          onBlur={() => undefined}
        />
        <div className="auth-row">
          <label className="check-label">
            <input type="checkbox" {...register('remember')} />
            Remember me
          </label>
          <Link className="auth-link" to="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  )
}
