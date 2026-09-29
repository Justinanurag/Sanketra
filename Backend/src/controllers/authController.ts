import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { AuthError, currentUser, login, logout, requestPasswordReset, resetPassword, rotateSession, signup } from '../services/authService'
import { clearAuthCookies, REFRESH_COOKIE, setAuthCookies } from '../utils/cookies'
import { forgotSchema, loginSchema, resetSchema, signupSchema } from '../validators/authValidator'

function fail(res: Response, status: number, message: string) {
  res.status(status).json({ success: false, message })
}

function handle(error: unknown, res: Response, next: NextFunction) {
  if (error instanceof ZodError) {
    fail(res, 400, error.issues[0]?.message || 'Invalid input')
    return
  }
  if (error instanceof AuthError) {
    fail(res, error.status, error.message)
    return
  }
  next(error)
}

export async function signupHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = signupSchema.parse(req.body)
    const result = await signup(input)
    setAuthCookies(res, result.accessToken, result.refreshToken, result.refreshMs)
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user: result.user },
    })
  } catch (error) {
    handle(error, res, next)
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body)
    const result = await login(input)
    setAuthCookies(res, result.accessToken, result.refreshToken, result.refreshMs)
    res.json({
      success: true,
      message: 'Signed in',
      data: { user: result.user },
    })
  } catch (error) {
    handle(error, res, next)
  }
}

export async function logoutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await logout(req.cookies?.[REFRESH_COOKIE])
    clearAuthCookies(res)
    res.json({ success: true, message: 'Signed out' })
  } catch (error) {
    next(error)
  }
}

export async function meHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await currentUser(req.user!.id)
    res.json({ success: true, data: { user } })
  } catch (error) {
    handle(error, res, next)
  }
}

export async function refreshHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await rotateSession(req.cookies?.[REFRESH_COOKIE])
    setAuthCookies(res, result.accessToken, result.refreshToken, result.refreshMs)
    res.json({ success: true, message: 'Session refreshed' })
  } catch (error) {
    if (error instanceof AuthError) clearAuthCookies(res)
    handle(error, res, next)
  }
}

export async function forgotHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = forgotSchema.parse(req.body)
    const result = await requestPasswordReset(input.email)
    res.json({
      success: true,
      message: 'If an account exists for that email, a reset link has been created',
      ...(result.token ? { data: { token: result.token } } : {}),
    })
  } catch (error) {
    handle(error, res, next)
  }
}

export async function resetHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = resetSchema.parse(req.body)
    await resetPassword(input.token, input.password)
    clearAuthCookies(res)
    res.json({ success: true, message: 'Password updated. Sign in with the new password.' })
  } catch (error) {
    handle(error, res, next)
  }
}
