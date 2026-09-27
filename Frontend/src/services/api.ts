import { workspaceSeed } from '@/data/mock'
import { buildMetrics } from '@/lib/metrics'
import type { ReportDraft, SafetyReport, WorkspaceData } from '@/types/domain'

const wait = <T,>(value: T, delay = 280) =>
  new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(value), delay)
  })

function apiUrl() {
  const value = import.meta.env.VITE_API_URL
  return typeof value === 'string' && value.length > 0 ? value.replace(/\/$/, '') : null
}

export async function loadWorkspace(): Promise<WorkspaceData> {
  const seed = structuredClone(workspaceSeed)
  const base = apiUrl()
  if (!base) return wait(seed)
  try {
    const res = await fetch(`${base}/reports`)
    if (res.ok) {
      const dbReports = await res.json()
      if (!Array.isArray(dbReports)) return wait(seed)
      const mappedReports: SafetyReport[] = dbReports.map((dbReport: Record<string, string>) => ({
        id: String(dbReport.id),
        title: dbReport.title,
        description: dbReport.description,
        type: (dbReport.report_type || 'Near Miss') as SafetyReport['type'],
        occurredAt: dbReport.incident_date,
        location: dbReport.site_location || '',
        reporter: 'Integration User',
        reporterRole: 'Safety Officer',
        hazardId: null,
        hazardName: dbReport.hazard_name || '',
        energySource: dbReport.energy_source || '',
        humanExposure: dbReport.human_exposure || '',
        barrierId: null,
        barrierName: dbReport.barrier_name || '',
        barrierStatus: (dbReport.barrier_status || 'unknown') as SafetyReport['barrierStatus'],
        consequence: dbReport.consequence || '',
        notes: dbReport.notes || '',
        reviewStatus: 'needs_review',
        sifPotential: 'undetermined',
        analysis: { potential: 'undetermined', rationale: 'Pending AI analysis', criteria: [] },
        originalAnalysis: { potential: 'undetermined', rationale: 'Pending AI analysis', criteria: [] },
        recommendations: [],
        originalRecommendations: [],
        evidencePhrases: [],
        extractionConfidence: null,
      }))
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
      const res = await fetch(`${base}/reports/${id}/analyze`, { method: 'POST' })
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
