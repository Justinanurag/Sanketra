import type { CookieOptions, Response } from 'express'

export const ACCESS_COOKIE = 'sanketra_access'
export const REFRESH_COOKIE = 'sanketra_refresh'

function base(): CookieOptions {
  const production = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? 'none' : 'lax',
    path: '/',
  }
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string, refreshMs: number) {
  res.cookie(ACCESS_COOKIE, accessToken, { ...base(), maxAge: 15 * 60 * 1000 })
  res.cookie(REFRESH_COOKIE, refreshToken, { ...base(), maxAge: refreshMs })
}

export function clearAuthCookies(res: Response) {
  const options = base()
  res.clearCookie(ACCESS_COOKIE, options)
  res.clearCookie(REFRESH_COOKIE, options)
}
