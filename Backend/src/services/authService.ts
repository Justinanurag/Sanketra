import { randomUUID } from 'crypto'
import { Prisma } from '../generated/prisma'
import { prismaClient } from '../config/dbConnection'
import { hashPassword, hashToken, randomToken, verifyPassword } from '../utils/password'
import { refreshLifetimeMs, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import type { LoginInput, SignupInput } from '../validators/authValidator'

const publicUser = {
  id: true,
  name: true,
  email: true,
  phone: true,
} as const

export class AuthError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function profile(user: { id: string; name: string; email: string; phone: string }) {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone }
}

async function issueSession(userId: string, remember: boolean) {
  const refreshMs = refreshLifetimeMs(remember)
  const sessionId = randomUUID()
  const refreshToken = signRefreshToken(userId, sessionId, refreshMs)
  await prismaClient().refreshSession.create({
    data: {
      id: sessionId,
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + refreshMs),
    },
  })
  return {
    accessToken: signAccessToken(userId),
    refreshToken,
    refreshMs,
  }
}

export async function signup(input: SignupInput) {
  const prisma = prismaClient()
  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwordHash: await hashPassword(input.password),
      },
      select: publicUser,
    })
    const session = await issueSession(user.id, true)
    return { user: profile(user), ...session }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = String(error.meta?.target ?? '')
      if (target.includes('phone')) throw new AuthError(409, 'An account with this phone number already exists')
      throw new AuthError(409, 'An account with this email already exists')
    }
    throw error
  }
}

export async function login(input: LoginInput) {
  const prisma = prismaClient()
  const identifier = input.identifier.trim()
  const phone = identifier.replace(/[\s-]/g, '')
  const user = await prisma.user.findFirst({
    where: identifier.includes('@')
      ? { email: identifier.toLowerCase() }
      : { phone },
  })
  const invalid = new AuthError(401, 'Invalid email/phone number or password')
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) throw invalid
  const session = await issueSession(user.id, Boolean(input.remember))
  return { user: profile(user), ...session }
}

export async function currentUser(userId: string) {
  const user = await prismaClient().user.findUnique({ where: { id: userId }, select: publicUser })
  if (!user) throw new AuthError(401, 'Authentication required')
  return profile(user)
}

export async function rotateSession(refreshToken: string | undefined) {
  if (!refreshToken) throw new AuthError(401, 'Authentication required')
  let claims: { userId: string; sessionId: string }
  try {
    claims = verifyRefreshToken(refreshToken)
  } catch {
    throw new AuthError(401, 'Authentication required')
  }
  const prisma = prismaClient()
  const session = await prisma.refreshSession.findUnique({ where: { id: claims.sessionId } })
  const invalid =
    !session ||
    session.userId !== claims.userId ||
    session.tokenHash !== hashToken(refreshToken) ||
    session.revokedAt ||
    session.expiresAt.getTime() <= Date.now()
  if (invalid || !session) throw new AuthError(401, 'Authentication required')

  await prisma.refreshSession.update({
    where: { id: session.id },
    data: { revokedAt: new Date() },
  })
  const remember = session.expiresAt.getTime() - session.createdAt.getTime() > 13 * 60 * 60 * 1000
  const next = await issueSession(session.userId, remember)
  return next
}

export async function logout(refreshToken: string | undefined) {
  if (!refreshToken) return
  try {
    const claims = verifyRefreshToken(refreshToken)
    await prismaClient().refreshSession.updateMany({
      where: { id: claims.sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  } catch {
    // An expired refresh cookie is still cleared by the controller.
  }
}

export async function requestPasswordReset(email: string) {
  const user = await prismaClient().user.findUnique({ where: { email } })
  if (!user) return { token: null as string | null }
  const token = randomToken()
  await prismaClient().passwordReset.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  })
  return { token: process.env.PASSWORD_RESET_DEBUG === 'true' ? token : null }
}

export async function resetPassword(token: string, password: string) {
  const prisma = prismaClient()
  const reset = await prisma.passwordReset.findUnique({ where: { tokenHash: hashToken(token) } })
  if (!reset || reset.usedAt || reset.expiresAt.getTime() <= Date.now()) {
    throw new AuthError(400, 'This reset link is invalid or has expired')
  }
  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash: await hashPassword(password) },
    }),
    prisma.passwordReset.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    }),
    prisma.refreshSession.updateMany({
      where: { userId: reset.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ])
}
