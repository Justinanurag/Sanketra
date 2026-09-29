import { prismaClient } from '../config/dbConnection'

const RETENTION_MS = 2 * 60 * 60 * 1000

export async function saveUpload(input: {
  userId: string
  fileName: string
  mimeType: string
  content: Buffer
}) {
  const prisma = prismaClient()
  await prisma.uploadedDocument.deleteMany({ where: { expiresAt: { lt: new Date() } } })
  return prisma.uploadedDocument.create({
    data: {
      userId: input.userId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.content.byteLength,
      content: new Uint8Array(input.content),
      expiresAt: new Date(Date.now() + RETENTION_MS),
    },
  })
}

export async function loadUpload(userId: string, documentId: string) {
  const prisma = prismaClient()
  await prisma.uploadedDocument.deleteMany({ where: { expiresAt: { lt: new Date() } } })
  return prisma.uploadedDocument.findFirst({
    where: { id: documentId, userId, expiresAt: { gt: new Date() } },
  })
}
