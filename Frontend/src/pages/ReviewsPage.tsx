import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/status/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Callout } from '@/components/ui/Callout'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { DetailList } from '@/components/ui/DetailList'
import { EmptyState } from '@/components/ui/EmptyState'
import { Field } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { sifLabel } from '@/constants/labels'
import { useWorkspace } from '@/hooks/useWorkspace'
import { confirmAction, promptReason } from '@/lib/dialogs'
import { formatDateTime } from '@/lib/format'
import { reviewSchema } from '@/lib/schemas'
import type { SafetyReport } from '@/types/domain'

export function ReviewsPage() {
  const navigate = useNavigate()
  const { data } = useWorkspace()
  const [queue, setQueue] = useState('open')
  const rows = useMemo(() => {
    const reports = data?.reports ?? []
    if (queue === 'open') return reports.filter((report) => report.reviewStatus === 'needs_review' || report.reviewStatus === 'in_review')
    return reports.filter((report) => report.reviewStatus === 'approved' || report.reviewStatus === 'rejected')
  }, [data, queue])
  if (!data) return null

  const columns: Column<SafetyReport>[] = [
    { id: 'id', header: 'Report', sortValue: (row) => row.id, render: (row) => <span className="mono">{row.id}</span> },
    { id: 'title', header: 'Title', sortValue: (row) => row.title, render: (row) => <span className="row-title">{row.title}</span> },
    { id: 'sif', header: 'Rule result', render: (row) => <StatusBadge domain="sif" value={row.sifPotential} /> },
    { id: 'review', header: 'Review', render: (row) => <StatusBadge domain="review" value={row.reviewStatus} /> },
    { id: 'barrier', header: 'Barrier', render: (row) => <StatusBadge domain="barrier" value={row.barrierStatus} /> },
  ]

  return (
    <div className="stack">
      <PageHeader
        title="Human review"
        description="Safety officer decisions. The rule result, the evidence, and the explanation stay visible. None of them is the final event."
      />
      <section className="panel">
        <div className="toolbar">
          <Select aria-label="Queue" value={queue} onChange={(event) => setQueue(event.target.value)}>
            <option value="open">Open</option>
            <option value="decided">Decided</option>
          </Select>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          onRowClick={(row) => navigate(`/reviews/${row.id}`)}
          label="Review queue"
          emptyTitle={queue === 'open' ? 'No open reviews' : 'No decisions recorded'}
          emptyDescription={queue === 'open' ? 'Every report in the register has a recorded decision.' : 'Approved and rejected reports will appear here.'}
          emptyAction={<Link className="btn btn-secondary" to="/reports">View reports</Link>}
        />
      </section>
    </div>
  )
}

