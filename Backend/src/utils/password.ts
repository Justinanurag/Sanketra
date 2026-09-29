import bcrypt from 'bcrypt'
import { createHash, randomBytes } from 'crypto'

const ROUNDS = 12

export function hashPassword(password: string) {
  return bcrypt.hash(password, ROUNDS)
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash)
}

export function randomToken() {
  return randomBytes(32).toString('base64url')
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}
