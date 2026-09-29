import { workspaceSeed } from '@/data/mock'
import { apiBase } from '@/services/http'
import { evaluateSif } from '@/lib/sifRules'
import { buildMetrics } from '@/lib/metrics'
import { barrierConditions, sifPotentials, type ReportDraft, type SafetyReport, type SifEvaluation, type WorkspaceData } from '@/types/domain'

const wait = <T,>(value: T, delay = 280) =>
  new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(value), delay)
  })

function apiUrl() {
  return apiBase()
}

function storedAnalysis(value: unknown, fallback: SifEvaluation): SifEvaluation {
  const parsed = typeof value === 'string' ? safeJson(value) : value
  if (!parsed || typeof parsed !== 'object') return fallback
  const record = parsed as Partial<SifEvaluation>
  if (!record.potential || !sifPotentials.includes(record.potential) || !Array.isArray(record.criteria)) return fallback
  return {
    potential: record.potential,
    rationale: typeof record.rationale === 'string' ? record.rationale : fallback.rationale,
    criteria: record.criteria,
  }
}

function safeJson(value: string) {
  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}

function mapStoredReport(dbReport: Record<string, unknown>): SafetyReport {
  const barrierStatus = barrierConditions.find((status) => status === dbReport.barrier_status) ?? 'unknown'
  const rule = evaluateSif({
    hazardName: String(dbReport.hazard_name ?? ''),
    energySource: String(dbReport.energy_source ?? ''),
    humanExposure: String(dbReport.human_exposure ?? ''),
    barrierName: String(dbReport.barrier_name ?? ''),
    barrierStatus,
    consequence: String(dbReport.consequence ?? ''),
  })
  const storedPotential = sifPotentials.find((item) => item === dbReport.sif_potential)
  const analysis = storedAnalysis(dbReport.analysis, rule)
  const decision = typeof dbReport.latest_decision === 'string' ? dbReport.latest_decision : ''
  const reviewStatus =
    decision === 'approved' || decision === 'edited' ? 'approved' : decision === 'rejected' ? 'rejected' : 'needs_review'
  return {
    id: String(dbReport.id),
    title: String(dbReport.title ?? ''),
    description: String(dbReport.description ?? ''),
    type: (dbReport.report_type === 'Unsafe Act' || dbReport.report_type === 'Unsafe Condition' ? dbReport.report_type : 'Near Miss'),
    occurredAt: String(dbReport.incident_date ?? ''),
    location: String(dbReport.site_location ?? ''),
    reporter: 'Safety officer',
    reporterRole: 'Safety Officer',
    hazardId: null,
    hazardName: String(dbReport.hazard_name ?? ''),
    energySource: String(dbReport.energy_source ?? ''),
    humanExposure: String(dbReport.human_exposure ?? ''),
    barrierId: null,
    barrierName: String(dbReport.barrier_name ?? ''),
    barrierStatus,
    consequence: String(dbReport.consequence ?? ''),
    notes: String(dbReport.notes ?? ''),
    reviewStatus,
    sifPotential: storedPotential ?? analysis.potential,
    analysis,
    originalAnalysis: analysis,
    recommendations: [],
    originalRecommendations: [],
    evidencePhrases: [],
    extractionConfidence: null,
  }
}

export async function loadWorkspace(): Promise<WorkspaceData> {
  const seed = structuredClone(workspaceSeed)
  const base = apiUrl()
  if (!base) return wait(seed)
  try {
    const res = await fetch(`${base}/reports`, { credentials: 'include' })
    if (res.ok) {
      const dbReports = await res.json()
      if (!Array.isArray(dbReports)) return wait(seed)
      const mappedReports: SafetyReport[] = dbReports.map((dbReport) => mapStoredReport(dbReport as Record<string, unknown>))
      if (mappedReports.length) seed.reports = mappedReports
    }
  } catch {
    // The local register stays in place when the API is offline.
  }
  return wait(seed)
}

export async function createReportApi(data: ReportDraft) {
  const base = apiUrl()
  if (!base) return null
  const res = await fetch(`${base}/reports`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to create report in backend')
  return await res.json()
}

export async function getDashboard() {
  const data = await loadWorkspace()
  return buildMetrics(data)
}

export async function getReports() {
  const data = await loadWorkspace()
  return data.reports
}

export async function getReport(id: string) {
  const data = await loadWorkspace()
  return data.reports.find((report) => report.id === id) ?? null
}

export async function analyzeReport(id: string) {
  const base = apiUrl()
  if (base) {
    try {
      const res = await fetch(`${base}/reports/${id}/analyze`, { method: 'POST', credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        return {
          id,
          sifPotential: data.sif_potential,
          confidence: data.extraction_confidence,
          analysis: data.analysis,
          demo: false,
        }
      }
    } catch {
      // Fall through to the local rule result.
    }
  }
  
  // Fallback to mock logic
  const report = await getReport(id)
  return {
    id,
    sifPotential: report?.sifPotential ?? 'undetermined',
    confidence: report?.extractionConfidence ?? null,
    demo: true,
  }
}

export async function getSimilarReports(id: string) {
  const data = await loadWorkspace()
  return { id, reports: data.similarities[id] ?? [] }
}

export async function uploadCCTV(file: File | undefined) {
  return wait({ id: 'cctv-demo-01', filename: file?.name ?? 'evidence', demo: true })
}

export async function analyzeCCTV(id: string) {
  return wait({ id, status: 'complete' as const, demo: true })
}

export async function getCorrelation(id: string) {
  const data = await loadWorkspace()
  return { id, claims: data.claims.filter((claim) => claim.reportId === id) }
}

export async function submitReview(id: string, body: { decision: string; comments: string }) {
  const base = apiUrl()
  if (base) {
    try {
      const res = await fetch(`${base}/reviews/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const data = await res.json()
        return { id, ...body, event: data.event, status: 'recorded' as const }
      }
    } catch {
      // The officer decision is still stored in the local register.
    }
  }
  return wait({ id, ...body, status: 'recorded' as const })
}

export type { WorkspaceData }

// Integration contract for the services that are not connected yet:
// POST /api/reports · GET /api/reports · GET /api/reports/:id
// POST /api/reports/:id/analyze · GET /api/reports/:id/similar
// POST /api/cctv/upload · POST /api/cctv/:id/analyze
// POST /api/correlation/analyze · POST /api/reviews · GET /api/dashboard
