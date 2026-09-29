import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { PasswordField } from '@/components/auth/PasswordField'
import { Button } from '@/components/ui/Button'
import { resetSchema } from '@/lib/authValidation'
import { resetAccountPassword } from '@/services/authService'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const token = params.get('token') ?? ''
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<{ password: string; confirmPassword: string }>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  async function onSubmit(values: { password: string; confirmPassword: string }) {
    if (!token) {
      toast.error('This reset link is missing a token')
      return
    }
    setSaving(true)
    try {
      const message = await resetAccountPassword({ token, ...values })
      toast.success(message)
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Password could not be reset')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthLayout
      title="Choose a new password"
      description="This replaces the password on the account and signs out other sessions."
      footer={<Link to="/login">Back to sign in</Link>}
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <PasswordField
          id="password"
          label="New password"
          autoComplete="new-password"
          showStrength
          value={watch('password')}
          error={errors.password?.message}
          onChange={(value) => setValue('password', value, { shouldValidate: true, shouldDirty: true })}
          onBlur={() => undefined}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          value={watch('confirmPassword')}
          error={errors.confirmPassword?.message}
          onChange={(value) => setValue('confirmPassword', value, { shouldValidate: true, shouldDirty: true })}
          onBlur={() => undefined}
        />
        <Button type="submit" disabled={saving || !token}>
          {saving ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthLayout>
  )
}
