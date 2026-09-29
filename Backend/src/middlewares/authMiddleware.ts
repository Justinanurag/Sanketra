import type { NextFunction, Request, Response } from 'express'
import { prismaClient } from '../config/dbConnection'
import { ACCESS_COOKIE } from '../utils/cookies'
import { verifyAccessToken } from '../utils/jwt'

export interface AuthUser {
  id: string
  name: string
  email: string
  phone: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[ACCESS_COOKIE]
  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required' })
    return
  }
  try {
    const { userId } = verifyAccessToken(token)
    const user = await prismaClient().user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true },
    })
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' })
      return
    }
    req.user = user
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Authentication required' })
  }
}
