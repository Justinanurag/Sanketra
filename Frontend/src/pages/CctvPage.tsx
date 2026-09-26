import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/status/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Callout } from '@/components/ui/Callout'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { UploadCctvModal } from '@/features/cctv/UploadCctvModal'
import { useWorkspace } from '@/hooks/useWorkspace'
import { confirmAction } from '@/lib/dialogs'
import { formatDateTime } from '@/lib/format'
import { labelOf } from '@/constants/labels'
import type { CctvEvent, CctvVideo } from '@/types/domain'

export function CctvPage() {
  const { data, previews, deleteRecord } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(data?.videos[0]?.id ?? '')
  if (!data) return null
  const selected = data.videos.find((video) => video.id === selectedId) ?? data.videos[0] ?? null
  const detections = data.detections.filter((event) => event.videoId === selected?.id)
  const preview = selected ? previews[selected.id] : undefined

  const columns: Column<CctvVideo>[] = [
    { id: 'file', header: 'File', sortValue: (row) => row.filename, render: (row) => <span className="row-title">{row.filename}</span> },
    { id: 'camera', header: 'Camera', sortValue: (row) => row.camera, render: (row) => row.camera },
    { id: 'location', header: 'Location', render: (row) => row.location },
    { id: 'status', header: 'Status', render: (row) => <StatusBadge domain="video" value={row.status} /> },
    { id: 'kind', header: 'Kind', render: (row) => labelOf(row.mediaKind) },
    { id: 'report', header: 'Report', render: (row) => row.reportId ? <Link to={`/reports/${row.reportId}`}>{row.reportId}</Link> : '—' },
    { id: 'when', header: 'Uploaded', sortValue: (row) => row.uploadedAt, render: (row) => formatDateTime(row.uploadedAt) },
  ]

  const detectionColumns: Column<CctvEvent>[] = [
    { id: 'time', header: 'Time', render: (row) => <span className="mono">{row.timestamp}</span> },
    { id: 'object', header: 'Object', render: (row) => row.object },
    { id: 'event', header: 'Event', render: (row) => row.eventType },
    { id: 'zone', header: 'Zone', render: (row) => row.zone },
    { id: 'dwell', header: 'Dwell', render: (row) => (row.dwellSeconds === null ? '—' : `${row.dwellSeconds}s`) },
    { id: 'confidence', header: 'Detection confidence', render: (row) => (row.confidence === null ? '—' : row.confidence.toFixed(2)) },
    { id: 'origin', header: 'Source', render: (row) => <StatusBadge domain="origin" value={row.origin} /> },
  ]

  return (
    <div className="stack">
      <PageHeader
        title="CCTV evidence"
        description="Optional visual evidence. Computer vision can describe objects. It does not decide SIF potential."
        actions={<Button onClick={() => setOpen(true)}>Upload CCTV</Button>}
      />
      <Callout tone="info" title="CCTV evidence is optional">
        A missing camera, a blind spot, or an unprocessed file is not proof that an exposure did not happen. No facial identity processing is performed.
      </Callout>
      <section className="panel">
        <DataTable
          columns={columns}
          rows={data.videos}
          getRowId={(row) => row.id}
          onRowClick={(row) => setSelectedId(row.id)}
          label="CCTV files"
          emptyTitle="No CCTV evidence"
          emptyDescription="Upload a clip when a camera can help check a report. Reports can be reviewed without one."
          emptyAction={<Button onClick={() => setOpen(true)}>Upload CCTV</Button>}
        />
      </section>
      {selected ? (
        <div className="grid-2">
          <section className="panel">
            <header className="panel-header">
              <div>
                <h2>{selected.camera}</h2>
                <p>{selected.location} · {selected.duration}</p>
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
                  <strong>{selected.simulated ? 'Sample record' : 'No playable file in this session'}</strong>
                  <span>{selected.filename}</span>
                </div>
              ) : null}
            </div>
            <p className="panel-note" style={{ marginTop: 12 }}>{selected.note}</p>
          </section>
          <section className="panel">
            <header className="panel-header">
              <div>
                <h2>Detection events</h2>
                <p>AI-detected rows are model output. Human-verified rows were accepted by an officer.</p>
              </div>
            </header>
            {detections.length ? (
              <DataTable columns={detectionColumns} rows={detections} getRowId={(row) => row.id} pageSize={6} label="Detections" />
            ) : (
              <EmptyState title="No detection events" description="This file is stored. Nothing has been detected, and SIF potential is unchanged." />
            )}
          </section>
        </div>
      ) : null}
      <UploadCctvModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
