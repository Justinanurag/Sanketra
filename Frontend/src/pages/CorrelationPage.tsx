import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/status/StatusBadge'
import { Callout } from '@/components/ui/Callout'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Select'
import { useWorkspace } from '@/hooks/useWorkspace'
import type { Claim } from '@/types/domain'

export function CorrelationPage() {
  const { data } = useWorkspace()
  const [params, setParams] = useSearchParams()
  const reportId = params.get('report') || data?.reports[0]?.id || ''
  const report = data?.reports.find((item) => item.id === reportId)
  const claims = useMemo(() => (data?.claims ?? []).filter((claim) => claim.reportId === reportId), [data, reportId])
  const similar = data?.similarities[reportId] ?? []
  const videos = (data?.videos ?? []).filter((video) => video.reportId === reportId)
  const event = data?.events.find((item) => item.reportId === reportId)
  if (!data || !report) return <EmptyState title="No report to correlate" description="Create a safety report before comparing evidence." />

  const columns: Column<Claim>[] = [
    { id: 'claim', header: 'Claim', render: (row) => <span className="row-title">{row.claim}</span> },
    { id: 'nlp', header: 'Report evidence', render: (row) => row.nlpEvidence },
    { id: 'history', header: 'Historical evidence', render: (row) => row.historicalEvidence },
    { id: 'cctv', header: 'CCTV evidence', render: (row) => row.cctvEvidence },
    { id: 'state', header: 'Verification', render: (row) => <StatusBadge domain="verification" value={row.verification} /> },
    { id: 'human', header: 'Human check', render: (row) => <StatusBadge domain="human" value={row.humanState} /> },
  ]

  return (
    <div className="stack">
      <PageHeader
        title="Multimodal correlation"
        description="Each claim is checked against the report, the archive, and the camera. A camera blind spot is not observable — it is not proof of absence."
        actions={<Link className="btn btn-primary" to={`/reviews/${report.id}`}>Continue to review</Link>}
      />
      <div className="toolbar">
        <Select
          aria-label="Report"
          value={report.id}
          onChange={(event) => setParams({ report: event.target.value })}
        >
          {data.reports.map((item) => (
            <option key={item.id} value={item.id}>{item.id} — {item.title}</option>
          ))}
        </Select>
      </div>
      <div className="evidence-grid">
        <article className="evidence-card">
          <h3>NLP evidence</h3>
          <p>{report.evidencePhrases.length ? report.evidencePhrases.map((phrase) => `“${phrase}”`).join(' ') : 'No phrases have been extracted. The narrative is still the source.'}</p>
        </article>
        <article className="evidence-card">
          <h3>Historical evidence</h3>
          <p>{similar.length ? `${similar.length} comparable reports retrieved. Highest similarity ${Math.round(Math.max(...similar.map((item) => item.similarity)) * 100)}%.` : 'No comparable reports retrieved.'}</p>
          <p className="panel-note">Retrieved as context. Not a verdict.</p>
        </article>
        <article className="evidence-card">
          <h3>CCTV evidence</h3>
          <p>{videos.length ? videos.map((video) => `${video.camera} · ${video.status}`).join(', ') : 'No camera file is attached. CCTV is optional.'}</p>
          <p className="panel-note">Detections describe objects. They do not set SIF potential.</p>
        </article>
      </div>
      <p className="flow-note">Report narrative, archive matches, and camera evidence feed the claim check. The combined safety event exists only after human review.</p>
      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>Claim-by-claim verification</h2>
            <p>{report.id} · {report.title}</p>
          </div>
        </header>
        {claims.length ? (
          <DataTable columns={columns} rows={claims} getRowId={(row) => row.id} pageSize={8} label="Claims" />
        ) : (
          <EmptyState title="No claims prepared" description="This report has not been broken into claims yet. The officer can still review the narrative." />
        )}
      </section>
      <section className="panel">
        <header className="panel-header"><h2>Combined safety event</h2></header>
        {event ? (
          <Callout tone={event.decision === 'approved' ? 'info' : 'critical'} title={`${event.id} · ${event.decision}`}>
            {event.summary}
          </Callout>
        ) : (
          <Callout tone="warning" title="No combined safety event yet">
            Human review is still open. Correlation does not create the final record. <Link to={`/reviews/${report.id}`}>Open the review</Link>.
          </Callout>
        )}
      </section>
    </div>
  )
}
