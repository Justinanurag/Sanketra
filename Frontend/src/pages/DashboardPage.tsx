import { Link } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { SafetyReportActions } from '@/features/reports/SafetyReportActions'
import { StatusBadge } from '@/components/status/StatusBadge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { DashboardCharts } from '@/features/dashboard/DashboardCharts'
import { useWorkspace } from '@/hooks/useWorkspace'
import { buildMetrics } from '@/lib/metrics'
import { formatDate } from '@/lib/format'
import type { SafetyReport } from '@/types/domain'

export function DashboardPage() {
  const { data, openReportView } = useWorkspace()
  if (!data) return null
  const metrics = buildMetrics(data)
  const recent = [...data.reports].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 5)

  const columns: Column<SafetyReport>[] = [
    { id: 'id', header: 'Report', sortValue: (row) => row.id, render: (row) => (
      <button type="button" className="text-link mono" onClick={(e) => { e.stopPropagation(); openReportView(row.id); }}>
        {row.id}
      </button>
    )},
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
        actions={<SafetyReportActions />}
      />
      <section className="dash-metrics" aria-label="Register summary">
        <Metric to="/reports" label="Safety reports" value={metrics.totalReports} note="Saved in the register" />
        <Metric to="/reviews" label="High SIF potential" value={metrics.highSif} note="Rule result, not probability" tone="critical" />
        <Metric to="/reports" label="Failed barriers" value={metrics.criticalBarriers} note="Absent, bypassed, or ineffective" tone="warning" />
        <Metric to="/reviews" label="Open reviews" value={metrics.openReviews} note="Waiting on an officer" tone="info" />
        <Metric to="/hazards" label="Repeated hazards" value={metrics.recurringHazards} note="Named on more than one report" />
        <Metric to="/cctv" label="Linked detections" value={metrics.cctvEvents} note="On a report in this register" />
      </section>
      <Attention reports={data.reports} onOpen={openReportView} />
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
          onRowClick={(row) => openReportView(row.id)}
          label="Recent reports"
        />
      </section>
    </div>
  )
}

function Metric({
  to,
  label,
  value,
  note,
  tone,
}: {
  to: string
  label: string
  value: number
  note: string
  tone?: 'critical' | 'warning' | 'info'
}) {
  return (
    <Link to={to} className={tone ? `dash-metric tone-${tone}` : 'dash-metric'}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </Link>
  )
}

function Attention({ reports, onOpen }: { reports: SafetyReport[]; onOpen: (id: string) => void }) {
  const rows = reports
    .filter((report) => report.sifPotential === 'high' || report.reviewStatus === 'needs_review' || report.reviewStatus === 'in_review')
    .slice(0, 4)
  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <h2>Needs attention</h2>
          <p>High-potential reports and reviews that are still open.</p>
        </div>
        <Link to="/reviews" className="btn btn-secondary btn-sm">Open reviews</Link>
      </header>
      {rows.length ? (
        <ul className="attention-list">
          {rows.map((report) => (
            <li key={report.id} onClick={() => onOpen(report.id)} style={{ cursor: 'pointer' }} className="attention-row">
              <div className="attention-info">
                <span className="row-title">{report.title}</span>
                <span className="mono">{report.id}</span>
              </div>
              <StatusBadge domain="sif" value={report.sifPotential} />
              <StatusBadge domain="review" value={report.reviewStatus} />
              <span>{formatDate(report.occurredAt)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="panel-note">Nothing is waiting. New reports appear here until an officer reviews them.</p>
      )}
    </section>
  )
}
