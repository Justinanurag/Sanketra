import { useState } from 'react'
import { Camera, Clock, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/status/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Callout } from '@/components/ui/Callout'
import { EmptyState } from '@/components/ui/EmptyState'
import { UploadCctvModal } from '@/features/cctv/UploadCctvModal'
import { labelOf } from '@/constants/labels'
import { useWorkspace } from '@/hooks/useWorkspace'
import { confirmAction } from '@/lib/dialogs'
import { formatDateTime } from '@/lib/format'
import { cx } from '@/lib/cx'

export function CctvPage() {
  const { data, previews, deleteRecord, openReportView } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(data?.videos[0]?.id ?? '')
  if (!data) return null
  const selected = data.videos.find((video) => video.id === selectedId) ?? data.videos[0] ?? null
  const detections = data.detections.filter((event) => event.videoId === selected?.id)
  const preview = selected ? previews[selected.id] : undefined

  return (
    <div className="stack">
      <PageHeader
        title="CCTV evidence"
        description="Optional camera evidence for a report. Object detection describes what is in the frame. It does not decide SIF potential."
        actions={<Button onClick={() => setOpen(true)}>Upload evidence</Button>}
      />
      <Callout tone="info" title="A camera is not required">
        A missing view, a blind spot, or a file that has not been processed is not proof that nobody was exposed. Faces are not identified.
      </Callout>
      {data.videos.length === 0 || !selected ? (
        <section className="panel">
          <EmptyState
            title="No CCTV evidence"
            description="Upload a clip when a camera can help check a report. Reports can be reviewed without one."
            action={<Button onClick={() => setOpen(true)}>Upload evidence</Button>}
          />
        </section>
      ) : (
        <div className="cctv-layout">
          <section className="panel cctv-library" aria-label="Evidence files">
            <header className="panel-header">
              <div>
                <h2>Files</h2>
                <p>{data.videos.length} in this register</p>
              </div>
            </header>
            <div className="cctv-clips">
              {data.videos.map((video) => (
                <button
                  key={video.id}
                  type="button"
                  className={cx('cctv-clip', video.id === selected.id && 'is-selected')}
                  aria-pressed={video.id === selected.id}
                  onClick={() => setSelectedId(video.id)}
                >
                  <span className="cctv-clip-top">
                    <strong>{video.camera}</strong>
                    <StatusBadge domain="video" value={video.status} />
                  </span>
                  <span className="cctv-clip-file">{video.filename}</span>
                  <span className="cctv-clip-meta">
                    <MapPin size={12} aria-hidden />
                    {video.location}
                  </span>
                  <span className="cctv-clip-meta">
                    <Clock size={12} aria-hidden />
                    {video.duration} · {formatDateTime(video.uploadedAt)}
                  </span>
                </button>
              ))}
            </div>
          </section>
          <section className="panel cctv-stage">
            <header className="panel-header">
              <div>
                <h2>{selected.camera}</h2>
                <p>{selected.location}</p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  const confirmed = await confirmAction({
                    title: `Remove ${selected.filename}?`,
                    text: 'The file leaves this session. Linked reports are not deleted.',
                    confirmText: 'Remove file',
                    tone: 'danger',
                  })
                  if (!confirmed) return
                  deleteRecord('videos', selected.id)
                  setSelectedId('')
                  toast.success('Evidence removed')
                }}
              >
                Remove
              </Button>
            </header>
            <div className="video-frame">
              {preview && selected.mediaKind === 'video' ? <video src={preview} controls /> : null}
              {preview && selected.mediaKind === 'image' ? <img src={preview} alt={selected.filename} /> : null}
              {!preview ? (
                <div className="video-meta">
                  <Camera size={28} aria-hidden />
                  <strong>{selected.simulated ? 'Sample record' : 'No playable file in this session'}</strong>
                  <span>{selected.filename}</span>
                </div>
              ) : null}
            </div>
            <dl className="cctv-facts">
              <div>
                <dt>Kind</dt>
                <dd>{labelOf(selected.mediaKind)}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{selected.duration}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd><StatusBadge domain="video" value={selected.status} /></dd>
              </div>
              <div>
                <dt>Uploaded</dt>
                <dd>{formatDateTime(selected.uploadedAt)}</dd>
              </div>
              <div>
                <dt>Report</dt>
                <dd>
                  {selected.reportId ? (
                    <button type="button" className="text-link" onClick={() => openReportView(selected.reportId!)}>
                      {selected.reportId}
                    </button>
                  ) : (
                    'Not linked'
                  )}
                </dd>
              </div>
            </dl>
            <p className="panel-note">{selected.note}</p>
            <div className="cctv-detections">
              <header>
                <h3>Detections</h3>
                <p>AI-detected rows are model output. Human-verified rows were accepted by an officer.</p>
              </header>
              {detections.length ? (
                <ol className="detection-list">
                  {detections.map((event) => (
                    <li key={event.id}>
                      <div className="detection-top">
                        <span className="mono">{event.timestamp}</span>
                        <StatusBadge domain="origin" value={event.origin} />
                      </div>
                      <strong>{event.object} · {event.eventType}</strong>
                      <p>{event.zone}</p>
                      <p className="detection-stats">
                        {event.dwellSeconds === null ? 'Dwell not measured' : `${event.dwellSeconds}s in view`}
                        {' · '}
                        {event.confidence === null ? 'Confidence not stated' : `${Math.round(event.confidence * 100)}% detection confidence`}
                      </p>
                      <p className="panel-note">{event.note}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState title="No detection events" description="This file is stored. Nothing has been detected, and SIF potential is unchanged." />
              )}
            </div>
          </section>
        </div>
      )}
      <UploadCctvModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
