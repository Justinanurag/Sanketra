import { z } from 'zod'

const reportTypes = ['Near Miss', 'Unsafe Act', 'Unsafe Condition'] as const
const barrierStatuses = ['present', 'absent', 'ineffective', 'bypassed', 'unknown'] as const

const emptyReport = {
  incidentTitle: null,
  incidentId: null,
  incidentDate: null,
  incidentTime: null,
  reportedDate: null,
  location: null,
  department: null,
  workArea: null,
  companyName: null,
  contractorName: null,
  incidentType: null,
  unsafeAct: null,
  unsafeCondition: null,
  description: null,
  immediateCauses: null,
  rootCause: null,
  contributingFactors: null,
  hazard: null,
  energySource: null,
  humanExposure: null,
  barrierName: null,
  barrierStatus: null,
  consequence: null,
  correctiveActions: [] as string[],
  preventiveActions: [] as string[],
  recommendations: [] as string[],
  potentialSeverity: null,
  evidence: null,
  lessonsLearned: null,
}

export interface ExtractedReport {
  incidentTitle: string | null
  incidentId: string | null
  incidentDate: string | null
  incidentTime: string | null
  reportedDate: string | null
  location: string | null
  department: string | null
  workArea: string | null
  companyName: string | null
  contractorName: string | null
  incidentType: string | null
  unsafeAct: string | null
  unsafeCondition: string | null
  description: string | null
  immediateCauses: string | null
  rootCause: string | null
  contributingFactors: string | null
  hazard: string | null
  energySource: string | null
  humanExposure: string | null
  barrierName: string | null
  barrierStatus: string | null
  consequence: string | null
  correctiveActions: string[]
  preventiveActions: string[]
  recommendations: string[]
  potentialSeverity: string | null
  evidence: string | null
  lessonsLearned: string | null
}

const arrayFields = new Set<keyof ExtractedReport>(['correctiveActions', 'preventiveActions', 'recommendations'])

const labels: { field: keyof ExtractedReport; names: string[] }[] = [
  { field: 'incidentTitle', names: ['incident title', 'report title', 'title', 'subject'] },
  { field: 'incidentId', names: ['incident id', 'reference number', 'reference no', 'report number', 'incident number'] },
  { field: 'incidentDate', names: ['incident date', 'date of incident', 'date and time', 'occurrence date', 'date'] },
  { field: 'incidentTime', names: ['incident time', 'time of incident', 'time'] },
  { field: 'reportedDate', names: ['reported date', 'date reported'] },
  { field: 'location', names: ['incident location', 'location', 'site', 'area'] },
  { field: 'department', names: ['department'] },
  { field: 'workArea', names: ['work area', 'workplace'] },
  { field: 'companyName', names: ['company name', 'company'] },
  { field: 'contractorName', names: ['contractor name', 'contractor'] },
  { field: 'incidentType', names: ['incident type', 'report type', 'classification', 'type'] },
  { field: 'unsafeAct', names: ['unsafe act'] },
  { field: 'unsafeCondition', names: ['unsafe condition'] },
  { field: 'description', names: ['detailed description', 'incident summary', 'what happened', 'description', 'summary', 'narrative'] },
  { field: 'immediateCauses', names: ['immediate causes', 'immediate cause'] },
  { field: 'rootCause', names: ['root causes', 'root cause'] },
  { field: 'contributingFactors', names: ['contributing factors', 'contributing factor'] },
  { field: 'hazard', names: ['hazard identified', 'hazard category', 'hazard'] },
  { field: 'energySource', names: ['energy source', 'energy'] },
  { field: 'humanExposure', names: ['human exposure', 'exposure', 'people involved', 'persons involved'] },
  { field: 'barrierName', names: ['critical barrier', 'critical control', 'safety control', 'existing safety controls', 'barrier'] },
  { field: 'barrierStatus', names: ['barrier status', 'control status'] },
  { field: 'consequence', names: ['potential consequence', 'consequence', 'potential outcome'] },
  { field: 'correctiveActions', names: ['immediate corrective actions', 'corrective actions', 'corrective action'] },
  { field: 'preventiveActions', names: ['preventive actions', 'preventive action', 'recommended safety measures'] },
  { field: 'recommendations', names: ['recommendations'] },
  { field: 'potentialSeverity', names: ['potential severity', 'actual severity', 'severity', 'risk level'] },
  { field: 'evidence', names: ['evidence description', 'evidence', 'investigation findings'] },
  { field: 'lessonsLearned', names: ['missing safety controls', 'lessons learned'] },
]

