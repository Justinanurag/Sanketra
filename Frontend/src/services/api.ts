import { workspaceSeed } from '@/data/mock'
import { buildMetrics } from '@/lib/metrics'
import type { WorkspaceData } from '@/types/domain'

const wait = <T,>(value: T, delay = 280) =>
  new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(value), delay)
  })

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export async function loadWorkspace(): Promise<WorkspaceData> {
  const seed = structuredClone(workspaceSeed)
  try {
    const res = await fetch(`${API_URL}/reports`)
    if (res.ok) {
      const dbReports = await res.json()
      const mappedReports = dbReports.map((dbReport: any) => ({
        id: dbReport.id.toString(),
        title: dbReport.title,
        description: dbReport.description,
        type: dbReport.report_type,
        occurredAt: dbReport.incident_date,
        location: dbReport.site_location || '',
        reporter: 'Integration User',
        reporterRole: 'Safety Officer',
        hazardName: dbReport.hazard_name || '',
        energySource: dbReport.energy_source || '',
        humanExposure: dbReport.human_exposure || '',
        barrierName: dbReport.barrier_name || '',
        barrierStatus: dbReport.barrier_status || 'unknown',
        consequence: dbReport.consequence || '',
        notes: dbReport.notes || '',
        reviewStatus: 'needs_review',
        sifPotential: 'undetermined',
        analysis: { potential: 'undetermined', rationale: 'Pending AI analysis', criteria: [] },
        originalAnalysis: { potential: 'undetermined', rationale: 'Pending AI analysis', criteria: [] },
        recommendations: [],
        originalRecommendations: [],
        evidencePhrases: [],
        extractionConfidence: null
      }))
      seed.reports = mappedReports
    }
  } catch (error) {
    console.error('Failed to fetch reports from backend:', error)
  }
  return wait(seed)
}

export async function createReportApi(data: any) {
  const res = await fetch(`${API_URL}/reports`, {
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
  try {
    const res = await fetch(`${API_URL}/reports/${id}/analyze`, {
      method: 'POST'
    })
    if (res.ok) {
      const data = await res.json()
      return {
        id,
        sifPotential: data.sif_potential,
        confidence: data.extraction_confidence,
        analysis: data.analysis,
        demo: false
      }
    }
  } catch (err) {
    console.error('Failed to trigger AI analysis:', err)
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
  try {
    const res = await fetch(`${API_URL}/reviews/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (res.ok) {
      const data = await res.json()
      return { id, ...body, event: data.event, status: 'recorded' as const }
    }
  } catch (err) {
    console.error('Failed to submit review to backend:', err)
  }
  return wait({ id, ...body, status: 'recorded' as const })
}

export type { WorkspaceData }

// Integration contract for the services that are not connected yet:
// POST /api/reports · GET /api/reports · GET /api/reports/:id
// POST /api/reports/:id/analyze · GET /api/reports/:id/similar
// POST /api/cctv/upload · POST /api/cctv/:id/analyze
// POST /api/correlation/analyze · POST /api/reviews · GET /api/dashboard
