import type { User } from '../generated/prisma'

declare global {
  namespace Express {
    interface Request {
      user?: Pick<User, 'id' | 'name' | 'email' | 'phone'>
    }
  }
}

export {}
