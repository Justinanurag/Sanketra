import { workspaceSeed } from '@/data/mock'
import { buildMetrics } from '@/lib/metrics'
import type { WorkspaceData } from '@/types/domain'

const wait = <T,>(value: T, delay = 280) =>
  new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(value), delay)
  })

export async function loadWorkspace() {
  return wait(structuredClone(workspaceSeed))
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
  return wait({ id, ...body, status: 'recorded' as const })
}

export type { WorkspaceData }

// Integration contract for the services that are not connected yet:
// POST /api/reports · GET /api/reports · GET /api/reports/:id
// POST /api/reports/:id/analyze · GET /api/reports/:id/similar
// POST /api/cctv/upload · POST /api/cctv/:id/analyze
// POST /api/correlation/analyze · POST /api/reviews · GET /api/dashboard
