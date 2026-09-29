import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { forgotSchema } from '@/lib/authValidation'
import { requestPasswordReset } from '@/services/authService'

export function ForgotPasswordPage() {
  const [saving, setSaving] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values: { email: string }) {
    setSaving(true)
    try {
      const result = await requestPasswordReset(values.email)
      toast.success(result.message || 'If an account exists, a reset link has been created')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Reset request failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter the email on your account. If it is registered, a reset token is created."
      footer={<Link to="/login">Back to sign in</Link>}
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Email address" htmlFor="email" required error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register('email')} />
        </Field>
        <Button type="submit" disabled={saving}>
          {saving ? 'Sending…' : 'Request reset'}
        </Button>
      </form>
    </AuthLayout>
  )
}