const orderedLabels = labels
  .flatMap((entry) => entry.names.map((name) => ({ field: entry.field, name })))
  .sort((a, b) => b.name.length - a.name.length)

const modelSchema = z.object({
  incidentTitle: z.string().nullable().optional(),
  incidentId: z.string().nullable().optional(),
  incidentDate: z.string().nullable().optional(),
  incidentTime: z.string().nullable().optional(),
  reportedDate: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  workArea: z.string().nullable().optional(),
  companyName: z.string().nullable().optional(),
  contractorName: z.string().nullable().optional(),
  incidentType: z.string().nullable().optional(),
  unsafeAct: z.string().nullable().optional(),
  unsafeCondition: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  immediateCauses: z.string().nullable().optional(),
  rootCause: z.string().nullable().optional(),
  contributingFactors: z.string().nullable().optional(),
  hazard: z.string().nullable().optional(),
  energySource: z.string().nullable().optional(),
  humanExposure: z.string().nullable().optional(),
  barrierName: z.string().nullable().optional(),
  barrierStatus: z.string().nullable().optional(),
  consequence: z.string().nullable().optional(),
  correctiveActions: z.array(z.string()).optional(),
  preventiveActions: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
  potentialSeverity: z.string().nullable().optional(),
  evidence: z.string().nullable().optional(),
  lessonsLearned: z.string().nullable().optional(),
})

export interface FieldMeta {
  source: 'document' | 'missing'
  confidence: number
}

