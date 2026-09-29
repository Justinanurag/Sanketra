import { apiBase } from '@/services/http'
import type { BarrierCondition, ReportDraft, ReportType } from '@/types/domain'

export interface ExtractionPayload {
  success: boolean
  message?: string
  data?: {
    fileName: string
    form: {
      title: string | null
      description: string | null
      type: ReportType | null
      occurredAt: string | null
      location: string | null
      hazardName: string | null
      energySource: string | null
      humanExposure: string | null
      barrierName: string | null
      barrierStatus: BarrierCondition | null
      consequence: string | null
      notes: string | null
    }
    fieldMetadata: Record<string, { source: 'document' | 'missing'; confidence: number }>
    requiresReview: boolean
  }
}

export interface ExtractionFill {
  fileName: string
  draft: ReportDraft
  filled: Partial<Record<keyof ReportDraft, { confidence: number }>>
  missing: (keyof ReportDraft)[]
}

const formKeys: (keyof ReportDraft)[] = [
  'title',
  'description',
  'type',
  'occurredAt',
  'location',
  'hazardName',
  'energySource',
  'humanExposure',
  'barrierName',
  'barrierStatus',
  'consequence',
  'notes',
]

export async function uploadSafetyDocument(file: File) {
  const body = new FormData()
  body.append('file', file)
  const response = await fetch(`${apiBase()}/safety-reports/upload`, {
    method: 'POST',
    credentials: 'include',
    body,
  })
  const payload = (await response.json().catch(() => ({}))) as {
    success?: boolean
    message?: string
    data?: { documentId: string }
  }
  if (!response.ok || !payload.data?.documentId) {
    throw new Error(payload.message || 'The file could not be uploaded')
  }
  return payload.data.documentId
}

export async function extractSafetyDocument(documentId: string) {
  const response = await fetch(`${apiBase()}/safety-reports/extract`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId }),
  })
  const payload = (await response.json().catch(() => ({}))) as ExtractionPayload
  if (!response.ok || !payload.data) {
    throw new Error(payload.message || 'The report could not be read')
  }
  return payload
}

export function toExtractionFill(payload: ExtractionPayload): ExtractionFill {
  const data = payload.data
  if (!data) throw new Error('Nothing was extracted')
  const draft: ReportDraft = {
    title: '',
    description: '',
    type: 'Near Miss',
    occurredAt: '',
    location: '',
    hazardName: '',
    energySource: '',
    humanExposure: '',
    barrierName: '',
    barrierStatus: 'unknown',
    consequence: '',
    notes: '',
  }
  const filled: ExtractionFill['filled'] = {}
  for (const key of formKeys) {
    const value = data.form[key]
    const meta = data.fieldMetadata[key]
    if (value && meta?.source === 'document') {
      draft[key] = value as never
      filled[key] = { confidence: meta.confidence }
    }
  }
  const missing = formKeys.filter((key) => key !== 'notes' && !filled[key])
  return { fileName: data.fileName, draft, filled, missing }
}
