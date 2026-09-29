import jwt, { type SignOptions } from 'jsonwebtoken'

function required(name: string) {
  const value = process.env[name]
  if (!value || value.length < 32) {
    throw new Error(`${name} must be set to a secret of at least 32 characters`)
  }
  return value
}

function expiresIn(name: string, fallback: string): SignOptions['expiresIn'] {
  return (process.env[name] || fallback) as SignOptions['expiresIn']
}

export function signAccessToken(userId: string) {
  return jwt.sign({ sub: userId, typ: 'access' }, required('JWT_SECRET'), {
    expiresIn: expiresIn('JWT_EXPIRES_IN', '15m'),
  })
}

export function signRefreshToken(userId: string, sessionId: string, lifetimeMs: number) {
  return jwt.sign({ sub: userId, sid: sessionId, typ: 'refresh' }, required('JWT_REFRESH_SECRET'), {
    expiresIn: Math.max(1, Math.floor(lifetimeMs / 1000)),
  })
}

export function verifyAccessToken(token: string) {
  const payload = jwt.verify(token, required('JWT_SECRET'))
  if (typeof payload === 'string' || payload.typ !== 'access' || typeof payload.sub !== 'string') {
    throw new Error('Invalid access token')
  }
  return { userId: payload.sub }
}

export function verifyRefreshToken(token: string) {
  const payload = jwt.verify(token, required('JWT_REFRESH_SECRET'))
  if (
    typeof payload === 'string' ||
    payload.typ !== 'refresh' ||
    typeof payload.sub !== 'string' ||
    typeof payload.sid !== 'string'
  ) {
    throw new Error('Invalid refresh token')
  }
  return { userId: payload.sub, sessionId: payload.sid }
}

export function refreshLifetimeMs(remember: boolean) {
  if (!remember) return 12 * 60 * 60 * 1000
  const raw = process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  const match = /^(\d+)([dhms])$/.exec(raw)
  if (!match) return 7 * 24 * 60 * 60 * 1000
  const amount = Number(match[1])
  const unit = match[2]
  const scale = unit === 'd' ? 86_400_000 : unit === 'h' ? 3_600_000 : unit === 'm' ? 60_000 : 1000
  return amount * scale
}
