import type { MonthlyPoint, WorkspaceData } from '@/types/domain'
import { monthLabel } from '@/lib/format'

function countBy<T extends string>(values: T[], order: readonly T[]) {
  return order.map((key) => ({
    key,
    count: values.filter((value) => value === key).length,
  }))
}

export function reportingTrend(reports: WorkspaceData['reports']): MonthlyPoint[] {
  const now = new Date()
  const points: MonthlyPoint[] = []
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const month = monthLabel(date.toISOString())
    const rows = reports.filter((report) => monthLabel(report.occurredAt) === month)
    points.push({
      month,
      reports: rows.length,
      high: rows.filter((report) => report.sifPotential === 'high').length,
    })
  }
  return points
}

export function buildMetrics(data: WorkspaceData) {
  const hazardCounts = new Map<string, number>()
  for (const report of data.reports) {
    const hazard = data.hazards.find((item) => item.id === report.hazardId)
    const name = hazard?.category ?? report.hazardName
    hazardCounts.set(name, (hazardCounts.get(name) ?? 0) + 1)
  }

  return {
    totalReports: data.reports.length,
    highSif: data.reports.filter((report) => report.sifPotential === 'high').length,
    criticalBarriers: data.reports.filter((report) =>
      report.barrierStatus === 'absent' || report.barrierStatus === 'ineffective' || report.barrierStatus === 'bypassed',
    ).length,
    openReviews: data.reports.filter(
      (report) => report.reviewStatus === 'needs_review' || report.reviewStatus === 'in_review',
    ).length,
    recurringHazards: [...hazardCounts.values()].filter((count) => count > 1).length,
    cctvEvents: data.detections.filter((event) => {
      const video = data.videos.find((item) => item.id === event.videoId)
      return !!video?.reportId && data.reports.some((report) => report.id === video.reportId)
    }).length,
    monthly: reportingTrend(data.reports),
    sif: countBy(
      data.reports.map((report) => report.sifPotential),
      ['high', 'medium', 'low', 'undetermined'],
    ),
    hazards: [...hazardCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    barriers: countBy(
      data.reports.map((report) => report.barrierStatus),
      ['present', 'absent', 'ineffective', 'bypassed', 'unknown'],
    ),
    reviews: countBy(
      data.reports.map((report) => report.reviewStatus),
      ['needs_review', 'in_review', 'approved', 'rejected'],
    ),
  }
}

export function latestReview(data: WorkspaceData, reportId: string) {
  return data.reviews.find((review) => review.reportId === reportId) ?? null
}

export function eventForReport(data: WorkspaceData, reportId: string) {
  return data.events.find((event) => event.reportId === reportId) ?? null
}