export function ReviewDetailPage() {
  const { reportId = '' } = useParams()
  const navigate = useNavigate()
  const { data, submitReview, openReportForm } = useWorkspace()
  const report = data?.reports.find((item) => item.id === reportId)
  const latest = data?.reviews.find((item) => item.reportId === reportId)
  const event = data?.events.find((item) => item.reportId === reportId)
  const [revising, setRevising] = useState(false)
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<{ comments: string }>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { comments: '' },
    mode: 'onTouched',
  })

  if (!data) return null
  if (!report) {
    return <EmptyState title="Report not found" description="That review is not in the queue." action={<Link className="btn btn-secondary" to="/reviews">Back to reviews</Link>} />
  }

  const locked = !!latest && !revising

  async function approve(values: { comments: string }) {
    const confirmed = await confirmAction({
      title: `Approve ${report!.id}?`,
      text: 'This records your decision as the final safety event. The original rule result stays attached and is not overwritten.',
      confirmText: 'Approve',
    })
    if (!confirmed || !report) return
    const created = submitReview({ reportId: report.id, decision: 'approved', comments: values.comments })
    if (!created) return
    toast.success('Safety event approved', { description: created.id })
    navigate(`/safety-events/${created.id}`)
  }

  async function reject() {
    if (!report) return
    const reason = await promptReason({
      title: `Reject ${report.id}?`,
      text: 'The report stays in the register. Your reason is stored on the event and in the audit log.',
      confirmText: 'Reject',
      defaultValue: getValues('comments'),
    })
    if (!reason) return
    const created = submitReview({ reportId: report.id, decision: 'rejected', comments: reason })
    if (!created) return
    toast.success('Decision recorded', { description: `${report.id} rejected` })
    navigate(`/safety-events/${created.id}`)
  }

  return (
    <div className="stack">
      <PageHeader
        title="Safety officer review"
        description={`${report.id} · ${report.title}`}
        actions={<Link className="btn btn-secondary" to={`/reports/${report.id}`}>Open full report</Link>}
      />
      <Callout tone="critical" title="AI-assisted analysis is not the decision">
        You are looking at a rule result plus the evidence that supports it. Approve, edit, or reject before a safety event exists.
      </Callout>
      <div className="grid-split">
        <div className="stack">
          <section className="panel">
            <header className="panel-header">
              <div>
                <h2>Rule result</h2>
                <p>Retained from the first classification. Edits do not erase it.</p>
              </div>
              <StatusBadge domain="sif" value={report.originalAnalysis.potential} />
            </header>
            <p>{report.originalAnalysis.rationale}</p>
            <ul className="criteria">
              {report.originalAnalysis.criteria.map((criterion) => (
                <li key={criterion.id}>
                  <strong>{criterion.met ? 'Met' : 'Not met'}</strong>
                  <span>{criterion.label}. {criterion.detail}</span>
                </li>
              ))}
            </ul>
            {report.sifPotential !== report.originalAnalysis.potential ? (
              <p className="panel-note" style={{ marginTop: 12 }}>
                Working record is now {sifLabel[report.sifPotential]} after an edit.
              </p>
            ) : null}
          </section>
          <section className="panel">
            <header className="panel-header"><h2>Evidence in front of you</h2></header>
            <DetailList
              items={[
                { label: 'Hazard', value: report.hazardName },
                { label: 'Exposure', value: report.humanExposure },
                { label: 'Barrier', value: `${report.barrierName}` },
                { label: 'Barrier status', value: <StatusBadge domain="barrier" value={report.barrierStatus} /> },
                { label: 'Consequence', value: report.consequence },
                { label: 'Phrases', value: report.evidencePhrases.length ? report.evidencePhrases.join('; ') : 'None extracted' },
              ]}
            />
          </section>
        </div>
        <section className="panel decision-panel">
          <header className="panel-header">
            <div>
              <h2>Officer decision</h2>
              <p>Required before this becomes a final safety event.</p>
            </div>
          </header>
          {locked && latest ? (
            <div className="stack">
              <DetailList
                items={[
                  { label: 'Decision', value: <StatusBadge domain="review" value={latest.decision} /> },
                  { label: 'Reviewer', value: `${latest.reviewer} · ${latest.role}` },
                  { label: 'When', value: formatDateTime(latest.submittedAt) },
                  { label: 'Comments', value: latest.comments },
                ]}
              />
              {event ? <Link to={`/safety-events/${event.id}`}>Open {event.id}</Link> : null}
              <Button variant="secondary" onClick={() => setRevising(true)}>Record a revised decision</Button>
            </div>
          ) : (
            <form className="stack" onSubmit={handleSubmit(approve)} noValidate>
              <Field label="Comments" htmlFor="review-comments" required error={errors.comments?.message} hint="State what you accepted, what you changed, and why.">
                <Textarea id="review-comments" rows={6} aria-invalid={!!errors.comments} {...register('comments')} />
              </Field>
              <div className="inline-actions">
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Approve'}</Button>
                <Button variant="secondary" onClick={() => openReportForm(report.id)}>Edit</Button>
                <Button variant="danger" onClick={() => void reject()}>Reject</Button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
