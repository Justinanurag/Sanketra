import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  currentAccount,
  loginAccount,
  logoutAccount,
  refreshSession,
  signupAccount,
  type AuthUser,
} from '@/services/authService'

type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

interface AuthContextValue {
  user: AuthUser | null
  status: AuthStatus
  signup: (input: {
    name: string
    email: string
    phone: string
    password: string
    confirmPassword: string
  }) => Promise<void>
  login: (input: { identifier: string; password: string; remember: boolean }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    let active = true
    async function restore() {
      let account = await currentAccount()
      if (!account && (await refreshSession())) account = await currentAccount()
      if (!active) return
      setUser(account)
      setStatus(account ? 'authenticated' : 'anonymous')
    }
    void restore()
    return () => {
      active = false
    }
  }, [])

  const signup = useCallback(async (input: Parameters<AuthContextValue['signup']>[0]) => {
    const account = await signupAccount(input)
    setUser(account)
    setStatus('authenticated')
  }, [])

  const login = useCallback(async (input: Parameters<AuthContextValue['login']>[0]) => {
    const account = await loginAccount(input)
    setUser(account)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    await logoutAccount()
    setUser(null)
    setStatus('anonymous')
  }, [])

  const value = useMemo(() => ({ user, status, signup, login, logout }), [user, status, signup, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
