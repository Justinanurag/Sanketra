import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function databaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return url
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: databaseUrl(),
    max: 10,
    connectionTimeoutMillis: 15_000,
  })
  return new PrismaClient({ adapter })
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

export function prismaClient(): PrismaClient {
  return getPrisma()
}

function sanitizeDbError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Unknown database error'
  return message.replace(/postgres(?:ql)?:\/\/[^@\s]+@/gi, 'postgresql://***@')
}

export async function connectDatabase(): Promise<void> {
  try {
    const client = getPrisma()
    await client.$connect()
    await client.$queryRaw`SELECT 1`
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Database connection failed:', sanitizeDbError(error))
    throw error
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!globalForPrisma.prisma) return
  await globalForPrisma.prisma.$disconnect()
}

export async function query(text: string, params: unknown[] = []) {
  const rows = await getPrisma().$queryRawUnsafe(text, ...params)
  return { rows: Array.isArray(rows) ? rows : [] }
}
