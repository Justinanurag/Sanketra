import type { MonthlyPoint, WorkspaceData } from '@/types/domain'
import { monthLabel } from '@/lib/format'

const ARCHIVE: MonthlyPoint[] = [
  { month: 'Oct 25', reports: 16, high: 2 },
  { month: 'Nov 25', reports: 19, high: 3 },
  { month: 'Dec 25', reports: 14, high: 1 },
  { month: 'Jan 26', reports: 17, high: 2 },
  { month: 'Feb 26', reports: 15, high: 2 },
  { month: 'Mar 26', reports: 21, high: 4 },
  { month: 'Apr 26', reports: 18, high: 3 },
  { month: 'May 26', reports: 20, high: 2 },
  { month: 'Jun 26', reports: 16, high: 3 },
  { month: 'Jul 26', reports: 19, high: 2 },
]

function countBy<T extends string>(values: T[], order: readonly T[]) {
  return order.map((key) => ({
    key,
    count: values.filter((value) => value === key).length,
  }))
}

export function reportingTrend(reports: WorkspaceData['reports']): MonthlyPoint[] {
  const recent = ['Aug 26', 'Sep 26'].map((month) => {
    const rows = reports.filter((report) => monthLabel(report.occurredAt) === month)
    return {
      month,
      reports: rows.length,
      high: rows.filter((report) => report.sifPotential === 'high').length,
    }
  })
  return [...ARCHIVE, ...recent]
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
    criticalBarriers: data.barriers.filter((barrier) => barrier.critical && barrier.status !== 'present').length,
    openReviews: data.reports.filter(
      (report) => report.reviewStatus === 'needs_review' || report.reviewStatus === 'in_review',
    ).length,
    recurringHazards: data.hazards.filter((hazard) => hazard.recurring).length,
    cctvEvents: data.detections.length,
    monthly: reportingTrend(data.reports),
    sif: countBy(
      data.reports.map((report) => report.sifPotential),
      ['high', 'medium', 'low', 'undetermined'],
    ),
    hazards: [...hazardCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    barriers: countBy(
      data.barriers.map((barrier) => barrier.status),
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
