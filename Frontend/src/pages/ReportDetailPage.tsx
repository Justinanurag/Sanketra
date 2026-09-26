import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/status/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Callout } from '@/components/ui/Callout'
import { DetailList } from '@/components/ui/DetailList'
import { EmptyState } from '@/components/ui/EmptyState'
import { Tabs } from '@/components/ui/Tabs'
import { sifLabel, labelOf } from '@/constants/labels'
import { useWorkspace } from '@/hooks/useWorkspace'
import { confirmAction } from '@/lib/dialogs'
import { formatDateTime, formatPercent } from '@/lib/format'

type TabId = 'overview' | 'barrier' | 'evidence' | 'historical' | 'review'

export function ReportDetailPage() {
  const { reportId = '' } = useParams()
  const navigate = useNavigate()
  const { data, openReportForm, deleteReport } = useWorkspace()
  const [tab, setTab] = useState<TabId>('overview')
  const report = data?.reports.find((item) => item.id === reportId)

  if (!data) return null
  if (!report) {
    return (
      <EmptyState
        title="Report not found"
        description="That identifier is not in the working register."
        action={<Link className="btn btn-secondary" to="/reports">Back to reports</Link>}
      />
    )
  }

  const claims = data.claims.filter((claim) => claim.reportId === report.id)
  const videos = data.videos.filter((video) => video.reportId === report.id)
  const similar = data.similarities[report.id] ?? []
  const review = data.reviews.find((item) => item.reportId === report.id)
  const history = data.audit.filter((entry) => entry.entityId === report.id || entry.newValue.includes(report.id))
  const edited = report.sifPotential !== report.originalAnalysis.potential

  async function onDelete() {
    const confirmed = await confirmAction({
      title: `Delete ${report!.id}?`,
      text: 'The report leaves the working register. The audit entry is kept.',
      confirmText: 'Delete report',
      tone: 'danger',
    })
    if (!confirmed || !report) return
    deleteReport(report.id)
    toast.success('Report deleted', { description: report.id })
    navigate('/reports')
  }

  return (
    <div className="stack">
      <PageHeader
        title={report.title}
        description={`${report.id} · ${report.location} · ${formatDateTime(report.occurredAt)}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => openReportForm(report.id)}>Edit</Button>
            <Button variant="secondary" onClick={() => navigate(`/reviews/${report.id}`)}>Open review</Button>
            <Button variant="danger" onClick={() => void onDelete()}>Delete</Button>
          </>
        }
      />
      <Callout tone="warning" title="Rule result — human review decides">
        Extraction confidence and historical similarity support the review. They are not an accident probability, and they do not close a safety event.
      </Callout>
      <section className="panel">
        <DetailList
          items={[
            { label: 'SIF potential', value: <StatusBadge domain="sif" value={report.sifPotential} /> },
            { label: 'Review', value: <StatusBadge domain="review" value={report.reviewStatus} /> },
            { label: 'Type', value: report.type },
            { label: 'Reporter', value: `${report.reporter} · ${report.reporterRole}` },
            { label: 'Extraction confidence', value: report.extractionConfidence === null ? 'Not run' : formatPercent(report.extractionConfidence / 100) },
          ]}
        />
      </section>
      {edited ? (
        <Callout tone="info" title="Original rule result retained">
          The first classification was {sifLabel[report.originalAnalysis.potential]}. The working record is now {sifLabel[report.sifPotential]} after an edit.
        </Callout>
      ) : null}
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'barrier', label: 'Hazard and barrier' },
          { id: 'evidence', label: 'Evidence' },
          { id: 'historical', label: 'Historical' },
          { id: 'review', label: 'Review and audit' },
        ]}
      />
      {tab === 'overview' ? (
        <div className="grid-2">
          <section className="panel">
            <header className="panel-header"><h2>Incident description</h2></header>
            <p>{report.description}</p>
            {report.notes ? <p className="panel-note" style={{ marginTop: 12 }}>Notes: {report.notes}</p> : null}
          </section>
          <section className="panel">
            <header className="panel-header">
              <div>
                <h2>Why this classification</h2>
                <p>{report.analysis.rationale}</p>
              </div>
            </header>
            <ul className="criteria">
              {report.analysis.criteria.map((criterion) => (
                <li key={criterion.id}>
                  <Badge tone={criterion.met ? 'low' : 'neutral'}>{criterion.met ? 'Met' : 'Not met'}</Badge>
                  <div>
                    <strong>{criterion.label}</strong>
                    <div className="muted">{criterion.detail}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
      {tab === 'barrier' ? (
        <section className="panel">
          <DetailList
            items={[
              { label: 'Hazard', value: report.hazardName },
              { label: 'Energy source', value: report.energySource },
              { label: 'Human exposure', value: report.humanExposure },
              { label: 'Critical barrier', value: report.barrierName },
              { label: 'Barrier status', value: <StatusBadge domain="barrier" value={report.barrierStatus} /> },
              { label: 'Potential consequence', value: report.consequence },
            ]}
          />
          <h3 style={{ margin: '16px 0 8px', fontSize: 13 }}>Controls for the officer to consider</h3>
          <ul className="plain-list">
            {report.recommendations.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
      ) : null}
      {tab === 'evidence' ? (
        <div className="stack">
          <section className="panel">
            <header className="panel-header">
              <div>
                <h2>Evidence phrases</h2>
                <p>Language pulled from the report. A blind camera is not proof that a phrase is false.</p>
              </div>
            </header>
            {report.evidencePhrases.length ? (
              <ul className="phrase-list">
                {report.evidencePhrases.map((phrase) => <li key={phrase}>“{phrase}”</li>)}
              </ul>
            ) : (
              <EmptyState title="No phrases extracted" description="The language service has not structured this narrative. The officer can still review the description." />
            )}
          </section>
          <section className="panel">
            <header className="panel-header">
              <div>
                <h2>CCTV evidence</h2>
                <p>Optional. Object detection does not assign SIF severity.</p>
              </div>
              <Link to="/cctv" className="btn btn-secondary btn-sm">Open CCTV</Link>
            </header>
            {videos.length ? (
              <ul className="plain-list">
                {videos.map((video) => (
                  <li key={video.id}>{video.camera} · {video.filename} · {labelOf(video.status)}{video.simulated ? ' · simulated detections' : ''}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">No camera file is attached. CCTV is optional and a missing file is not evidence of absence.</p>
            )}
          </section>
          <section className="panel">
            <header className="panel-header">
              <div>
                <h2>Claim checks</h2>
                <p>{claims.length ? `${claims.length} claims prepared for this report.` : 'No claim-by-claim check has been prepared.'}</p>
              </div>
              <Link to={`/correlations?report=${report.id}`} className="btn btn-secondary btn-sm">Open correlation</Link>
            </header>
          </section>
        </div>
      ) : null}
      {tab === 'historical' ? (
        <section className="panel">
          <header className="panel-header">
            <div>
              <h2>Similar historical reports</h2>
              <p>Similarity is supporting evidence. It is not a SIF verdict.</p>
            </div>
          </header>
          {similar.length ? (
            <div className="stack">
              {similar.map((item) => (
                <div key={item.id} className="evidence-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <strong className="mono">{item.id}</strong>
                    <span className="badge badge-info">{formatPercent(item.similarity)} similar</span>
                  </div>
                  <p>{item.title}</p>
                  <p className="panel-note">{item.note} Outcome on file: {item.outcome}.</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No comparable reports retrieved" description="Nothing in the archive has been matched to this record yet." />
          )}
        </section>
      ) : null}
      {tab === 'review' ? (
        <div className="stack">
          <section className="panel">
            <header className="panel-header"><h2>Human review</h2></header>
            {review ? (
              <DetailList
                items={[
                  { label: 'Decision', value: <StatusBadge domain="review" value={review.decision} /> },
                  { label: 'Reviewer', value: `${review.reviewer} · ${review.role}` },
                  { label: 'When', value: formatDateTime(review.submittedAt) },
                  { label: 'Comments', value: review.comments },
                ]}
              />
            ) : (
              <EmptyState
                title="No officer decision yet"
                description="The rule result is still waiting. Approve, edit, or reject it from the review screen."
                action={<Button onClick={() => navigate(`/reviews/${report.id}`)}>Open review</Button>}
              />
            )}
          </section>
          <section className="panel">
            <header className="panel-header"><h2>Audit history</h2></header>
            {history.length ? (
              <div className="timeline">
                {history.map((entry, index) => (
                  <div className="timeline-item" key={entry.id}>
                    <div className="timeline-rail">
                      <i />
                      {index < history.length - 1 ? <b /> : null}
                    </div>
                    <div>
                      <strong>{entry.action} · {entry.user}</strong>
                      <p>{formatDateTime(entry.timestamp)} · {entry.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">No audit entries for this report.</p>
            )}
          </section>
        </div>
      ) : null}
    </div>
  )
}
