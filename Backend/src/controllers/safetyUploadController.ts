import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { readDocument } from '../services/documentText'
import { extractSafetyReport } from '../services/safetyExtraction'
import { loadUpload, saveUpload } from '../services/uploadStore'

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024

const allowed = new Map<string, { mime: string; signature?: number[] }>([
  ['pdf', { mime: 'application/pdf', signature: [0x25, 0x50, 0x44, 0x46] }],
  ['docx', { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', signature: [0x50, 0x4b, 0x03, 0x04] }],
  ['doc', { mime: 'application/msword', signature: [0xd0, 0xcf, 0x11, 0xe0] }],
  ['txt', { mime: 'text/plain' }],
  ['png', { mime: 'image/png', signature: [0x89, 0x50, 0x4e, 0x47] }],
  ['jpg', { mime: 'image/jpeg', signature: [0xff, 0xd8, 0xff] }],
  ['jpeg', { mime: 'image/jpeg', signature: [0xff, 0xd8, 0xff] }],
])

function extensionOf(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

function matchesSignature(content: Buffer, signature?: number[]) {
  if (!signature) return true
  return signature.every((byte, index) => content[index] === byte)
}

function fail(res: Response, status: number, message: string) {
  res.status(status).json({ success: false, message })
}

export async function uploadSafetyReport(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file
    if (!file) {
      fail(res, 400, 'Choose a safety report file to upload')
      return
    }
    const extension = extensionOf(file.originalname)
    const rule = allowed.get(extension)
    if (!rule || !matchesSignature(file.buffer, rule.signature)) {
      fail(res, 400, 'Upload a PDF, DOCX, DOC, TXT, PNG, JPG, or JPEG file')
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      fail(res, 400, 'The file must be 8 MB or smaller')
      return
    }
    const fileName = file.originalname.split(/[/\\]/).pop()?.slice(0, 255) || `report.${extension}`
    const saved = await saveUpload({
      userId: req.user!.id,
      fileName,
      mimeType: rule.mime,
      content: file.buffer,
    })
    res.status(201).json({
      success: true,
      message: 'Document uploaded',
      data: {
        documentId: saved.id,
        fileName: saved.fileName,
        size: saved.sizeBytes,
        mimeType: saved.mimeType,
      },
    })
  } catch (error) {
    next(error)
  }
}

const extractSchema = z.object({
  documentId: z.string().trim().min(1, 'Document reference is required'),
})

export async function extractSafetyReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { documentId } = extractSchema.parse(req.body)
    const document = await loadUpload(req.user!.id, documentId)
    if (!document) {
      fail(res, 404, 'That upload has expired. Upload the report again.')
      return
    }
    const text = await readDocument(document.fileName, Buffer.from(document.content))
    if (text.trim().length < 20) {
      fail(res, 422, 'No readable text was found. Upload a text-based file, or a clear PNG or JPG of the page.')
      return
    }
    const extracted = await extractSafetyReport(text)
    const filled = Object.values(extracted.fieldMetadata).filter((item) => item.source === 'document').length
    res.json({
      success: true,
      message: filled
        ? 'Safety report information extracted successfully'
        : 'The document did not contain enough labeled incident details. Complete the form manually.',
      data: {
        extractedText: text.slice(0, 12000),
        report: extracted.report,
        form: extracted.form,
        fieldMetadata: extracted.fieldMetadata,
        requiresReview: true,
        fileName: document.fileName,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      fail(res, 400, error.issues[0]?.message || 'Invalid request')
      return
    }
    if (error instanceof Error && /unsupported|unable to read|password/i.test(error.message)) {
      fail(res, 422, 'This file could not be read. Try PDF, DOCX, TXT, or a clear image.')
      return
    }
    next(error)
  }
}