export interface ReportFormFill {
  title: string | null
  description: string | null
  type: (typeof reportTypes)[number] | null
  occurredAt: string | null
  location: string | null
  hazardName: string | null
  energySource: string | null
  humanExposure: string | null
  barrierName: string | null
  barrierStatus: (typeof barrierStatuses)[number] | null
  consequence: string | null
  notes: string | null
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function appearsIn(source: string, value: string) {
  const needle = normalize(value)
  if (needle.length < 2) return false
  return normalize(source).includes(needle)
}

function cleanList(value: string) {
  return value
    .split(/\n+/)
    .map((line) => line.replace(/^[\s*\-•]+/, '').trim())
    .filter((line) => line.length > 0)
}

function matchLabel(line: string) {
  const trimmed = line.trim()
  const lower = trimmed.toLowerCase()
  for (const entry of orderedLabels) {
    if (lower === entry.name) return { field: entry.field, rest: '' }
    for (const separator of [':', '-', '–']) {
      const prefix = `${entry.name}${separator}`
      if (lower.startsWith(prefix)) {
        return { field: entry.field, rest: trimmed.slice(prefix.length).trim() }
      }
    }
  }
  return null
}

export function parseLabeledReport(text: string): ExtractedReport {
  const report: ExtractedReport = { ...emptyReport, correctiveActions: [], preventiveActions: [], recommendations: [] }
  const buckets = new Map<keyof ExtractedReport, string[]>()
  let current: keyof ExtractedReport | null = null

  function push(field: keyof ExtractedReport, value: string) {
    const trimmed = value.trim()
    if (!trimmed) return
    const list = buckets.get(field) ?? []
    list.push(trimmed)
    buckets.set(field, list)
  }

  for (const line of text.split(/\r?\n/)) {
    const matched = matchLabel(line)
    if (matched) {
      current = matched.field
      if (matched.rest) push(matched.field, matched.rest)
      continue
    }
    if (current && line.trim()) push(current, line)
  }

  for (const [field, parts] of buckets) {
    const joined = parts.join('\n').trim()
    if (!joined || !appearsIn(text, joined.slice(0, 180))) continue
    if (arrayFields.has(field)) {
      report[field] = cleanList(joined) as never
    } else {
      report[field] = joined as never
    }
  }
  return report
}

function groundReport(source: string, candidate: ExtractedReport): ExtractedReport {
  const report: ExtractedReport = { ...emptyReport, correctiveActions: [], preventiveActions: [], recommendations: [] }
  for (const field of Object.keys(emptyReport) as (keyof ExtractedReport)[]) {
    const value = candidate[field]
    if (Array.isArray(value)) {
      report[field] = value.filter((item) => appearsIn(source, item)) as never
    } else if (typeof value === 'string' && appearsIn(source, value)) {
      report[field] = value as never
    }
  }
  return report
}

async function extractWithModel(text: string): Promise<ExtractedReport | null> {
  const key = process.env.OPENAI_API_KEY?.trim()
  if (!key) return null
  const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: [
            'Extract safety incident facts from the document.',
            'Copy wording that is explicitly written. Do not paraphrase into new facts.',
            'Use null for any field that is not stated. Use empty arrays when no actions are listed.',
            'Do not infer hazard, energy, barrier condition, severity, cause, or SIF classification.',
            'Do not assign a final SIF or risk classification.',
            'Return JSON with these keys only: incidentTitle, incidentId, incidentDate, incidentTime, reportedDate, location, department, workArea, companyName, contractorName, incidentType, unsafeAct, unsafeCondition, description, immediateCauses, rootCause, contributingFactors, hazard, energySource, humanExposure, barrierName, barrierStatus, consequence, correctiveActions, preventiveActions, recommendations, potentialSeverity, evidence, lessonsLearned.',
          ].join(' '),
        },
        { role: 'user', content: text.slice(0, 14000) },
      ],
    }),
  })
  if (!response.ok) return null
  const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] }
  const content = payload.choices?.[0]?.message?.content
  if (!content) return null
  const parsed = modelSchema.safeParse(JSON.parse(content))
  if (!parsed.success) return null
  return groundReport(text, { ...emptyReport, ...parsed.data, correctiveActions: parsed.data.correctiveActions ?? [], preventiveActions: parsed.data.preventiveActions ?? [], recommendations: parsed.data.recommendations ?? [] })
}

