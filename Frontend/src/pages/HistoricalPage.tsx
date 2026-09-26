import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/status/StatusBadge'
import { Callout } from '@/components/ui/Callout'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Select'
import { useWorkspace } from '@/hooks/useWorkspace'
import { formatDate, formatPercent } from '@/lib/format'
import type { Hazard, SimilarReport } from '@/types/domain'

export function HistoricalPage() {
  const { data } = useWorkspace()
  const [reportId, setReportId] = useState(data?.reports[0]?.id ?? '')
  const similar = data?.similarities[reportId] ?? []
  const recurringHazards = useMemo(() => (data?.hazards ?? []).filter((hazard) => hazard.recurring), [data])
  const failingBarriers = useMemo(
    () => (data?.barriers ?? []).filter((barrier) => barrier.critical && barrier.status !== 'present'),
    [data],
  )
  if (!data) return null

  const hazardColumns: Column<Hazard>[] = [
    { id: 'name', header: 'Hazard', render: (row) => row.name },
    { id: 'category', header: 'Category', render: (row) => row.category },
    { id: 'archive', header: 'Archive reports', sortValue: (row) => row.archiveCount, render: (row) => row.archiveCount },
    { id: 'severity', header: 'Severity', render: (row) => <StatusBadge domain="severity" value={row.severity} /> },
  ]

  const similarColumns: Column<SimilarReport>[] = [
    { id: 'id', header: 'Archive ID', render: (row) => <span className="mono">{row.id}</span> },
    { id: 'title', header: 'Title', render: (row) => row.title },
    { id: 'score', header: 'Similarity', sortValue: (row) => row.similarity, render: (row) => formatPercent(row.similarity) },
    { id: 'barrier', header: 'Barrier then', render: (row) => <StatusBadge domain="barrier" value={row.barrierStatus} /> },
    { id: 'date', header: 'Date', sortValue: (row) => row.occurredAt, render: (row) => formatDate(row.occurredAt) },
    { id: 'note', header: 'Why it was retrieved', render: (row) => row.note },
  ]

  return (
    <div className="stack">
      <PageHeader
        title="Historical intelligence"
        description="Comparable reports and repeating barrier failures. Similarity supports a review. It is not a SIF verdict."
      />
      <Callout tone="info" title="Supporting evidence only">
        Scores describe how close a past narrative is to the selected report. They are not a probability of harm and they do not approve an event.
      </Callout>
      <div className="grid-2">
        <section className="panel">
          <header className="panel-header">
            <div>
              <h2>Recurring hazards</h2>
              <p>Hazards marked as repeating in the archive.</p>
            </div>
          </header>
          <DataTable columns={hazardColumns} rows={recurringHazards} getRowId={(row) => row.id} pageSize={6} label="Recurring hazards" emptyTitle="No recurring hazards" emptyDescription="None of the current hazards are marked as repeating." />
        </section>
        <section className="panel">
          <header className="panel-header">
            <div>
              <h2>Recurring barrier failures</h2>
              <p>Critical controls that are not currently present and effective.</p>
            </div>
          </header>
          <DataTable
            columns={[
              { id: 'name', header: 'Barrier', render: (row) => row.name },
              { id: 'status', header: 'Status', render: (row) => <StatusBadge domain="barrier" value={row.status} /> },
              { id: 'failures', header: 'Archive failures', sortValue: (row) => row.archiveFailures, render: (row) => row.archiveFailures },
              { id: 'where', header: 'Location', render: (row) => row.location },
            ]}
            rows={failingBarriers}
            getRowId={(row) => row.id}
            pageSize={6}
            label="Barrier failures"
            emptyTitle="No failed critical barriers"
            emptyDescription="Every critical barrier in the register is marked present."
          />
        </section>
      </div>
      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>Comparable reports</h2>
            <p>Retrieved for the selected record. Outcome text is historical, not a recommendation to copy.</p>
          </div>
        </header>
        <div className="toolbar">
          <Select aria-label="Source report" value={reportId} onChange={(event) => setReportId(event.target.value)}>
            {data.reports.map((report) => (
              <option key={report.id} value={report.id}>{report.id} — {report.title}</option>
            ))}
          </Select>
        </div>
        {similar.length ? (
          <DataTable columns={similarColumns} rows={similar} getRowId={(row) => row.id} pageSize={6} label="Similar reports" />
        ) : (
          <EmptyState title="No comparable reports retrieved" description="The archive has no match for this record. That is not evidence the situation is new or safe." />
        )}
      </section>
    </div>
  )
}
