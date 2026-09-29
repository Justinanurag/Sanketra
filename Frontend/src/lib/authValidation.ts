import { z } from 'zod'

export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ''))
  .refine((value) => /^[6-9]\d{9}$/.test(value), 'Enter a 10-digit mobile number starting with 6–9')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/\d/, 'Password must include a number')
  .regex(/[^A-Za-z0-9]/, 'Password must include a symbol')

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is required').max(120),
    email: z.string().trim().email('Enter a valid email address'),
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Email or phone number is required'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean(),
})

export const forgotSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
})

export const resetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignupValues = z.infer<typeof signupSchema>
export type LoginValues = z.infer<typeof loginSchema>

export function passwordStrength(password: string) {
  const checks = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const label = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][score]
  return { score, label }
}
