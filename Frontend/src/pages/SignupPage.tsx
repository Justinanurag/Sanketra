import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { PasswordField } from '@/components/auth/PasswordField'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { signupSchema, type SignupValues } from '@/lib/authValidation'

export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  })
  const password = watch('password')
  const confirmPassword = watch('confirmPassword')

  async function onSubmit(values: SignupValues) {
    setSaving(true)
    try {
      await signup(values)
      toast.success('Account created successfully')
      navigate('/', { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Account could not be created')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthLayout
      title="Create an account"
      description="Register to review safety reports and barrier evidence."
      footer={
        <>
          Already have an account? <Link to="/login">Sign in.</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Full name" htmlFor="name" required error={errors.name?.message}>
          <Input id="name" autoComplete="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
        </Field>
        <Field label="Email address" htmlFor="email" required error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register('email')} />
        </Field>
        <Field label="Phone number" htmlFor="phone" required error={errors.phone?.message} hint="10-digit mobile number">
          <Input id="phone" type="tel" inputMode="numeric" autoComplete="tel" aria-invalid={Boolean(errors.phone)} {...register('phone')} />
        </Field>
        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          showStrength
          value={password}
          error={errors.password?.message}
          onChange={(value) => setValue('password', value, { shouldValidate: true, shouldDirty: true })}
          onBlur={() => undefined}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          value={confirmPassword}
          error={errors.confirmPassword?.message}
          onChange={(value) => setValue('confirmPassword', value, { shouldValidate: true, shouldDirty: true })}
          onBlur={() => undefined}
        />
        <Button type="submit" disabled={saving}>
          {saving ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  )
}
