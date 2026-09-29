import { apiRequest } from '@/services/http'

export interface AuthUser {
  id: string
  name: string
  email: string
  phone: string
}

interface AuthResponse {
  success: boolean
  message?: string
  data?: { user?: AuthUser; token?: string }
}

export async function signupAccount(input: {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}) {
  const result = await apiRequest<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!result.ok || !result.body.data?.user) {
    throw new Error(result.body.message || 'Account could not be created')
  }
  return result.body.data.user
}

export async function loginAccount(input: { identifier: string; password: string; remember: boolean }) {
  const result = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!result.ok || !result.body.data?.user) {
    throw new Error(result.body.message || 'Invalid email/phone number or password')
  }
  return result.body.data.user
}

export async function currentAccount() {
  const result = await apiRequest<AuthResponse>('/auth/me')
  if (!result.ok || !result.body.data?.user) return null
  return result.body.data.user
}

export async function refreshSession() {
  const result = await apiRequest<AuthResponse>('/auth/refresh', { method: 'POST' })
  return result.ok
}

export async function logoutAccount() {
  await apiRequest<AuthResponse>('/auth/logout', { method: 'POST' })
}

export async function requestPasswordReset(email: string) {
  const result = await apiRequest<AuthResponse>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
  if (!result.ok) throw new Error(result.body.message || 'Reset request failed')
  return result.body
}

export async function resetAccountPassword(input: { token: string; password: string; confirmPassword: string }) {
  const result = await apiRequest<AuthResponse>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!result.ok) throw new Error(result.body.message || 'Password could not be reset')
  return result.body.message || 'Password updated'
}
