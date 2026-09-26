import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/status/StatusBadge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { DashboardCharts } from '@/features/dashboard/DashboardCharts'
import { useWorkspace } from '@/hooks/useWorkspace'
import { buildMetrics } from '@/lib/metrics'
import { formatDate } from '@/lib/format'
import type { SafetyReport } from '@/types/domain'

export function DashboardPage() {
  const navigate = useNavigate()
  const { data, openReportForm } = useWorkspace()
  if (!data) return null
  const metrics = buildMetrics(data)
  const recent = [...data.reports].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 5)

  const columns: Column<SafetyReport>[] = [
    { id: 'id', header: 'Report', sortValue: (row) => row.id, render: (row) => <span className="mono">{row.id}</span> },
    { id: 'title', header: 'Title', sortValue: (row) => row.title, render: (row) => <span className="row-title">{row.title}</span> },
    { id: 'sif', header: 'SIF potential', render: (row) => <StatusBadge domain="sif" value={row.sifPotential} /> },
    { id: 'review', header: 'Review', render: (row) => <StatusBadge domain="review" value={row.reviewStatus} /> },
    { id: 'date', header: 'Date', sortValue: (row) => row.occurredAt, render: (row) => formatDate(row.occurredAt) },
  ]

  return (
    <div className="stack">
      <PageHeader
        title="Safety intelligence"
        description="Precursor reports, barrier condition, and the reviews still waiting on a safety officer."
        actions={
          <Button onClick={() => openReportForm('new')}>Create safety report</Button>
        }
      />
      <section className="metric-grid" aria-label="Register summary">
        <Metric label="Safety reports" value={metrics.totalReports} note="Current register" />
        <Metric label="High SIF potential" value={metrics.highSif} note="Rule result, not probability" tone="critical" />
        <Metric label="Critical barriers" value={metrics.criticalBarriers} note="Not in a present state" tone="warning" />
        <Metric label="Open reviews" value={metrics.openReviews} note="Needs a human decision" tone="info" />
        <Metric label="Recurring hazards" value={metrics.recurringHazards} note="Seen again in the archive" />
        <Metric label="CCTV events" value={metrics.cctvEvents} note="Detections, not decisions" />
      </section>
      <DashboardCharts metrics={metrics} />
      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>Recent reports</h2>
            <p>Latest items in the working register.</p>
          </div>
          <Link to="/reports" className="btn btn-secondary btn-sm">
            View register
          </Link>
        </header>
        <DataTable
          columns={columns}
          rows={recent}
          getRowId={(row) => row.id}
          pageSize={5}
          onRowClick={(row) => navigate(`/reports/${row.id}`)}
          label="Recent reports"
        />
      </section>
    </div>
  )
}

function Metric({
  label,
  value,
  note,
  tone,
}: {
  label: string
  value: number
  note: string
  tone?: 'critical' | 'warning' | 'info'
}) {
  return (
    <div className={tone ? `metric tone-${tone}` : 'metric'}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  )
}