function parseDate(value: string | null) {
  if (!value) return null
  const iso = value.match(/\b(\d{4})-(\d{2})-(\d{2})\b/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
  const named = value.match(/\b(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\b/) || value.match(/\b([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})\b/)
  if (named) {
    const monthName = named[2].length > 2 ? named[2] : named[1]
    const day = named[2].length > 2 ? named[1] : named[2]
    const year = named[3]
    const month = new Date(`${monthName} 1, ${year}`).getMonth()
    if (!Number.isNaN(month)) return `${year}-${String(month + 1).padStart(2, '0')}-${String(Number(day)).padStart(2, '0')}`
  }
  const slash = value.match(/\b(\d{1,2})[/.](\d{1,2})[/.](\d{4})\b/)
  if (slash) {
    const first = Number(slash[1])
    const second = Number(slash[2])
    if (first > 12 && second <= 12) return `${slash[3]}-${String(second).padStart(2, '0')}-${String(first).padStart(2, '0')}`
    if (second > 12 && first <= 12) return `${slash[3]}-${String(first).padStart(2, '0')}-${String(second).padStart(2, '0')}`
  }
  return null
}

function parseTime(value: string | null) {
  if (!value) return null
  const clock = value.match(/\b(\d{1,2}):(\d{2})\s*([AaPp][Mm])?\b/)
  if (!clock) return null
  let hours = Number(clock[1])
  const minutes = clock[2]
  const meridiem = clock[3]?.toLowerCase()
  if (meridiem === 'pm' && hours < 12) hours += 12
  if (meridiem === 'am' && hours === 12) hours = 0
  if (hours > 23) return null
  return `${String(hours).padStart(2, '0')}:${minutes}`
}

function reportType(value: string | null) {
  if (!value) return null
  const lower = value.toLowerCase()
  if (lower.includes('near miss')) return 'Near Miss' as const
  if (lower.includes('unsafe act')) return 'Unsafe Act' as const
  if (lower.includes('unsafe condition')) return 'Unsafe Condition' as const
  return null
}

function barrierStatus(value: string | null) {
  if (!value) return null
  const lower = value.toLowerCase()
  return barrierStatuses.find((status) => lower.includes(status)) ?? null
}

function section(title: string, value: string | string[] | null) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null
  const body = Array.isArray(value) ? value.map((item) => `- ${item}`).join('\n') : value
  return `${title}\n${body}`
}

export function toReportForm(report: ExtractedReport): { form: ReportFormFill; fieldMetadata: Record<string, FieldMeta> } {
  const date = parseDate(report.incidentDate)
  const time = parseTime(report.incidentTime) || parseTime(report.incidentDate)
  const location = [report.location, report.workArea].filter(Boolean).join(', ') || null
  const description = [report.description, report.unsafeAct, report.unsafeCondition].filter(Boolean).join('\n\n') || null
  const notes = [
    section('Reference', report.incidentId),
    section('Reported date', report.reportedDate),
    section('Company', report.companyName),
    section('Department', report.department),
    section('Contractor', report.contractorName),
    section('Classification stated in the document', report.incidentType),
    section('Immediate causes', report.immediateCauses),
    section('Root cause', report.rootCause),
    section('Contributing factors', report.contributingFactors),
    section('Corrective actions', report.correctiveActions),
    section('Preventive actions', report.preventiveActions),
    section('Recommendations', report.recommendations),
    section('Severity stated in the document', report.potentialSeverity),
    section('Evidence', report.evidence),
    section('Other stated details', report.lessonsLearned),
  ]
    .filter(Boolean)
    .join('\n\n')
  const form: ReportFormFill = {
    title: report.incidentTitle,
    description,
    type: reportType(report.incidentType),
    occurredAt: date ? `${date}T${time ?? '00:00'}` : null,
    location,
    hazardName: report.hazard,
    energySource: report.energySource,
    humanExposure: report.humanExposure,
    barrierName: report.barrierName,
    barrierStatus: barrierStatus(report.barrierStatus),
    consequence: report.consequence,
    notes: notes || null,
  }
  const fieldMetadata: Record<string, FieldMeta> = {}
  for (const [key, value] of Object.entries(form)) {
    const present = Array.isArray(value) ? value.length > 0 : Boolean(value)
    fieldMetadata[key] = present ? { source: 'document', confidence: 0.9 } : { source: 'missing', confidence: 0 }
  }
  if (form.occurredAt && !time) fieldMetadata.occurredAt = { source: 'document', confidence: 0.7 }
  return { form, fieldMetadata }
}

export async function extractSafetyReport(text: string) {
  const labeled = parseLabeledReport(text)
  let report = labeled
  let method: 'model' | 'labels' = 'labels'
  try {
    const modeled = await extractWithModel(text)
    if (modeled) {
      report = modeled
      method = 'model'
    }
  } catch {
    report = labeled
  }
  const mapped = toReportForm(report)
  if (method === 'model') {
    for (const meta of Object.values(mapped.fieldMetadata)) {
      if (meta.source === 'document') meta.confidence = 0.86
    }
  }
  return { report, method, ...mapped }
}
