import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/status/StatusBadge'
import { Callout } from '@/components/ui/Callout'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { DetailList } from '@/components/ui/DetailList'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Select'
import { useWorkspace } from '@/hooks/useWorkspace'
import { formatDateTime } from '@/lib/format'
import type { SafetyEvent } from '@/types/domain'

export function SafetyEventsPage() {
  const navigate = useNavigate()
  const { data } = useWorkspace()
  const [decision, setDecision] = useState('all')
  const rows = useMemo(
    () => (data?.events ?? []).filter((event) => decision === 'all' || event.decision === decision),
    [data, decision],
  )
  if (!data) return null

  const columns: Column<SafetyEvent>[] = [
    { id: 'id', header: 'Event', sortValue: (row) => row.id, render: (row) => <span className="mono">{row.id}</span> },
    { id: 'title', header: 'Title', sortValue: (row) => row.title, render: (row) => <span className="row-title">{row.title}</span> },
    { id: 'decision', header: 'Decision', sortValue: (row) => row.decision, render: (row) => <StatusBadge domain="review" value={row.decision} /> },
    { id: 'sif', header: 'SIF potential', sortValue: (row) => row.sifPotential, render: (row) => <StatusBadge domain="sif" value={row.sifPotential} /> },
    { id: 'barrier', header: 'Barrier', render: (row) => <StatusBadge domain="barrier" value={row.barrierStatus} /> },
    { id: 'reviewer', header: 'Reviewer', sortValue: (row) => row.reviewer, render: (row) => row.reviewer },
    { id: 'when', header: 'Decided', sortValue: (row) => row.decidedAt, render: (row) => formatDateTime(row.decidedAt) },
  ]

  return (
    <div className="stack">
      <PageHeader
        title="Safety events"
        description="Final records created only after a safety officer approves or rejects. The rule result is not an event."
      />
      <section className="panel">
        <div className="toolbar">
          <Select aria-label="Decision" value={decision} onChange={(event) => setDecision(event.target.value)}>
            <option value="all">All decisions</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          onRowClick={(row) => navigate(`/safety-events/${row.id}`)}
          label="Safety events"
          emptyTitle="No safety events"
          emptyDescription="Events appear here after a safety officer records a decision."
          emptyAction={<Link className="btn btn-secondary" to="/reviews">Open the review queue</Link>}
        />
      </section>
    </div>
  )
}

export function SafetyEventDetailPage() {
  const { eventId = '' } = useParams()
  const { data } = useWorkspace()
  const event = data?.events.find((item) => item.id === eventId)
  if (!data) return null
  if (!event) {
    return (
      <EmptyState
        title="Safety event not found"
        description="That event is not in the register."
        action={<Link className="btn btn-secondary" to="/safety-events">Back to events</Link>}
      />
    )
  }
  return (
    <div className="stack">
      <PageHeader
        title={event.title}
        description={`${event.id} · decided ${formatDateTime(event.decidedAt)}`}
        actions={<Link className="btn btn-secondary" to={`/reports/${event.reportId}`}>Open source report</Link>}
      />
      <Callout tone={event.decision === 'approved' ? 'info' : 'critical'} title={event.decision === 'approved' ? 'Approved by a safety officer' : 'Rejected — not a closed event'}>
        {event.decision === 'approved'
          ? 'This is the final record. The original rule result remains on the source report.'
          : 'The officer sent this back. It is not an approved safety event.'}
      </Callout>
      <section className="panel">
        <DetailList
          items={[
            { label: 'Decision', value: <StatusBadge domain="review" value={event.decision} /> },
            { label: 'SIF potential', value: <StatusBadge domain="sif" value={event.sifPotential} /> },
            { label: 'Hazard', value: event.hazardName },
            { label: 'Barrier', value: <StatusBadge domain="barrier" value={event.barrierStatus} /> },
            { label: 'Reviewer', value: event.reviewer },
            { label: 'Evidence used', value: event.evidenceSources.join(' · ') },
            { label: 'Officer summary', value: event.summary },
          ]}
        />
      </section>
    </div>
  )
}
